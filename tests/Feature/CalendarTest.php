<?php

use App\Models\Prompt;
use App\Models\Space;
use App\Models\SpaceEvent;
use App\Models\User;
use App\Services\DailyPrompts;
use App\Services\SpaceCalendar;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

function at(string $when): Carbon
{
    return Carbon::parse($when, 'Asia/Bangkok');
}

/** @return array{0: Space, 1: User, 2: User} */
function calCouple(string $pairedAt = '2026-11-02 08:00'): array
{
    foreach (range(1, 20) as $i) {
        Prompt::create(['key' => "q$i", 'kind' => 'question', 'text_en' => "Q$i"]);
        Prompt::create(['key' => "x$i", 'kind' => 'quest', 'text_en' => "X$i"]);
    }
    test()->travelTo(at($pairedAt));
    [$a, $b] = User::factory()->count(2)->create();

    return [Space::factory()->withMembers($a, $b)->create(), $a, $b];
}

function answerOn(Space $space, User $user, string $date, string $body = 'x'): void
{
    test()->travelTo(at("$date 12:00"));
    app(DailyPrompts::class)->forDate($space, $space->today())->answers()->create(['user_id' => $user->id, 'body' => $body]);
}

function overview($test, Space $space, User $user, array $query = []): array
{
    return $test->actingAs($user)->get(route('spaces.show', [$space, ...$query]))->assertOk()->viewData('page')['props'];
}

function dayDetail($test, Space $space, User $user, string $day): array
{
    $url = route('spaces.show', [$space, 'day' => $day]);
    $version = $test->actingAs($user)->get($url)->viewData('page')['version'];

    return $test->actingAs($user)->get($url, [
        'X-Inertia' => 'true',
        'X-Inertia-Version' => $version,
        'X-Inertia-Partial-Component' => 'spaces/show',
        'X-Inertia-Partial-Data' => 'day',
    ])->assertOk()->json('props.day');
}

// ── Calendar / ปฏิทิน ─────────────────────────────────────────────

test('the month view marks complete, partial, forgiven, missed, today and future days', function () {
    [$space, $a, $b] = calCouple('2026-11-02 08:00');   // Monday
    answerOn($space, $a, '2026-11-02');
    answerOn($space, $b, '2026-11-02');   // complete
    answerOn($space, $a, '2026-11-03');                                        // partial
    // 04, 05 missed → first one forgiven (partial on 03 used a free miss), second forgiven? no: 2 per week
    $this->travelTo(at('2026-11-06 09:00'));

    $days = collect(overview($this, $space, $a)['calendar']['days'])->keyBy('date');

    expect($days['2026-11-01']['status'])->toBe('before')
        ->and($days['2026-11-02']['status'])->toBe('complete')
        ->and($days['2026-11-03']['status'])->toBe('partial')
        ->and($days['2026-11-04']['status'])->toBe('forgiven')   // 2nd miss of the week
        ->and($days['2026-11-05']['status'])->toBe('missed')     // 3rd miss of the week
        ->and($days['2026-11-06']['status'])->toBe('today')
        ->and($days['2026-11-07']['status'])->toBe('future')
        ->and($days)->toHaveCount(30);
});

test('month navigation and stats', function () {
    [$space, $a, $b] = calCouple('2026-10-28 08:00');
    answerOn($space, $a, '2026-10-30');
    answerOn($space, $b, '2026-10-30');
    $this->travelTo(at('2026-11-04 09:00'));

    $cal = overview($this, $space, $a, ['month' => '2026-10'])['calendar'];
    expect($cal['month'])->toBe('2026-10')
        ->and($cal['next'])->toBe('2026-11')
        ->and($cal['is_current'])->toBeFalse()
        ->and($cal['stats']['month_complete'])->toBe(1);

    // Garbage month falls back to the current month.
    expect(overview($this, $space, $a, ['month' => 'nope'])['calendar']['month'])->toBe('2026-11');
});

test('calendar never contains answer text', function () {
    [$space, $a, $b] = calCouple();
    answerOn($space, $b, '2026-11-02', 'very private answer');
    $this->travelTo(at('2026-11-03 09:00'));

    expect(json_encode(overview($this, $space, $a)))->not->toContain('very private answer');
});

// ── Day detail / รายละเอียดวัน ─────────────────────────────────────

test('day detail: partner answer hidden forever if you never answered', function () {
    [$space, $a, $b] = calCouple();
    answerOn($space, $b, '2026-11-02', 'B on Monday');
    $this->travelTo(at('2026-11-20 09:00'));   // window long closed

    $day = dayDetail($this, $space, $a, '2026-11-02');
    expect($day['prompt']['partner_answered'])->toBeTrue()
        ->and($day['prompt']['partner'])->toBeNull()
        ->and($day['prompt']['open'])->toBeFalse()
        ->and(json_encode($day))->not->toContain('B on Monday');

    // B answered, so B sees their own; A answered nothing → can't unlock any more.
    expect(dayDetail($this, $space, $b, '2026-11-02')['prompt']['mine']['body'])->toBe('B on Monday');
});

test('day detail shows both answers when both answered, plus moments and events', function () {
    [$space, $a, $b] = calCouple();
    answerOn($space, $a, '2026-11-02', 'A1');
    answerOn($space, $b, '2026-11-02', 'B1');
    $this->travelTo(at('2026-11-02 18:00'));
    $space->moments()->create(['user_id' => $a->id, 'body' => 'sunset', 'status' => 'posted', 'posted_at' => now()]);
    $space->moments()->create(['user_id' => $a->id, 'body' => 'secret draft', 'status' => 'draft']);
    $space->events()->create(['title' => 'First trip', 'date' => '2026-11-02', 'kind' => 'special']);
    $this->travelTo(at('2026-11-10 09:00'));

    $day = dayDetail($this, $space, $b, '2026-11-02');
    expect($day['prompt']['partner']['body'])->toBe('A1')
        ->and(collect($day['moments'])->pluck('body')->all())->toBe(['sunset'])
        ->and($day['events'][0]['title'])->toBe('First trip');
});

test('day detail is not loaded unless asked for', function () {
    [$space, $a] = calCouple();

    expect(overview($this, $space, $a, ['day' => '2026-11-02']))->not->toHaveKey('day');
});

// ── Events / วันสำคัญ ─────────────────────────────────────────────

test('both partners can add, edit and delete events', function () {
    [$space, $a, $b] = calCouple();

    $this->actingAs($a)->post(route('spaces.events.store', $space), [
        'title' => 'Mag birthday', 'date' => '1995-03-14', 'kind' => 'birthday', 'repeats_yearly' => true,
    ])->assertRedirect()->assertSessionHasNoErrors();
    $event = SpaceEvent::first();

    $this->actingAs($b)->patch(route('spaces.events.update', [$space, $event]), [
        'title' => "Mag's birthday 🎂", 'date' => '1995-03-14', 'kind' => 'birthday', 'repeats_yearly' => true,
    ])->assertRedirect();
    expect($event->fresh()->title)->toBe("Mag's birthday 🎂");

    $this->actingAs($b)->delete(route('spaces.events.destroy', [$space, $event]))->assertRedirect();
    expect(SpaceEvent::count())->toBe(0);
});

test('yearly events repeat, Feb 29 lands on Feb 28, and anniversaries count years', function () {
    [$space] = calCouple();
    $space->update(['anniversary_on' => '2023-11-20']);
    $space->events()->create(['title' => 'Leap', 'date' => '2024-02-29', 'kind' => 'birthday', 'repeats_yearly' => true]);
    $space->events()->create(['title' => 'One-off', 'date' => '2026-12-01', 'kind' => 'other']);
    $this->travelTo(at('2026-11-10 09:00'));

    $upcoming = collect(app(SpaceCalendar::class)->upcoming($space->fresh()));

    expect($upcoming->pluck('date')->all())->toBe(['2026-11-20', '2026-12-01', '2027-02-28'])
        ->and($upcoming[0]['kind'])->toBe('anniversary')
        ->and($upcoming[0]['years'])->toBe(3)
        ->and($upcoming[0]['in_days'])->toBe(10);
});

test('events appear on their calendar day', function () {
    [$space, $a] = calCouple();
    $space->events()->create(['title' => 'Concert', 'date' => '2026-11-15', 'kind' => 'special']);
    $this->travelTo(at('2026-11-10 09:00'));

    $days = collect(overview($this, $space, $a)['calendar']['days'])->keyBy('date');
    expect($days['2026-11-15']['events'])->toBe(['Concert']);
});

test('anniversary date is set in space settings and cannot be in the future', function () {
    [$space, $a] = calCouple();

    $this->actingAs($a)->patch(route('spaces.update', $space), ['timezone' => 'Asia/Bangkok', 'anniversary_on' => '2030-01-01'])
        ->assertSessionHasErrors('anniversary_on');
    $this->actingAs($a)->patch(route('spaces.update', $space), ['timezone' => 'Asia/Bangkok', 'anniversary_on' => '2022-05-01'])
        ->assertSessionHasNoErrors();

    expect($space->fresh()->anniversary_on->toDateString())->toBe('2022-05-01');
});

test('wall: events of another space are unreachable', function () {
    [$ab, $a] = calCouple();
    $c = User::factory()->create();
    $ac = Space::factory()->withMembers($a, $c)->create();
    $event = $ab->events()->create(['title' => 'AB only', 'date' => '2026-11-15', 'kind' => 'special']);

    $this->actingAs($c)->delete(route('spaces.events.destroy', [$ac, $event]))->assertNotFound();
    $this->actingAs($c)->post(route('spaces.events.store', $ab), ['title' => 'x', 'date' => '2026-11-15', 'kind' => 'other'])->assertNotFound();
    expect(json_encode(overview($this, $ac, $c)))->not->toContain('AB only');
});

// ── Activity / ความเคลื่อนไหว ──────────────────────────────────────

test('activity says what happened, never the answer text or drafts', function () {
    [$space, $a, $b] = calCouple();
    answerOn($space, $b, '2026-11-03', 'hidden words');
    $this->travelTo(at('2026-11-03 18:00'));
    $space->moments()->create(['user_id' => $b->id, 'body' => 'posted one', 'status' => 'posted', 'posted_at' => now()]);
    $space->moments()->create(['user_id' => $b->id, 'body' => 'draft one', 'status' => 'draft']);
    $space->events()->create(['title' => 'Trip', 'date' => '2026-12-01', 'kind' => 'special', 'created_by' => $b->id]);

    $props = $this->actingAs($a)->get(route('spaces.daily', $space))->assertOk()->viewData('page')['props'];
    $types = collect($props['activity'])->pluck('type');

    expect($types->sort()->values()->all())->toBe(['answered', 'event', 'moment'])
        ->and(collect($props['activity'])->every(fn ($i) => $i['actor'] === $b->name && ! $i['mine']))->toBeTrue()
        ->and(json_encode($props['activity']))->not->toContain('hidden words')
        ->and(json_encode($props['activity']))->not->toContain('draft one');
});

test('the daily tab lists today\'s events', function () {
    [$space, $a] = calCouple();
    $space->update(['anniversary_on' => '2020-11-05']);
    $this->travelTo(at('2026-11-05 09:00'));

    $props = $this->actingAs($a)->get(route('spaces.daily', $space))->viewData('page')['props'];
    expect($props['todayEvents'][0]['kind'])->toBe('anniversary')
        ->and($props['todayEvents'][0]['years'])->toBe(6);
});
