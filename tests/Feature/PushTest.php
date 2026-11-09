<?php

use App\Jobs\SendPush;
use App\Models\Moment;
use App\Models\Prompt;
use App\Models\PushSubscription;
use App\Models\Space;
use App\Models\User;
use App\Services\DailyPrompts;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Queue;

uses(Tests\TestCase::class, RefreshDatabase::class);

function device(User $u): void
{
    PushSubscription::create([
        'user_id' => $u->id, 'endpoint_hash' => hash('sha256', 'https://push.example/'.$u->id),
        'endpoint' => 'https://push.example/'.$u->id, 'public_key' => 'pk', 'auth_token' => 'at',
    ]);
}

/** @return array{0: Space, 1: User, 2: User} */
function pushCouple(): array
{
    Prompt::create(['key' => 'q1', 'kind' => 'question', 'text_en' => 'What made you smile?', 'text_th' => 'วันนี้อะไรทำให้ยิ้ม?']);
    Prompt::create(['key' => 'x1', 'kind' => 'quest', 'text_en' => 'Walk together.', 'text_th' => 'เดินเล่นด้วยกัน']);
    test()->travelTo(Carbon::parse('2026-11-11 07:00', 'Asia/Bangkok'));   // Wednesday
    [$a, $b] = User::factory()->count(2)->create(['locale' => 'en']);
    $space = Space::factory()->withMembers($a, $b)->create();
    device($a);
    device($b);

    return [$space, $a, $b];
}

function pushedTo(User $u): Illuminate\Support\Collection
{
    return Queue::pushed(SendPush::class)->filter(fn ($j) => $j->userId === $u->id)->values();
}

beforeEach(fn () => Queue::fake());

// ── Event pushes / แจ้งเตือนเมื่อมีความเคลื่อนไหว ─────────────────────

test('answering notifies the partner, without the answer text; edits do not re-notify', function () {
    [$space, $a, $b] = pushCouple();
    $daily = app(DailyPrompts::class)->forDate($space, $space->today());

    $this->actingAs($a)->post(route('spaces.answers.store', [$space, $daily]), ['body' => 'my secret answer']);
    $this->actingAs($a)->post(route('spaces.answers.store', [$space, $daily]), ['body' => 'edited secret']);

    expect(pushedTo($b))->toHaveCount(1)
        ->and(pushedTo($a))->toHaveCount(0)
        ->and(pushedTo($b)[0]->payload['body'])->toContain($a->name)
        ->and(json_encode(pushedTo($b)[0]->payload))->not->toContain('secret')
        ->and(pushedTo($b)[0]->payload['url'])->toBe(route('spaces.daily', $space));
});

test('posting a moment notifies the partner (not for drafts) without its text', function () {
    [$space, $a, $b] = pushCouple();

    $this->actingAs($a)->post(route('spaces.moments.store', $space), ['body' => 'private draft words']);
    expect(pushedTo($b))->toHaveCount(0);

    $this->actingAs($a)->post(route('spaces.moments.publish', [$space, Moment::first()]));
    $this->actingAs($a)->post(route('spaces.moments.store', $space), ['body' => 'posted words', 'publish' => true]);

    expect(pushedTo($b))->toHaveCount(2)
        ->and(json_encode(pushedTo($b)->pluck('payload')))->not->toContain('words');
});

test('comments and new reactions notify the author, not yourself', function () {
    [$space, $a, $b] = pushCouple();
    $moment = $space->moments()->create(['user_id' => $a->id, 'body' => 'hi', 'status' => 'posted', 'posted_at' => now()]);

    $this->actingAs($b)->post(route('spaces.comments.store', [$space, $moment]), ['body' => 'so cute']);
    $this->actingAs($b)->put(route('spaces.reactions.update', [$space, $moment]), ['emoji' => '❤️']);
    $this->actingAs($b)->put(route('spaces.reactions.update', [$space, $moment]), ['emoji' => '😂']);   // change: no new push
    $this->actingAs($a)->post(route('spaces.comments.store', [$space, $moment]), ['body' => 'self']);

    expect(pushedTo($a))->toHaveCount(2)
        ->and(json_encode(pushedTo($a)->pluck('payload')))->not->toContain('so cute')
        ->and(pushedTo($b))->toHaveCount(0);
});

test('a switched-off type sends nothing; no device sends nothing', function () {
    [$space, $a, $b] = pushCouple();
    $b->update(['notify' => ['partner_answered' => false]]);
    $daily = app(DailyPrompts::class)->forDate($space, $space->today());

    $this->actingAs($a)->post(route('spaces.answers.store', [$space, $daily]), ['body' => 'x']);
    expect(pushedTo($b))->toHaveCount(0);

    $b->update(['notify' => null]);
    $b->pushSubscriptions()->delete();
    $this->actingAs($b)->post(route('spaces.answers.store', [$space, $daily]), ['body' => 'y']);
    expect(pushedTo($a))->toHaveCount(1);   // A still has a device
});

test('poly: the push says which space it came from', function () {
    [$ab, $a, $b] = pushCouple();
    $c = User::factory()->create(['name' => 'Cee', 'locale' => 'en']);
    device($c);
    $ac = Space::factory()->withMembers($a, $c)->create();
    $daily = app(DailyPrompts::class)->forDate($ac, $ac->today());

    $this->actingAs($a)->post(route('spaces.answers.store', [$ac, $daily]), ['body' => 'x']);

    expect(pushedTo($c)[0]->payload['title'])->toBe($a->name)   // unnamed space → partner's name
        ->and(pushedTo($c)[0]->payload['tag'])->toContain($ac->ulid)
        ->and(pushedTo($b))->toHaveCount(0);
});

// ── Scheduled pushes / แจ้งเตือนตามเวลา ──────────────────────────────

test('morning push at each person\'s own time, once per day', function () {
    [$space, $a, $b] = pushCouple();
    $b->update(['morning_at' => '09:30']);

    $this->travelTo(Carbon::parse('2026-11-11 08:05', 'Asia/Bangkok'));
    $this->artisan('push:daily');
    $this->artisan('push:daily');   // run again: no duplicate

    expect(pushedTo($a))->toHaveCount(1)
        ->and(pushedTo($a)[0]->payload['body'])->toBe('What made you smile?')
        ->and(pushedTo($b))->toHaveCount(0);

    $this->travelTo(Carbon::parse('2026-11-11 09:31', 'Asia/Bangkok'));
    $this->artisan('push:daily');
    expect(pushedTo($b))->toHaveCount(1);
});

test('evening reminder only if you have not answered', function () {
    [$space, $a, $b] = pushCouple();
    $a->update(['notify' => ['morning' => false]]);
    $b->update(['notify' => ['morning' => false]]);
    $daily = app(DailyPrompts::class)->forDate($space, $space->today());
    $daily->answers()->create(['user_id' => $a->id, 'body' => 'done']);

    $this->travelTo(Carbon::parse('2026-11-11 20:10', 'Asia/Bangkok'));
    $this->artisan('push:daily');

    expect(pushedTo($a))->toHaveCount(0)->and(pushedTo($b))->toHaveCount(1);
});

test('missed slots more than 3 hours ago are skipped (e.g. server was down)', function () {
    [$space, $a] = pushCouple();
    $this->travelTo(Carbon::parse('2026-11-11 11:30', 'Asia/Bangkok'));   // 08:00 + 3h30

    $this->artisan('push:daily');

    expect(pushedTo($a)->filter(fn ($j) => str_contains($j->payload['title'], 'question')))->toHaveCount(0);
});

test('date reminders: partner birthday tomorrow, never your own; today with memories', function () {
    [$space, $a, $b] = pushCouple();
    $a->update(['notify' => ['morning' => false]]);
    $b->update(['notify' => ['morning' => false], 'birthday' => '1996-11-12']);
    $event = $space->events()->create(['title' => 'First date', 'kind' => 'special', 'date' => '2023-11-11', 'repeats_yearly' => true]);
    $space->moments()->create(['user_id' => $a->id, 'space_event_id' => $event->id, 'status' => 'posted', 'posted_at' => '2025-11-11 12:00:00', 'body' => 'x']);

    $this->travelTo(Carbon::parse('2026-11-11 08:01', 'Asia/Bangkok'));
    $this->artisan('push:daily');

    $forA = pushedTo($a)->pluck('payload');
    $forB = pushedTo($b)->pluck('payload');
    expect($forA->pluck('body')->join('|'))->toContain("{$b->name}'s birthday")
        ->and($forA->pluck('body')->join('|'))->toContain('First date — 1 memories')
        ->and($forB->pluck('body')->join('|'))->not->toContain('birthday');
});

// ── Devices & settings / อุปกรณ์และการตั้งค่า ──────────────────────────

test('subscribe, re-subscribe moves the device, unsubscribe', function () {
    [$a, $b] = User::factory()->count(2)->create();
    $sub = ['endpoint' => 'https://fcm.googleapis.com/fcm/send/abc', 'keys' => ['p256dh' => 'key', 'auth' => 'auth']];

    $this->actingAs($a)->postJson(route('push.subscribe'), $sub)->assertOk();
    $this->actingAs($b)->postJson(route('push.subscribe'), $sub)->assertOk();   // same phone, other account
    expect(PushSubscription::count())->toBe(1)->and(PushSubscription::first()->user_id)->toBe($b->id);

    $this->actingAs($b)->deleteJson(route('push.unsubscribe'), ['endpoint' => $sub['endpoint']])->assertOk();
    expect(PushSubscription::count())->toBe(0);

    $this->actingAs($a)->postJson(route('push.subscribe'), [...$sub, 'endpoint' => 'http://insecure.example'])->assertStatus(422);
});

test('notification settings save switches and times', function () {
    $a = User::factory()->create();

    $this->actingAs($a)->put(route('notifications.update'), [
        'prefs' => ['morning' => true, 'evening' => false, 'partner_answered' => true, 'partner_moment' => false, 'moment_activity' => true, 'dates' => true],
        'morning_at' => '07:15', 'evening_at' => '21:45',
    ])->assertRedirect();

    $a->refresh();
    expect($a->wants('evening'))->toBeFalse()->and($a->wants('morning'))->toBeTrue()
        ->and($a->morning_at)->toBe('07:15')->and($a->evening_at)->toBe('21:45');

    $this->actingAs($a)->put(route('notifications.update'), ['prefs' => [], 'morning_at' => '25:00', 'evening_at' => '20:00'])
        ->assertSessionHasErrors('morning_at');
});
