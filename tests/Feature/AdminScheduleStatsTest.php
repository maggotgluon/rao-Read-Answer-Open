<?php

use App\Models\DailyPrompt;
use App\Models\Feature;
use App\Models\Prompt;
use App\Models\ScheduledPrompt;
use App\Models\Space;
use App\Models\SpecialDay;
use App\Models\User;
use App\Services\DailyPrompts;
use App\Services\SpaceCalendar;
use App\Support\Features;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(fn () => Features::flush());

function schedAdmin(): User
{
    $u = User::factory()->create();
    $u->forceFill(['is_admin' => true])->save();

    return $u;
}

function schedPair(): array
{
    [$a, $b] = User::factory()->count(2)->create(['locale' => 'en']);

    return [Space::factory()->withMembers($a, $b)->create(), $a, $b];
}

beforeEach(function () {
    $this->travelTo(Carbon::parse('2026-11-11 09:00', 'Asia/Bangkok'));   // Wednesday
    foreach (range(1, 5) as $i) {
        Prompt::create(['kind' => 'question', 'text_en' => "Library {$i}?"]);
    }
});

test('admin schedules a new question for a date; it becomes that day\'s prompt everywhere', function () {
    $this->actingAs(schedAdmin())->post(route('admin.schedule.store'), [
        'date' => '2026-11-14', 'audience' => 'all', 'kind' => 'question', 'text_en' => 'Valentine question?',
    ])->assertSessionHasNoErrors();
    [$s1] = schedPair();
    [$s2] = schedPair();
    $daily = app(DailyPrompts::class);

    // Never handed out early. / ไม่ถูกสุ่มไปใช้ก่อนวัน
    foreach (range(0, 2) as $i) {
        expect($daily->forDate($s1, $s1->today()->addDays($i))->prompt->text_en)->not->toBe('Valentine question?');
    }

    $this->travelTo(Carbon::parse('2026-11-14 08:00', 'Asia/Bangkok'));
    expect($daily->forDate($s2, $s2->today())->prompt->text_en)->toBe('Valentine question?')
        ->and($daily->forDate($s2, $s2->today())->slot)->toBe('main');
});

test('couple\'s own question wins the day; the admin one shows too as a bonus that does not count for the streak', function () {
    [$space, $a, $b] = schedPair();
    $space->customPrompts()->create(['kind' => 'question', 'text_en' => 'Our own?', 'created_by' => $a->id]);
    $p = Prompt::create(['kind' => 'question', 'text_en' => 'Admin day?']);
    ScheduledPrompt::create(['date' => '2026-11-11', 'prompt_id' => $p->id, 'audience' => 'all']);

    $days = $this->actingAs($a)->get(route('spaces.daily', $space))->viewData('page')['props']['days'];
    $today = collect($days)->where('date', '2026-11-11');
    expect($today->pluck('text')->all())->toBe(['Our own?', 'Admin day?'])
        ->and($today->pluck('bonus')->all())->toBe([false, true]);

    // Both answer only the bonus → no streak. Answer the main → streak 1.
    $bonus = DailyPrompt::where('slot', 'bonus')->first();
    $main = DailyPrompt::where('slot', 'main')->whereDate('date', '2026-11-11')->first();
    foreach ([$a, $b] as $u) {
        $this->actingAs($u)->post(route('spaces.answers.store', [$space, $bonus]), ['body' => 'x']);
    }
    expect(app(DailyPrompts::class)->streak($space)['count'])->toBe(0);
    foreach ([$a, $b] as $u) {
        $this->actingAs($u)->post(route('spaces.answers.store', [$space, $main]), ['body' => 'y']);
    }
    expect(app(DailyPrompts::class)->streak($space)['count'])->toBe(1);
});

test('audience: a long-distance-only schedule reaches only long-distance couples', function () {
    $p = Prompt::create(['kind' => 'question', 'text_en' => 'Miss me?']);
    ScheduledPrompt::create(['date' => '2026-11-11', 'prompt_id' => $p->id, 'audience' => 'long_distance']);
    [$near] = schedPair();
    [$far] = schedPair();
    $far->forceFill(['long_distance' => true])->save();
    $daily = app(DailyPrompts::class);

    expect($daily->forDate($far, $far->today())->prompt->text_en)->toBe('Miss me?')
        ->and($daily->forDate($near, $near->today())->prompt->text_en)->not->toBe('Miss me?');
});

test('special days show in every space\'s calendar, yearly', function () {
    $this->actingAs(schedAdmin())->post(route('admin.days.store'), ['date' => '2025-02-14', 'title_en' => "Valentine's Day", 'title_th' => 'วันวาเลนไทน์', 'emoji' => '💘', 'repeats_yearly' => true])
        ->assertSessionHasNoErrors();
    [$space] = schedPair();

    $occ = app(SpaceCalendar::class)->occurrences($space, Carbon::parse('2027-02-01'), Carbon::parse('2027-02-28'));
    expect($occ->firstWhere('kind', 'site')['title'])->toBe("💘 Valentine's Day")
        ->and($occ->firstWhere('kind', 'site')['date'])->toBe('2027-02-14');

    SpecialDay::first()->update(['active' => false]);
    expect(app(SpaceCalendar::class)->occurrences($space, Carbon::parse('2027-02-01'), Carbon::parse('2027-02-28'))->where('kind', 'site'))->toHaveCount(0);
});

test('schedule rules: no past dates, one per date and audience, needs text', function () {
    $admin = schedAdmin();
    $this->actingAs($admin)->post(route('admin.schedule.store'), ['date' => '2026-11-01', 'audience' => 'all', 'kind' => 'question', 'text_en' => 'x'])->assertSessionHasErrors('date');
    $this->actingAs($admin)->post(route('admin.schedule.store'), ['date' => '2026-12-01', 'audience' => 'all', 'kind' => 'question'])->assertSessionHasErrors('text_th');
    $this->actingAs($admin)->post(route('admin.schedule.store'), ['date' => '2026-12-01', 'audience' => 'all', 'prompt_id' => Prompt::first()->id])->assertSessionHasNoErrors();
    $this->actingAs($admin)->post(route('admin.schedule.store'), ['date' => '2026-12-01', 'audience' => 'all', 'prompt_id' => Prompt::find(2)->id])->assertSessionHasErrors('date');
    $this->actingAs($admin)->post(route('admin.schedule.store'), ['date' => '2026-12-01', 'audience' => 'long_distance', 'prompt_id' => Prompt::find(2)->id])->assertSessionHasNoErrors();
});

test('all admin pages are 404 for non-admins', function () {
    $u = User::factory()->create();
    [$space] = schedPair();
    foreach (['admin.dashboard', 'admin.users.index', 'admin.features.index', 'admin.schedule.index'] as $r) {
        $this->actingAs($u)->get(route($r))->assertNotFound();
    }
    $this->actingAs($u)->put(route('admin.spaces.premium', $space), ['on' => true])->assertNotFound();
    $this->actingAs($u)->post(route('admin.days.store'), ['date' => '2026-02-14', 'title_en' => 'x'])->assertNotFound();
});

test('dashboard and user list: numbers only — no answers, moments, ratings per person or locations', function () {
    [$space, $a, $b] = schedPair();
    $a->forceFill(['share_location' => true, 'loc_lat' => 18.8, 'loc_lng' => 99.0, 'loc_city' => 'SecretTown'])->save();
    $d = app(DailyPrompts::class)->forDate($space, $space->today());
    $d->answers()->create(['user_id' => $a->id, 'body' => 'my private answer']);
    $d->ratings()->create(['user_id' => $a->id, 'value' => -1]);
    $space->moments()->create(['user_id' => $b->id, 'body' => 'private moment', 'status' => 'posted', 'posted_at' => now()]);
    $admin = schedAdmin();

    $dash = $this->actingAs($admin)->get(route('admin.dashboard'))->assertOk()->viewData('page')['props']['stats'];
    expect($dash['users']['total'])->toBe(3)->and($dash['spaces']['paired'])->toBe(1)
        ->and($dash['engagement']['moments_7d'])->toBe(1)
        ->and($dash['prompts']['worst'][0]['down'])->toBe(1)
        ->and($dash['users']['location_on'])->toBe(1);

    $users = $this->actingAs($admin)->get(route('admin.users.index'))->assertOk()->viewData('page')['props'];
    $all = json_encode([$dash, $users]);
    expect($all)->not->toContain('my private answer')->not->toContain('private moment')
        ->not->toContain('SecretTown')->not->toContain('18.8');
});

test('admin gives premium to a space; premium features then work there', function () {
    [$space, $a] = schedPair();
    Feature::create(['key' => 'photos', 'enabled' => true, 'tier' => 'premium']);
    expect(Features::on('photos', $space))->toBeFalse();

    $this->actingAs(schedAdmin())->put(route('admin.spaces.premium', $space), ['on' => true])->assertRedirect();
    expect(Features::on('photos', $space->fresh()))->toBeTrue();
});

test('activity is tracked as dates only, at most every 5 minutes', function () {
    $u = User::factory()->create(['analytics_consent_at' => now()]);   // activity days need consent
    $this->actingAs($u)->get(route('profile.edit'));
    $first = $u->fresh()->last_seen_at;
    $this->travel(2)->minutes();
    $this->actingAs($u->fresh())->get(route('profile.edit'));

    expect($u->fresh()->last_seen_at->equalTo($first))->toBeTrue()
        ->and(DB::table('activity_days')->where('user_id', $u->id)->count())->toBe(1);
});

test('admin prompt list shows 👍/👎 totals and can sort worst first', function () {
    [$space, $a, $b] = schedPair();
    $d = app(DailyPrompts::class)->forDate($space, $space->today());
    $d->ratings()->create(['user_id' => $a->id, 'value' => -1]);
    $d->ratings()->create(['user_id' => $b->id, 'value' => -1]);

    $list = $this->actingAs(schedAdmin())->get(route('admin.prompts.index', ['sort' => 'worst']))->viewData('page')['props']['prompts']['data'];
    expect($list[0]['id'])->toBe($d->prompt_id)->and($list[0]['down'])->toBe(2)->and($list[0]['uses'])->toBe(1);
});
