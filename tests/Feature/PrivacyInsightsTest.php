<?php

use App\Jobs\SendPush;
use App\Models\Answer;
use App\Models\LetterReply;
use App\Models\Moment;
use App\Models\Mood;
use App\Models\Prompt;
use App\Models\Space;
use App\Models\SurveyResponse;
use App\Models\User;
use App\Services\AccountData;
use App\Services\DailyPrompts;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

function piCouple(bool $consent = false): array
{
    $a = User::factory()->create(['analytics_consent_at' => $consent ? now() : null]);
    $b = User::factory()->create();
    $space = Space::factory()->withMembers($a, $b)->create();
    Prompt::create(['kind' => 'question', 'text_en' => 'Q?', 'text_th' => 'ถาม?']);
    $daily = app(DailyPrompts::class)->forDate($space, $space->today());

    return [$a, $b, $space, $daily];
}

// --- analytics consent / ความยินยอม ---
test('no analytics events without consent', function () {
    [$a, , $space, $daily] = piCouple(false);
    $this->actingAs($a)->post(route('spaces.answers.store', [$space, $daily]), ['body' => 'hi'])->assertRedirect();
    $this->actingAs($a)->post(route('analytics.open'), ['source' => 'browser', 'standalone' => false])->assertNoContent();

    expect(DB::table('analytics_events')->count())->toBe(0)
        ->and(DB::table('activity_days')->count())->toBe(0);
});

test('with consent: actions are recorded, never the content', function () {
    [$a, , $space, $daily] = piCouple(true);
    $this->actingAs($a)->post(route('spaces.answers.store', [$space, $daily]), ['body' => 'my secret words'])->assertRedirect();
    $this->actingAs($a)->post(route('analytics.open'), ['source' => 'push', 'standalone' => true])->assertNoContent();

    $events = DB::table('analytics_events')->pluck('props', 'name');
    expect($events->keys()->all())->toContain('answer_submitted', 'app_open')
        ->and(DB::table('analytics_events')->get()->implode('props', ' '))->not->toContain('secret');
});

test('sign-up consent is off unless ticked', function () {
    $this->post(route('register.store'), ['name' => 'A', 'email' => 'a@x.test', 'password' => 'Str0ng!pass-word', 'password_confirmation' => 'Str0ng!pass-word', 'sensitive' => '1']);
    expect(User::where('email', 'a@x.test')->first()->analytics_consent_at)->toBeNull();
    auth()->logout();

    $this->post(route('register.store'), ['name' => 'B', 'email' => 'b@x.test', 'password' => 'Str0ng!pass-word', 'password_confirmation' => 'Str0ng!pass-word', 'sensitive' => '1', 'analytics' => '1']);
    expect(User::where('email', 'b@x.test')->first()->analytics_consent_at)->not->toBeNull();
});

test('withdrawing consent deletes collected events', function () {
    [$a, , $space] = piCouple(true);
    $this->actingAs($a)->post(route('analytics.open'), ['source' => 'browser', 'standalone' => false]);
    expect(DB::table('analytics_events')->count())->toBe(1);

    $this->actingAs($a)->put(route('privacy.analytics'), ['on' => false])->assertRedirect();
    expect($a->fresh()->analytics_consent_at)->toBeNull()
        ->and(DB::table('analytics_events')->count())->toBe(0);
});

// --- export / ส่งออก ---
test('export contains only my own content', function () {
    [$a, $b, $space, $daily] = piCouple();
    Answer::create(['daily_prompt_id' => $daily->id, 'user_id' => $a->id, 'body' => 'MINE-letter']);
    Answer::create(['daily_prompt_id' => $daily->id, 'user_id' => $b->id, 'body' => 'THEIRS-letter']);
    Moment::create(['space_id' => $space->id, 'user_id' => $b->id, 'body' => 'THEIRS-moment', 'status' => 'posted', 'posted_at' => now()]);

    $data = json_encode(app(AccountData::class)->collect($a), JSON_UNESCAPED_UNICODE);
    expect($data)->toContain('MINE-letter')->not->toContain('THEIRS');

    $res = $this->actingAs($a)->get(route('privacy.export'));
    $res->assertOk()->assertDownload();
});

// --- delete with grace period / ลบบัญชีมีระยะผ่อนผัน ---
test('delete is scheduled, sign-in cancels, purge removes my content only', function () {
    [$a, $b, $space, $daily] = piCouple();
    Answer::create(['daily_prompt_id' => $daily->id, 'user_id' => $a->id, 'body' => 'a']);
    Answer::create(['daily_prompt_id' => $daily->id, 'user_id' => $b->id, 'body' => 'b']);

    $this->actingAs($a)->delete(route('profile.destroy'), ['password' => 'password'])->assertRedirect('/');
    $this->assertGuest();
    expect($a->fresh()->delete_at)->not->toBeNull();

    // signing in again cancels / เข้าสู่ระบบ = ยกเลิก
    $this->post(route('login.store'), ['email' => $a->email, 'password' => 'password']);
    expect($a->fresh()->delete_at)->toBeNull();

    // schedule again and let it expire
    $a->forceFill(['delete_at' => now()->subMinute()])->save();
    $this->artisan('accounts:purge')->assertSuccessful();

    expect(User::find($a->id))->toBeNull()
        ->and(Answer::where('user_id', $b->id)->count())->toBe(1)
        ->and(Answer::count())->toBe(1)
        ->and($space->fresh()->status)->toBe(Space::STATUS_FROZEN)
        ->and($space->fresh()->delete_after)->toBeNull();
});

// --- nudge / เตือน ---
test('nudge only after I wrote and partner has not, once a day', function () {
    Queue::fake();
    [$a, $b, $space, $daily] = piCouple();
    Answer::create(['daily_prompt_id' => $daily->id, 'user_id' => $a->id, 'body' => 'x']);
    // partner without notifications: nothing logged / อีกฝ่ายไม่มีแจ้งเตือน: ไม่บันทึก
    $this->actingAs($a)->post(route('spaces.nudge', [$space, $daily]))->assertRedirect();
    expect(DB::table('push_logs')->count())->toBe(0);
    Answer::where('user_id', $a->id)->delete();

    $b->pushSubscriptions()->create(['endpoint_hash' => hash('sha256', 'x'), 'endpoint' => 'https://push.test/x', 'public_key' => 'k', 'auth_token' => 't']);

    $this->actingAs($a)->post(route('spaces.nudge', [$space, $daily]))->assertStatus(422);   // not written yet
    Answer::create(['daily_prompt_id' => $daily->id, 'user_id' => $a->id, 'body' => 'x']);

    $this->actingAs($a)->post(route('spaces.nudge', [$space, $daily]))->assertRedirect();
    $this->actingAs($a)->post(route('spaces.nudge', [$space, $daily]))->assertRedirect();
    expect(DB::table('push_logs')->where('kind', 'nudge')->count())->toBe(1);
    Queue::assertPushed(SendPush::class, 1);
});

// --- replies / ตอบกลับ ---
test('replies only once both letters are open; outsiders get 404', function () {
    [$a, $b, $space, $daily] = piCouple();
    Answer::create(['daily_prompt_id' => $daily->id, 'user_id' => $a->id, 'body' => 'x']);
    $this->actingAs($a)->post(route('spaces.replies.store', [$space, $daily]), ['body' => 'hey'])->assertStatus(422);

    Answer::create(['daily_prompt_id' => $daily->id, 'user_id' => $b->id, 'body' => 'y']);
    $this->actingAs($a)->post(route('spaces.replies.store', [$space, $daily]), ['body' => 'hey'])->assertRedirect();
    expect(LetterReply::count())->toBe(1);

    $other = User::factory()->create();
    $this->actingAs($other)->post(route('spaces.replies.store', [$space, $daily]), ['body' => 'x'])->assertNotFound();

    $reply = LetterReply::first();
    $this->actingAs($b)->delete(route('spaces.replies.destroy', [$space, $daily, $reply]))->assertNotFound();
    $this->actingAs($a)->delete(route('spaces.replies.destroy', [$space, $daily, $reply]))->assertRedirect();
    expect(LetterReply::count())->toBe(0);
});

// --- mood / อารมณ์ ---
test('mood: set, see partner, toggle off', function () {
    [$a, $b, $space] = piCouple();
    $this->actingAs($b)->put(route('spaces.mood', $space), ['mood' => 'tired'])->assertRedirect();
    $this->actingAs($a)->put(route('spaces.mood', $space), ['mood' => 'nope'])->assertSessionHasErrors('mood');

    $moods = $this->actingAs($a)->get(route('spaces.daily', $space))->viewData('page')['props']['moods'];
    expect($moods['partner'])->toBe('tired')->and($moods['mine'])->toBeNull();

    $this->actingAs($b)->put(route('spaces.mood', $space), ['mood' => null]);
    expect(Mood::count())->toBe(0);
});

// --- survey + admin insights ---
test('survey shows after 14 days, once', function () {
    [$a, , $space] = piCouple();
    $survey = fn () => $this->actingAs($a->fresh())->get(route('spaces.daily', $space))->viewData('page')['props']['survey'];
    expect($survey())->toBeFalse();

    $a->forceFill(['created_at' => now()->subDays(15)])->save();
    expect($survey())->toBeTrue();

    $this->actingAs($a)->post(route('survey.store'), ['score' => 5, 'liked' => 'the seal'])->assertRedirect();
    expect(SurveyResponse::count())->toBe(1);
    expect($survey())->toBeFalse();
});

test('insights page: admin only, numbers only', function () {
    [$a, $b, $space, $daily] = piCouple(true);
    Answer::create(['daily_prompt_id' => $daily->id, 'user_id' => $a->id, 'body' => 'PRIVATE']);
    $admin = User::factory()->create(['is_admin' => true]);

    $this->actingAs($a)->get(route('admin.insights'))->assertNotFound();
    $res = $this->actingAs($admin)->get(route('admin.insights'))->assertOk()
        ->assertInertia(fn ($p) => $p->component('admin/insights')->where('insights.funnel.0.key', 'signed_up'));
    expect($res->getContent())->not->toContain('PRIVATE');
});

test('legal pages render in both languages, filled from .env, no owner markers', function () {
    config(['legal.contact_email' => 'hello@rao.test', 'legal.effective_date' => '2026-12-01']);

    foreach (['th', 'en'] as $locale) {
        foreach (['privacy', 'terms', 'cookies', 'data-rights'] as $doc) {
            $props = $this->withSession(['locale' => $locale])->get(route('legal.show', $doc))->assertOk()->viewData('page')['props'];
            expect($props['html'])->not->toContain('PLACEHOLDER')->not->toContain('OPTIONAL')->not->toContain('{{')
                ->and($props['effective'])->toBe('2026-12-01');
        }
    }
    expect($props['html'])->toContain('hello@rao.test');
    $this->get('/legal/nope')->assertNotFound();
});

// --- sensitive-topics consent (PDPA s.26) / ความยินยอมเรื่องอ่อนไหว ---
test('sign-up requires the separate sensitive-topics consent', function () {
    $this->post(route('register.store'), ['name' => 'C', 'email' => 'c@x.test', 'password' => 'Str0ng!pass-word', 'password_confirmation' => 'Str0ng!pass-word'])
        ->assertSessionHasErrors('sensitive');
    expect(User::where('email', 'c@x.test')->exists())->toBeFalse();
});

test('without consent, spaces redirect to the consent page; giving it continues; withdrawing closes again', function () {
    [$a, , $space] = piCouple();
    $a->forceFill(['sensitive_consent_at' => null])->save();

    $this->actingAs($a)->get(route('spaces.daily', $space))->assertRedirect(route('consent.show'));
    $this->actingAs($a)->get(route('privacy.edit'))->assertOk();   // settings stay open
    $this->actingAs($a)->post(route('consent.store'), [])->assertSessionHasErrors('sensitive');
    $this->actingAs($a)->post(route('consent.store'), ['sensitive' => '1'])->assertRedirect(route('spaces.daily', $space));
    expect($a->fresh()->sensitive_consent_at)->not->toBeNull();

    $this->actingAs($a)->delete(route('consent.withdraw'))->assertRedirect(route('privacy.edit'));
    $this->actingAs($a->fresh())->get(route('spaces.daily', $space))->assertRedirect(route('consent.show'));
});
