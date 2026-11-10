<?php

use App\Http\Controllers\DevLoginController;
use App\Models\User;
use App\Support\DevTools;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

function asEnv(string $env, bool $flag): void
{
    app()->detectEnvironment(fn () => $env);
    config(['rao.dev_tools' => $flag]);
}

function registerUser($test): User
{
    Http::fake(); // production password rules call the "uncompromised" (HIBP) API
    // CSRF is only auto-skipped when APP_ENV=testing; these tests switch the env.
    $test->withoutMiddleware([PreventRequestForgery::class, ValidateCsrfToken::class]);

    $test->post(route('register.store'), [
        'name' => 'New Person',
        'email' => 'new@example.com',
        'password' => 'Long-enough-Pass-123!',
        'password_confirmation' => 'Long-enough-Pass-123!',
        'sensitive' => '1',
    ])->assertSessionHasNoErrors();

    return User::where('email', 'new@example.com')->firstOrFail();
}

// ── The gate / ประตูควบคุม ─────────────────────────────────────────

test('dev tools need both APP_ENV=local and the flag', function (string $env, bool $flag, bool $expected) {
    asEnv($env, $flag);

    expect(DevTools::enabled())->toBe($expected);
})->with([
    'local + flag' => ['local', true, true],
    'local, no flag' => ['local', false, false],
    'production + flag (copied .env)' => ['production', true, false],
    'staging + flag' => ['staging', true, false],
    'testing + flag' => ['testing', true, false],
]);

// ── Skip email verification / ข้ามการยืนยันอีเมล ───────────────────

test('dev: new sign-ups are verified and get no email', function () {
    Notification::fake();
    asEnv('local', true);

    $user = registerUser($this);

    expect($user->hasVerifiedEmail())->toBeTrue();
    Notification::assertNothingSent();
});

test('production: sign-ups still need to verify their email', function () {
    Notification::fake();
    asEnv('production', true);

    $user = registerUser($this);

    expect($user->hasVerifiedEmail())->toBeFalse();
    Notification::assertSentTo($user, VerifyEmail::class);
});

// ── Demo logins / ล็อกอินเดโม ─────────────────────────────────────

test('login page lists demo accounts only in dev', function () {
    asEnv('local', true);
    $this->get(route('login'))->assertInertia(fn ($page) => $page->has('demoAccounts', 4));

    asEnv('production', true);
    $this->get(route('login'))->assertInertia(fn ($page) => $page->has('demoAccounts', 0));
});

test('the dev login route does not exist outside local', function () {
    User::factory()->create(['email' => 'mag@rao.test']);

    $this->post('/dev/login', ['email' => 'mag@rao.test'])->assertNotFound();
    $this->assertGuest();
});

test('the dev login controller refuses outside local even if routed', function () {
    asEnv('production', true);

    (new DevLoginController)(Request::create('/dev/login', 'POST', ['email' => 'mag@rao.test']));
})->throws(NotFoundHttpException::class);

// ── Demo seed / ข้อมูลเดโม ────────────────────────────────────────

test('the demo seed builds the poly setup with walls intact', function () {
    asEnv('local', true);
    $this->seed(DatabaseSeeder::class);

    $mag = User::where('email', 'mag@rao.test')->first();
    $partner = User::where('email', 'partner@rao.test')->first();
    $third = User::where('email', 'third@rao.test')->first();
    $solo = User::where('email', 'solo@rao.test')->first();

    expect($mag->spaces()->count())->toBe(2)
        ->and($partner->spaces()->count())->toBe(1)
        ->and($third->spaces()->count())->toBe(1)
        ->and($solo->spaces()->count())->toBe(0)
        ->and($mag->hasVerifiedEmail())->toBeTrue();

    $magThird = $third->spaces()->first();
    $this->actingAs($partner)->get(route('spaces.show', $magThird))->assertNotFound();
});

test('the seeder does nothing outside local', function () {
    asEnv('production', true);
    $this->seed(DatabaseSeeder::class);

    expect(User::count())->toBe(0);
});
