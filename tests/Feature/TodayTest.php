<?php

use App\Models\DailyPrompt;
use App\Models\Prompt;
use App\Models\Space;
use App\Models\User;
use App\Services\DailyPrompts;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

// 2026-11-11 is a Wednesday; 2026-11-14 a Saturday.
const WED = '2026-11-11 10:00';

function bkk(string $at): Carbon
{
    return Carbon::parse($at, 'Asia/Bangkok');
}

function library(int $questions = 5, int $quests = 3): void
{
    foreach (range(1, $questions) as $i) {
        Prompt::create(['key' => "q$i", 'kind' => 'question', 'tag' => 'fun', 'text_en' => "Question $i", 'text_th' => "คำถาม $i"]);
    }
    foreach (range(1, $quests) as $i) {
        Prompt::create(['key' => "quest$i", 'kind' => 'quest', 'tag' => 'fun', 'text_en' => "Quest $i", 'text_th' => "ภารกิจ $i"]);
    }
}

/** @return array{0: Space, 1: User, 2: User} */
function couple(string $pairedAt = '2026-11-01 09:00'): array
{
    test()->travelTo(bkk($pairedAt));
    [$a, $b] = User::factory()->count(2)->create();
    $space = Space::factory()->withMembers($a, $b)->create();

    return [$space, $a, $b];
}

function todayFor(Space $space): DailyPrompt
{
    return app(DailyPrompts::class)->forDate($space, $space->today());
}

function answer($test, Space $space, User $user, DailyPrompt $daily, string $body = 'hi')
{
    return $test->actingAs($user)->post(route('spaces.answers.store', [$space, $daily]), ['body' => $body]);
}

function daysProp($test, Space $space, User $user): array
{
    $page = $test->actingAs($user)->get(route('spaces.daily', $space))->assertOk()->viewData('page');

    return $page['props']['days'];
}

beforeEach(fn () => library());

// ── Assignment / การเลือกคำถาม ─────────────────────────────────────

test('both partners get the same prompt today', function () {
    [$space, $a, $b] = couple();
    $this->travelTo(bkk(WED));

    $da = daysProp($this, $space, $a)[0];
    $db = daysProp($this, $space, $b)[0];

    expect($da['id'])->toBe($db['id'])
        ->and($da['is_today'])->toBeTrue()
        ->and(DailyPrompt::whereDate('date', '2026-11-11')->count())->toBe(1);
});

test('weekdays are questions, weekends are quests', function () {
    [$space] = couple();

    $this->travelTo(bkk(WED));
    expect(todayFor($space)->prompt->kind)->toBe('question');

    $this->travelTo(bkk('2026-11-14 10:00'));
    expect(todayFor($space)->prompt->kind)->toBe('quest');
});

test('no prompts while waiting for a partner', function () {
    $this->travelTo(bkk(WED));
    $a = User::factory()->create();
    $space = Space::factory()->withMembers($a)->create();

    expect(daysProp($this, $space, $a))->toBe([]);
});

test('the window covers today and up to 6 earlier days, never before pairing', function () {
    [$space, $a] = couple('2026-11-09 08:00');   // Monday
    $this->travelTo(bkk(WED));

    expect(collect(daysProp($this, $space, $a))->pluck('date')->all())
        ->toBe(['2026-11-11', '2026-11-10', '2026-11-09']);
});

test('a prompt never repeats in a space', function () {
    [$space] = couple('2026-11-02 08:00');        // Monday
    $ids = [];
    foreach (['02', '03', '04', '05', '06'] as $d) {   // Mon–Fri, 5 questions in library
        $this->travelTo(bkk("2026-11-$d 10:00"));
        $ids[] = todayFor($space)->prompt_id;
    }

    expect(array_unique($ids))->toHaveCount(5);
});

test('when a kind runs out it falls back to the other kind', function () {
    [$space] = couple('2026-11-02 08:00');
    Prompt::where('kind', 'question')->delete();
    $this->travelTo(bkk(WED));

    expect(todayFor($space)->prompt->kind)->toBe('quest');
});

test('couple-written prompts go first', function () {
    [$space, $a] = couple();
    $this->travelTo(bkk('2026-11-10 10:00'));
    $this->actingAs($a)->post(route('spaces.prompts.store', $space), ['kind' => 'question', 'text' => 'What made you smile today?']);

    $this->travelTo(bkk(WED));
    $today = todayFor($space);

    expect($today->prompt->space_id)->toBe($space->id)
        ->and($today->prompt->created_by)->toBe($a->id);
    expect(daysProp($this, $space, $a)[0]['written_by'])->toBe($a->name);
});

test('the day follows the space timezone', function () {
    [$space] = couple();
    $space->update(['timezone' => 'Asia/Tokyo']);
    $this->travelTo(bkk('2026-11-11 23:30'));   // already 01:30 on the 12th in Tokyo

    expect(todayFor($space)->date->toDateString())->toBe('2026-11-12');
});

test('the hourly command assigns today for paired spaces only', function () {
    [$paired] = couple();
    $solo = Space::factory()->withMembers(User::factory()->create())->create();
    $this->travelTo(bkk(WED));

    $this->artisan('prompts:assign')->assertSuccessful();

    expect($paired->dailyPrompts()->count())->toBe(1)
        ->and($solo->dailyPrompts()->count())->toBe(0);
});

// ── Reveal & editing / การเปิดคำตอบและแก้ไข ──────────────────────────

test('the partner answer stays hidden until you answer', function () {
    [$space, $a, $b] = couple();
    $this->travelTo(bkk(WED));
    $daily = todayFor($space);

    answer($this, $space, $a, $daily, 'A says hi')->assertRedirect();

    $forB = daysProp($this, $space, $b)[0];
    expect($forB['partner_answered'])->toBeTrue()
        ->and($forB['partner'])->toBeNull()
        ->and(json_encode($forB))->not->toContain('A says hi');

    answer($this, $space, $b, $daily, 'B says hi');

    expect(daysProp($this, $space, $b)[0]['partner']['body'])->toBe('A says hi')
        ->and(daysProp($this, $space, $a)[0]['partner']['body'])->toBe('B says hi');
});

test('you can edit until your partner answers, then it locks', function () {
    [$space, $a, $b] = couple();
    $this->travelTo(bkk(WED));
    $daily = todayFor($space);

    answer($this, $space, $a, $daily, 'first');
    answer($this, $space, $a, $daily, 'edited')->assertRedirect();
    expect($daily->answers()->where('user_id', $a->id)->value('body'))->toBe('edited');

    answer($this, $space, $b, $daily, 'B');
    answer($this, $space, $a, $daily, 'too late')->assertStatus(422);
    expect($daily->answers()->where('user_id', $a->id)->value('body'))->toBe('edited')
        ->and(daysProp($this, $space, $a)[0]['can_edit'])->toBeFalse();
});

test('late answers work for 6 earlier days, not 7', function () {
    [$space, $a] = couple('2026-10-20 08:00');
    $this->travelTo(bkk('2026-11-04 10:00'));
    $old = todayFor($space);                         // 2026-11-04
    $this->travelTo(bkk('2026-11-10 10:00'));         // +6 days
    answer($this, $space, $a, $old)->assertRedirect();

    $this->travelTo(bkk('2026-11-11 10:00'));         // +7 days
    answer($this, $space, $a, $old, 'again')->assertStatus(422);
});

test('frozen spaces cannot be answered', function () {
    [$space, $a] = couple();
    $this->travelTo(bkk(WED));
    $daily = todayFor($space);
    $space->freeze($a);

    answer($this, $space, $a, $daily)->assertStatus(423);
});

test('wall: a day from another space cannot be answered through yours', function () {
    [$ab, $a, $b] = couple();
    $c = User::factory()->create();
    $ac = Space::factory()->withMembers($a, $c)->create();
    $this->travelTo(bkk(WED));
    $abDay = todayFor($ab);

    // C uses their own space's URL with A↔B's day id.
    answer($this, $ac, $c, $abDay)->assertNotFound();
    // C uses A↔B's URL directly.
    answer($this, $ab, $c, $abDay)->assertNotFound();
    expect($abDay->answers()->count())->toBe(0);
});

test('outsiders cannot add prompts to a space', function () {
    [$space] = couple();

    $this->actingAs(User::factory()->create())
        ->post(route('spaces.prompts.store', $space), ['kind' => 'question', 'text' => 'x'])
        ->assertNotFound();
});

// ── Streak / สตรีค ────────────────────────────────────────────────

function completeDay($test, Space $space, User $a, User $b, string $date): void
{
    $test->travelTo(bkk("$date 10:00"));
    $daily = todayFor($space);
    $daily->answers()->create(['user_id' => $a->id, 'body' => 'a']);
    $daily->answers()->create(['user_id' => $b->id, 'body' => 'b']);
}

test('streak counts consecutive days both answered; today in progress does not break it', function () {
    [$space, $a, $b] = couple('2026-11-09 08:00');   // Mon
    completeDay($this, $space, $a, $b, '2026-11-09');
    completeDay($this, $space, $a, $b, '2026-11-10');
    $this->travelTo(bkk(WED));                        // nobody answered yet today

    expect(app(DailyPrompts::class)->streak($space))
        ->toMatchArray(['count' => 2, 'freezes_left' => 2, 'together_total' => 2]);
});

test('up to 2 missed days a week are forgiven', function () {
    [$space, $a, $b] = couple('2026-11-09 08:00');   // Mon
    completeDay($this, $space, $a, $b, '2026-11-09');
    // Tue missed
    completeDay($this, $space, $a, $b, '2026-11-11');
    $this->travelTo(bkk('2026-11-12 10:00'));

    expect(app(DailyPrompts::class)->streak($space))->toMatchArray(['count' => 2, 'freezes_left' => 1]);
});

test('a third missed day in a week breaks the streak', function () {
    [$space, $a, $b] = couple('2026-11-09 08:00');   // Mon
    completeDay($this, $space, $a, $b, '2026-11-09');
    // Tue, Wed, Thu missed
    completeDay($this, $space, $a, $b, '2026-11-13');
    $this->travelTo(bkk('2026-11-13 20:00'));

    expect(app(DailyPrompts::class)->streak($space)['count'])->toBe(1);
});

test('a late answer can save the streak', function () {
    [$space, $a, $b] = couple('2026-11-09 08:00');
    completeDay($this, $space, $a, $b, '2026-11-09');
    $this->travelTo(bkk('2026-11-10 10:00'));
    $tue = todayFor($space);
    $tue->answers()->create(['user_id' => $a->id, 'body' => 'a']);
    completeDay($this, $space, $a, $b, '2026-11-11');

    $this->travelTo(bkk('2026-11-12 09:00'));
    answer($this, $space, $b, $tue, 'late but here');

    expect(app(DailyPrompts::class)->streak($space))->toMatchArray(['count' => 3, 'freezes_left' => 2]);
});
