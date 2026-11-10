<?php

use App\Models\User;
use App\Support\AppVersion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

afterEach(fn () => AppVersion::flush());

test('every page gets the app version from the newest changelog entry; both languages agree', function () {
    $top = fn (string $l) => preg_match('/^##\s*\[([^\]]+)\]/m', file_get_contents(resource_path("changelog/{$l}.md")), $m) ? $m[1] : null;
    expect($top('en'))->toBe($top('th'))->not->toBeNull();

    $props = $this->get(route('home'))->assertOk()->viewData('page')['props'];
    expect($props['app']['version'])->toBe($top('en'))->and($props['app']['build'])->toBeString();
});

test('changelog page is public and renders in Thai and English', function () {
    foreach (['th' => 'บันทึกการเปลี่ยนแปลง', 'en' => 'Changelog'] as $locale => $title) {
        $page = $this->withSession(['locale' => $locale])->get(route('changelog'))->assertOk()->viewData('page');
        expect($page['component'])->toBe('legal/show')
            ->and($page['props']['title'])->toBe($title)
            ->and($page['props']['html'])->toContain('<h2>')->not->toContain('[0.');
    }
});

test('signed-in pages share the version too', function () {
    $this->actingAs(User::factory()->create())->get(route('profile.edit'))
        ->assertOk()->assertInertia(fn ($p) => $p->has('app.version')->has('app.build'));
});
