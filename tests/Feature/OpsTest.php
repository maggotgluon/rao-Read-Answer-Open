<?php

use App\Models\User;
use Illuminate\Console\Scheduling\CallbackEvent;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

const OPS_TOKEN = 'test-token-0123456789abcdef0123456789';

beforeEach(fn () => RateLimiter::clear('ops:127.0.0.1'));

test('ops URLs are off without a token, and 404 for a wrong or short token', function () {
    config(['rao.ops_token' => null]);
    $this->get('/_ops/status')->assertNotFound();
    $this->get('/_ops/status?token=')->assertNotFound();

    config(['rao.ops_token' => 'short']);
    $this->get('/_ops/status?token=short')->assertNotFound();

    config(['rao.ops_token' => OPS_TOKEN]);
    $this->get('/_ops/migrate?token=wrong')->assertNotFound();
    $this->get('/_ops/nope?token='.OPS_TOKEN)->assertNotFound();
});

test('wrong tokens are rate limited', function () {
    config(['rao.ops_token' => OPS_TOKEN]);
    foreach (range(1, 5) as $_) {
        $this->get('/_ops/status?token=bad')->assertNotFound();
    }
    $this->get('/_ops/status?token='.OPS_TOKEN)->assertStatus(429);
});

test('status, migrate and schedule work with the token (header or query), no cookies set', function () {
    config(['rao.ops_token' => OPS_TOKEN]);

    $r = $this->get('/_ops/status', ['X-Ops-Token' => OPS_TOKEN])->assertOk();
    expect($r->getContent())->toContain('pending  none')->toContain('database ');
    expect($r->headers->getCookies())->toBe([]);

    $m = $this->get('/_ops/migrate?token='.OPS_TOKEN)->assertOk()->getContent();
    expect($m)->toContain('$ migrate')->toContain('PromptLibrarySeeder');

    $this->get('/_ops/schedule?token='.OPS_TOKEN)->assertOk();
});

test('admin action makes a registered person admin', function () {
    config(['rao.ops_token' => OPS_TOKEN]);
    $u = User::factory()->create(['email' => 'me@rao.test']);
    $this->get('/_ops/admin?email=me@rao.test&token='.OPS_TOKEN)->assertOk();
    expect($u->fresh()->is_admin)->toBeTrue();
    $this->get('/_ops/admin?email=me@rao.test&revoke=1&token='.OPS_TOKEN)->assertOk();
    expect($u->fresh()->is_admin)->toBeFalse();
});

test('every scheduled task runs in-process (no exec needed on the host)', function () {
    $events = app(Schedule::class)->events();
    expect($events)->not->toBeEmpty();
    foreach ($events as $e) {
        expect($e)->toBeInstanceOf(CallbackEvent::class);
    }
});
