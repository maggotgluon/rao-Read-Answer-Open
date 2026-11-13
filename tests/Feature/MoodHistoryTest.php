<?php

use App\Models\Mood;
use App\Models\Space;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

function moodCouple(): array
{
    test()->travelTo(Carbon::parse('2026-11-20 10:00', 'Asia/Bangkok'));
    [$a, $b] = User::factory()->count(2)->create();
    $space = Space::factory()->withMembers($a, $b)->create();

    return [$space, $a, $b];
}

function stamp(User $u, string $date, string $mood): void
{
    Mood::create(['user_id' => $u->id, 'date' => $date, 'mood' => $mood]);
}

test('calendar shows both moods per day and a monthly summary', function () {
    [$space, $a, $b] = moodCouple();
    stamp($a, '2026-11-03', 'happy');
    stamp($a, '2026-11-04', 'tired');
    stamp($a, '2026-11-05', 'happy');
    stamp($b, '2026-11-04', 'loved');

    $this->actingAs($a)->get(route('spaces.show', $space))->assertInertia(fn ($page) => $page
        ->where('calendar.days.3.moods', ['mine' => 'tired', 'partner' => 'loved'])
        ->where('calendar.days.2.moods', ['mine' => 'happy', 'partner' => null])
        ->where('calendar.days.0.moods', ['mine' => null, 'partner' => null])
        ->where('calendar.mood_summary.mine', ['top' => 'happy', 'top_days' => 2, 'days' => 3])
        ->where('calendar.mood_summary.partner', ['top' => 'loved', 'top_days' => 1, 'days' => 1]));

    // From the partner's side the roles swap. / ฝั่งคู่ สลับกัน
    $this->actingAs($b)->get(route('spaces.show', $space))->assertInertia(fn ($page) => $page
        ->where('calendar.days.3.moods', ['mine' => 'loved', 'partner' => 'tired']));
});

test('ties go to the order moods are shown in; a month with none has no top', function () {
    [$space, $a] = moodCouple();
    stamp($a, '2026-11-02', 'sad');
    stamp($a, '2026-11-03', 'happy');

    $this->actingAs($a)->get(route('spaces.show', $space).'?month=2026-11')
        ->assertInertia(fn ($page) => $page->where('calendar.mood_summary.mine.top', 'happy'));
    $this->actingAs($a)->get(route('spaces.show', $space).'?month=2026-10')
        ->assertInertia(fn ($page) => $page->where('calendar.mood_summary.mine', ['top' => null, 'top_days' => 0, 'days' => 0]));
});

test('day details include both moods', function () {
    [$space, $a, $b] = moodCouple();
    stamp($a, '2026-11-04', 'calm');
    stamp($b, '2026-11-04', 'stressed');

    $this->actingAs($a)
        ->get(route('spaces.show', $space).'?day=2026-11-04', [
            'X-Inertia' => 'true',
            'X-Inertia-Version' => $this->get(route('spaces.show', $space))->viewData('page')['version'],
            'X-Inertia-Partial-Component' => 'spaces/show',
            'X-Inertia-Partial-Data' => 'day',
        ])
        ->assertJsonPath('props.day.moods', ['mine' => 'calm', 'partner' => 'stressed']);
});

test('moods from someone outside this space never show, even a poly partner elsewhere', function () {
    [$space, $a] = moodCouple();
    $c = User::factory()->create();
    Space::factory()->withMembers($a, $c)->create();   // a's other space
    stamp($c, '2026-11-04', 'sick');

    $this->actingAs($a)->get(route('spaces.show', $space))->assertInertia(fn ($page) => $page
        ->where('calendar.days.3.moods.partner', null)
        ->where('calendar.mood_summary.partner.days', 0));

    // and an outsider can't open the space at all / คนนอกเปิดไม่ได้
    $this->actingAs($c)->get(route('spaces.show', $space))->assertNotFound();
});
