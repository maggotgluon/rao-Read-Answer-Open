<?php

use App\Models\Achievement;
use App\Models\DailyPrompt;
use App\Models\Feature;
use App\Models\Moment;
use App\Models\Prompt;
use App\Models\Space;
use App\Models\User;
use App\Services\Achievements;
use App\Support\Features;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

// Feature switches are cached in a static for 30 s. / ล้างแคชสวิตช์ฟีเจอร์
beforeEach(fn () => Features::flush());

function achCouple(string $paired = '2026-11-01 09:00'): array
{
    test()->travelTo(Carbon::parse($paired, 'Asia/Bangkok'));
    [$a, $b] = User::factory()->count(2)->create();
    $space = Space::factory()->withMembers($a, $b)->create();

    return [$space, $a, $b];
}

/** Both partners answered on each of these dates. */
function bothWrote(Space $space, array $dates, User $a, User $b): void
{
    foreach ($dates as $i => $date) {
        $p = Prompt::create(['key' => "ach-$date-$i", 'kind' => 'question', 'tag' => 'fun', 'text_en' => 'Q', 'text_th' => 'Q']);
        $d = $space->dailyPrompts()->create(['date' => $date, 'prompt_id' => $p->id, 'slot' => DailyPrompt::MAIN]);
        $d->answers()->create(['user_id' => $a->id, 'body' => 'a']);
        $d->answers()->create(['user_id' => $b->id, 'body' => 'b']);
    }
}

function keys(Space $space): array
{
    return $space->achievements()->orderBy('key')->pluck('key')->all();
}

test('a 7-day streak earns first_letter + streak_7, once', function () {
    [$space, $a, $b] = achCouple();
    test()->travelTo(Carbon::parse('2026-11-07 20:00', 'Asia/Bangkok'));
    bothWrote($space, array_map(fn ($d) => sprintf('2026-11-%02d', $d), range(1, 7)), $a, $b);

    $new = app(Achievements::class)->check($space);
    expect($new)->toContain('first_letter', 'streak_7')->not->toContain('letters_10');
    expect(app(Achievements::class)->check($space))->toBe([]);   // never twice / ไม่ซ้ำ
});

test('stamps are never taken away when the streak breaks', function () {
    [$space, $a, $b] = achCouple();
    test()->travelTo(Carbon::parse('2026-11-07 20:00', 'Asia/Bangkok'));
    bothWrote($space, array_map(fn ($d) => sprintf('2026-11-%02d', $d), range(1, 7)), $a, $b);
    app(Achievements::class)->check($space);

    test()->travelTo(Carbon::parse('2026-11-25 20:00', 'Asia/Bangkok'));   // long gap, streak is 0
    app(Achievements::class)->check($space);
    expect(keys($space))->toContain('streak_7');
});

test('postcards, places, days together and anniversary years', function () {
    [$space, $a] = achCouple('2025-08-01 09:00');
    $space->events()->create(['kind' => 'anniversary', 'title' => 'a', 'date' => '2024-03-01', 'repeats_yearly' => true, 'created_by' => $a->id]);
    $space->moments()->create(['user_id' => $a->id, 'body' => 'x', 'status' => Moment::STATUS_POSTED, 'posted_at' => now()]);
    $space->places()->create(['name' => 'Beach', 'kind' => 'trip']);

    test()->travelTo(Carbon::parse('2026-11-13 10:00', 'Asia/Bangkok'));
    app(Achievements::class)->check($space);

    expect(keys($space))->toContain('first_postcard', 'first_place', 'days_100', 'days_365', 'years_1', 'years_2')
        ->not->toContain('days_1000', 'years_3', 'postcards_10');
});

test('posting a postcard through the app awards and pushes a stamp to both', function () {
    [$space, $a, $b] = achCouple();
    Illuminate\Support\Facades\Queue::fake();
    foreach ([$a, $b] as $u) {
        $u->pushSubscriptions()->create(['endpoint' => "https://push.example/{$u->id}", 'endpoint_hash' => hash('sha256', "https://push.example/{$u->id}"), 'public_key' => 'k', 'auth_token' => 't']);
    }
    $this->actingAs($a)->post(route('spaces.moments.store', $space), ['body' => 'zebra-secret-words', 'publish' => true])->assertRedirect();
    expect(keys($space))->toBe(['first_postcard']);

    $stamp = Illuminate\Support\Facades\Queue::pushed(App\Jobs\SendPush::class)
        ->filter(fn ($j) => str_starts_with($j->payload['tag'], 'achievements'));
    expect($stamp->pluck('userId')->sort()->values()->all())->toBe([$a->id, $b->id])
        ->and(json_encode($stamp->first()->payload))->not->toContain('zebra');
});

test('the sheet shows earned + next steps; the celebration shows until each person has seen it', function () {
    [$space, $a, $b] = achCouple();
    test()->travelTo(Carbon::parse('2026-11-03 20:00', 'Asia/Bangkok'));
    bothWrote($space, ['2026-11-01', '2026-11-02', '2026-11-03'], $a, $b);
    app(Achievements::class)->check($space);

    $this->actingAs($a)->get(route('spaces.show', $space))->assertInertia(fn ($page) => $page
        ->where('achievements.earned.0.key', 'first_letter')
        ->where('achievements.earned.0.new', true)
        ->where('achievements.next.0', ['key' => 'streak_7', 'group' => 'streak', 'n' => 7, 'have' => 3])
        ->where('newAchievements.0.key', 'first_letter'));

    $this->actingAs($a)->post(route('spaces.achievements.seen', $space))->assertRedirect();
    $this->actingAs($a)->get(route('spaces.daily', $space))->assertInertia(fn ($page) => $page->where('newAchievements', []));
    // the partner still gets theirs / คู่ยังเห็นของตัวเอง
    $this->actingAs($b)->get(route('spaces.daily', $space))->assertInertia(fn ($page) => $page->where('newAchievements.0.key', 'first_letter'));
});

test('outsiders can\'t see or mark stamps; feature off = nothing', function () {
    [$space, $a] = achCouple();
    $space->achievements()->create(['key' => 'first_letter', 'earned_at' => now(), 'seen_by' => []]);
    $c = User::factory()->create();
    $this->actingAs($c)->post(route('spaces.achievements.seen', $space))->assertNotFound();

    Feature::updateOrCreate(['key' => 'achievements'], ['enabled' => false, 'tier' => 'free']);
    Features::flush();
    $this->actingAs($a)->get(route('spaces.show', $space))->assertInertia(fn ($page) => $page
        ->where('achievements', null)->where('newAchievements', []));
    expect(app(Achievements::class)->check($space))->toBe([]);
});

test('the hourly prompt command also checks stamps', function () {
    [$space] = achCouple('2026-07-01 09:00');
    test()->travelTo(Carbon::parse('2026-11-13 10:00', 'Asia/Bangkok'));
    $this->artisan('prompts:assign')->assertSuccessful();
    expect(Achievement::where('space_id', $space->id)->pluck('key')->all())->toContain('days_100');
});

test('stamp and place pictures take the theme colour (mono) in every theme', function () {
    foreach (App\Support\Themes::all() as $id => $theme) {
        expect($theme['assets']['achievements.streak']['mono'] ?? null)->toBeTrue("{$id}: achievements")
            ->and($theme['assets']['places.met']['mono'] ?? null)->toBeTrue("{$id}: places");
    }
});
