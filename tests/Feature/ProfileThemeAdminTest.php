<?php

use App\Models\Moment;
use App\Models\Prompt;
use App\Models\Space;
use App\Models\User;
use App\Services\SpaceCalendar;
use Database\Seeders\PromptLibrarySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

uses(Tests\TestCase::class, RefreshDatabase::class);

// ── Birthday on the profile / วันเกิดในโปรไฟล์ ──────────────────────────

test('birthday is saved on the profile and shows in every space, age only if allowed', function () {
    $this->travelTo(Carbon::parse('2026-11-01 09:00', 'Asia/Bangkok'));
    [$a, $b, $c] = User::factory()->count(3)->create();
    $ab = Space::factory()->withMembers($a, $b)->create();
    $ac = Space::factory()->withMembers($a, $c)->create();

    $this->actingAs($a)->patch(route('profile.update'), [
        'name' => $a->name, 'email' => $a->email, 'birthday' => '1996-11-20', 'show_age' => '0',
    ])->assertSessionHasNoErrors();
    expect($a->fresh()->birthday->toDateString())->toBe('1996-11-20');

    $cal = app(SpaceCalendar::class);
    foreach ([$ab, $ac] as $space) {
        $o = collect($cal->upcoming($space))->firstWhere('kind', 'birthday');
        expect($o['date'])->toBe('2026-11-20')->and($o['years'])->toBe(0)->and($o['user_id'])->toBe($a->id);
    }

    $a->update(['show_age' => true]);
    expect(collect($cal->upcoming($ab))->firstWhere('kind', 'birthday')['years'])->toBe(30);
});

test('a birthday in the future is rejected', function () {
    $a = User::factory()->create();

    $this->actingAs($a)->patch(route('profile.update'), ['name' => $a->name, 'email' => $a->email, 'birthday' => now()->addDay()->toDateString()])
        ->assertSessionHasErrors('birthday');
});

test('space dates can no longer be of kind birthday', function () {
    [$a, $b] = User::factory()->count(2)->create();
    $space = Space::factory()->withMembers($a, $b)->create();

    $this->actingAs($a)->post(route('spaces.events.store', $space), ['title' => 'x', 'date' => '2020-01-01', 'kind' => 'birthday'])
        ->assertSessionHasErrors('kind');
});

// ── Moments ↔ our dates / ช่วงเวลา ↔ วันสำคัญ ───────────────────────────

test('mark a moment as a new date, or attach it to the anniversary, or unlink', function () {
    [$a, $b] = User::factory()->count(2)->create();
    $space = Space::factory()->withMembers($a, $b)->create();
    $m = $space->moments()->create(['user_id' => $a->id, 'body' => 'x', 'status' => 'posted', 'posted_at' => now()]);
    $url = route('spaces.moments.date', [$space, $m]);

    $this->actingAs($b)->put($url, ['mode' => 'new', 'title' => 'First concert', 'date' => '2026-11-09'])->assertSessionHasNoErrors();
    expect($m->fresh()->event->title)->toBe('First concert')->and($m->fresh()->event->repeats_yearly)->toBeTrue();

    $this->actingAs($a)->patch(route('spaces.update', $space), ['timezone' => 'Asia/Bangkok', 'anniversary_on' => '2022-05-01']);
    $anniversary = $space->anniversary();
    $this->actingAs($a)->put($url, ['mode' => 'existing', 'event_id' => $anniversary->id])->assertSessionHasNoErrors();
    expect($m->fresh()->space_event_id)->toBe($anniversary->id);

    $this->actingAs($a)->put($url, ['mode' => 'none']);
    expect($m->fresh()->space_event_id)->toBeNull();
});

test('wall: cannot attach a moment to another space\'s date; drafts cannot be marked', function () {
    [$a, $b, $c] = User::factory()->count(3)->create();
    $ab = Space::factory()->withMembers($a, $b)->create();
    $ac = Space::factory()->withMembers($a, $c)->create();
    $acDate = $ac->events()->create(['title' => 'AC only', 'date' => '2024-01-01', 'kind' => 'special']);
    $m = $ab->moments()->create(['user_id' => $a->id, 'body' => 'x', 'status' => 'posted', 'posted_at' => now()]);
    $draft = $ab->moments()->create(['user_id' => $a->id, 'body' => 'd', 'status' => 'draft']);

    $this->actingAs($a)->put(route('spaces.moments.date', [$ab, $m]), ['mode' => 'existing', 'event_id' => $acDate->id])
        ->assertSessionHasErrors('event_id');
    $this->actingAs($a)->put(route('spaces.moments.date', [$ab, $draft]), ['mode' => 'none'])->assertNotFound();
});

test('memories: moments of a yearly date come back on that date in later years', function () {
    $this->travelTo(Carbon::parse('2025-11-09 19:00', 'Asia/Bangkok'));
    [$a, $b] = User::factory()->count(2)->create();
    $space = Space::factory()->withMembers($a, $b)->create();
    $date = $space->events()->create(['title' => 'First date', 'date' => '2023-11-09', 'kind' => 'special', 'repeats_yearly' => true]);
    $space->moments()->create(['user_id' => $a->id, 'space_event_id' => $date->id, 'body' => 'café', 'status' => 'posted', 'posted_at' => now()]);
    $space->moments()->create(['user_id' => $a->id, 'space_event_id' => $date->id, 'body' => 'draft', 'status' => 'draft']);

    $cal = app(SpaceCalendar::class);
    expect($cal->memories($space, Carbon::parse('2025-11-09', 'Asia/Bangkok')))->toBe([]);   // same day: not a memory yet

    $this->travelTo(Carbon::parse('2026-11-09 08:00', 'Asia/Bangkok'));
    $mem = $cal->memories($space, $space->today());
    expect($mem)->toHaveCount(1)->and($mem[0]['body'])->toBe('café')->and($mem[0]['years_ago'])->toBe(1);

    $props = $this->actingAs($b)->get(route('spaces.daily', $space))->viewData('page')['props'];
    expect($props['memories'])->toHaveCount(1);
});

test('the anniversary can only be changed in settings', function () {
    [$a, $b] = User::factory()->count(2)->create();
    $space = Space::factory()->withMembers($a, $b)->create();
    $ann = $space->events()->create(['title' => 'anniversary', 'date' => '2022-01-01', 'kind' => 'anniversary', 'repeats_yearly' => true]);

    $this->actingAs($a)->delete(route('spaces.events.destroy', [$space, $ann]))->assertStatus(422);
});

// ── Themes / ธีม ─────────────────────────────────────────────────

test('blush is the default theme; each person keeps their own', function () {
    [$a, $b] = User::factory()->count(2)->create();

    $this->get('/')->assertSee('data-theme="blush"', false);

    $this->actingAs($a)->put(route('theme.update'), ['theme' => 'candle'])->assertRedirect();
    expect($a->fresh()->theme)->toBe('candle')->and($b->fresh()->theme)->toBe('blush');

    $this->actingAs($a)->get(route('profile.edit'))->assertSee('data-theme="candle"', false)->assertSee('class="dark"', false);
    $this->actingAs($b)->get(route('profile.edit'))->assertSee('data-theme="blush"', false);

    $this->actingAs($a)->put(route('theme.update'), ['theme' => 'neon'])->assertSessionHasErrors('theme');
});

// ── Admin: prompt library / แอดมิน ────────────────────────────────────

test('non-admins get 404 everywhere in admin', function () {
    $u = User::factory()->create();
    $p = Prompt::create(['kind' => 'question', 'tag' => 'fun', 'text_en' => 'x']);

    $this->actingAs($u)->get(route('admin.prompts.index'))->assertNotFound();
    $this->actingAs($u)->post(route('admin.prompts.store'), ['kind' => 'question', 'tag' => 'fun', 'text_en' => 'y'])->assertNotFound();
    $this->actingAs($u)->patch(route('admin.prompts.update', $p), ['kind' => 'question', 'tag' => 'fun', 'text_en' => 'z'])->assertNotFound();
    auth()->logout();
    $this->get(route('admin.prompts.index'))->assertRedirect(route('login'));
});

test('admins can add, edit, filter and (de)activate library prompts', function () {
    $admin = User::factory()->create();
    $admin->forceFill(['is_admin' => true])->save();

    $this->actingAs($admin)->post(route('admin.prompts.store'), ['kind' => 'quest', 'tag' => 'deep', 'text_th' => 'ไปเดินตลาดนัดด้วยกัน'])->assertSessionHasNoErrors();
    $p = Prompt::first();
    expect($p->space_id)->toBeNull()->and($p->kind)->toBe('quest');

    $this->actingAs($admin)->patch(route('admin.prompts.update', $p), ['kind' => 'quest', 'tag' => 'deep', 'text_th' => 'ไปเดินตลาดนัดด้วยกัน', 'text_en' => 'Visit a market together.', 'active' => false]);
    expect($p->fresh()->text_en)->toBe('Visit a market together.')->and($p->fresh()->active)->toBeFalse();

    $page = $this->actingAs($admin)->get(route('admin.prompts.index', ['kind' => 'quest', 'status' => 'inactive']))->assertOk()->viewData('page');
    expect($page['props']['prompts']['data'])->toHaveCount(1);

    $this->actingAs($admin)->post(route('admin.prompts.store'), ['kind' => 'question', 'tag' => 'fun'])->assertSessionHasErrors();
});

test('admin never sees couple-written prompts, and used prompts are deactivated instead of deleted', function () {
    $admin = User::factory()->create();
    $admin->forceFill(['is_admin' => true])->save();
    [$a, $b] = User::factory()->count(2)->create();
    $space = Space::factory()->withMembers($a, $b)->create();
    $private = $space->customPrompts()->create(['kind' => 'question', 'text_th' => 'ความลับของเรา', 'created_by' => $a->id]);
    $used = Prompt::create(['kind' => 'question', 'tag' => 'fun', 'text_en' => 'used one']);
    $space->dailyPrompts()->create(['prompt_id' => $used->id, 'date' => '2026-11-01']);

    $page = $this->actingAs($admin)->get(route('admin.prompts.index'))->viewData('page');
    expect(json_encode($page['props']))->not->toContain('ความลับของเรา');
    $this->actingAs($admin)->patch(route('admin.prompts.update', $private), ['kind' => 'question', 'tag' => 'fun', 'text_en' => 'x'])->assertNotFound();

    $this->actingAs($admin)->delete(route('admin.prompts.destroy', $used));
    expect($used->fresh())->not->toBeNull()->and($used->fresh()->active)->toBeFalse();
});

test('admin-added library prompts do not show an author to couples', function () {
    $admin = User::factory()->create();
    $admin->forceFill(['is_admin' => true])->save();
    [$a, $b] = User::factory()->count(2)->create();
    $this->travelTo(Carbon::parse('2026-11-11 10:00', 'Asia/Bangkok'));
    $space = Space::factory()->withMembers($a, $b)->create();
    $this->actingAs($admin)->post(route('admin.prompts.store'), ['kind' => 'question', 'tag' => 'fun', 'text_en' => 'From the library']);

    $day = $this->actingAs($a)->get(route('spaces.daily', $space))->viewData('page')['props']['days'][0];
    expect($day['text'])->toBe('From the library')->and($day['written_by'])->toBeNull();
});

test('the library seeder only adds new prompts and never overwrites admin edits', function () {
    $this->seed(PromptLibrarySeeder::class);
    $count = Prompt::count();
    $first = Prompt::where('key', 'q001')->first();
    $first->update(['text_th' => 'แก้โดยแอดมิน']);

    $this->seed(PromptLibrarySeeder::class);

    expect(Prompt::count())->toBe($count)->and($first->fresh()->text_th)->toBe('แก้โดยแอดมิน');
});

test('rao:admin grants and revokes admin', function () {
    $u = User::factory()->create(['email' => 'boss@rao.test']);

    $this->artisan('rao:admin', ['email' => 'boss@rao.test'])->assertSuccessful();
    expect($u->fresh()->is_admin)->toBeTrue();
    $this->artisan('rao:admin', ['email' => 'boss@rao.test', '--revoke' => true]);
    expect($u->fresh()->is_admin)->toBeFalse();
});
