<?php

use App\Models\Feature;
use App\Models\Moment;
use App\Models\Space;
use App\Models\ThemeSetting;
use App\Models\User;
use App\Services\SpaceCalendar;
use App\Support\Features;
use App\Support\Themes;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

afterEach(function () {
    File::deleteDirectory(public_path('themes/zz-test'));
    Themes::flush();
    cache()->flush();
});

test('theme folders load with inheritance; children reuse the parent pictures', function () {
    $night = Themes::get('night');
    expect(array_keys(Themes::all()))->toContain('dusk', 'daytime', 'night')
        ->and(array_key_first(Themes::all()))->toBe('dusk')
        ->and($night['dark'])->toBeTrue()
        ->and($night['tokens']['ground'])->toBe('#121a2c')
        ->and($night['assets']['moods.tired']['url'])->toContain('/themes/dusk/moods/tired.svg')
        ->and($night['assets']['logo.stamp']['url'])->toContain('/themes/night/logo/stamp.png')   // own override
        ->and($night['assets']['moods.tired']['mono'])->toBeTrue()
        ->and($night['assets']['logo.stamp']['mono'])->toBeFalse();
});

test('a new folder is a new theme; a PNG replaces the SVG of the same name; images become CSS vars', function () {
    $dir = public_path('themes/zz-test');
    File::ensureDirectoryExists("{$dir}/icons");
    File::ensureDirectoryExists("{$dir}/textures");
    File::put("{$dir}/theme.json", json_encode([
        'extends' => 'dusk', 'name' => ['en' => 'Test', 'th' => 'ทดสอบ'],
        'tokens' => ['stamp' => '#00ff00'], 'images' => ['ground' => 'textures/desk.png'],
    ]));
    File::put("{$dir}/icons/envelope.svg", '<svg/>');
    File::put("{$dir}/icons/envelope.png", 'png');
    File::put("{$dir}/textures/desk.png", 'png');
    Themes::flush();

    $t = Themes::get('zz-test');
    expect($t['assets']['icons.envelope']['url'])->toContain('/themes/zz-test/icons/envelope.png')
        ->and($t['assets']['icons.envelope']['mono'])->toBeFalse()
        ->and($t['assets']['icons.seal']['url'])->toContain('/themes/dusk/')   // inherited
        ->and(Themes::css('zz-test'))->toContain('--stamp: #00ff00')->toContain('/themes/zz-test/textures/desk.png');
});

test('people pick from available themes; admin can switch one off or make it premium', function () {
    $u = User::factory()->create();
    $this->actingAs($u)->put(route('theme.update'), ['theme' => 'night'])->assertRedirect();
    expect($u->fresh()->theme)->toBe('night');

    ThemeSetting::create(['theme' => 'night', 'enabled' => false, 'tier' => 'free']);
    $this->actingAs($u->fresh())->get(route('profile.edit'))->assertSee('data-theme="dusk"', false);   // falls back
    $this->actingAs($u->fresh())->put(route('theme.update'), ['theme' => 'night'])->assertSessionHasErrors('theme');

    ThemeSetting::where('theme', 'night')->update(['enabled' => true, 'tier' => 'premium']);
    expect(Themes::availableFor($u->fresh()))->not->toContain('night');
    $space = Space::factory()->withMembers($u, User::factory()->create())->create(['premium' => true]);
    expect(Themes::availableFor($u->fresh()))->toContain('night');

    $page = $this->actingAs($u->fresh())->get(route('appearance.edit'))->viewData('page');
    expect(collect($page['props']['themes'])->pluck('id')->all())->toBe(['dusk', 'daytime', 'doodle', 'night']);
});

test('switched-off themes feature: the page is gone, not greyed out', function () {
    Feature::updateOrCreate(['key' => 'themes'], ['enabled' => false, 'tier' => 'free']);
    Features::flush();
    $u = User::factory()->create();
    $this->actingAs($u)->get(route('appearance.edit'))->assertNotFound();
    expect($this->actingAs($u)->get(route('profile.edit'))->viewData('page')['props']['features']['themes'])->toBeFalse();
});

test('admin theme switches: admin only, default theme cannot be switched off', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $this->actingAs(User::factory()->create())->put(route('admin.themes.update', 'night'), ['enabled' => false, 'tier' => 'free'])->assertNotFound();
    $this->actingAs($admin)->put(route('admin.themes.update', 'dusk'), ['enabled' => false, 'tier' => 'free'])->assertNotFound();
    $this->actingAs($admin)->put(route('admin.themes.update', 'night'), ['enabled' => false, 'tier' => 'premium'])->assertRedirect();
    expect(ThemeSetting::find('night')->enabled)->toBeFalse();
});

test('reactions are picture keys; push text still gets an emoji', function () {
    [$a, $b] = User::factory()->count(2)->create();
    $space = Space::factory()->withMembers($a, $b)->create();
    $m = Moment::create(['space_id' => $space->id, 'user_id' => $a->id, 'body' => 'x', 'status' => 'posted', 'posted_at' => now()]);

    $this->actingAs($b)->put(route('spaces.reactions.update', [$space, $m]), ['emoji' => 'aww'])->assertRedirect();
    $this->actingAs($b)->put(route('spaces.reactions.update', [$space, $m]), ['emoji' => '🥹'])->assertSessionHasErrors('emoji');
    expect($m->reactions()->value('emoji'))->toBe('aww');

    $page = $this->actingAs($a)->get(route('spaces.moments', $space))->viewData('page');
    expect($page['props']['reactionKeys'])->toBe(['love', 'sweet', 'aww', 'crush', 'yay', 'melting'])
        ->and($page['props']['themeAssets'])->toHaveKey('reactions.aww');
});

test('dates carry a picture; special days can pick one from the theme', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $this->actingAs($admin)->post(route('admin.days.store'), ['date' => now()->addDay()->toDateString(), 'title_en' => 'Picnic', 'title_th' => 'ปิกนิก', 'icon' => 'balloons', 'repeats_yearly' => false])->assertRedirect();
    $this->actingAs($admin)->post(route('admin.days.store'), ['date' => now()->addDay()->toDateString(), 'title_en' => 'Bad', 'icon' => '../../etc'])->assertSessionHasErrors('icon');

    [$a, $b] = User::factory()->count(2)->create();
    $space = Space::factory()->withMembers($a, $b)->create();
    $occ = app(SpaceCalendar::class)->occurrences($space, Carbon::now()->startOfDay(), Carbon::now()->addDays(3));
    expect($occ->firstWhere('kind', 'site')['icon'])->toBe('dates.balloons');
});

test('dusk ships textures: grunge mask, paper, desk, button, seal as CSS vars; night inherits them', function () {
    $css = Themes::css('night');
    expect($css)->toContain('--grunge-image: url(')->toContain('/themes/dusk/textures/grunge.png')
        ->toContain('--paper-image: url(')->toContain('--seal-image: url(')
        ->toContain('--grunge-size: 240px')->toContain('--ink-frames: 25')
        ->and(Themes::get('dusk')['assets'])->toHaveKeys(['textures.grunge', 'buttons.seal']);
});

test('doodle theme: hand-drawn pictures override dusk, the rest falls back, credit is shown', function () {
    $t = Themes::get('doodle');
    expect($t['assets']['moods.tired']['url'])->toContain('/themes/doodle/moods/tired.svg')
        ->and($t['assets']['moods.tired']['mono'])->toBeTrue()
        ->and($t['assets']['icons.seal']['url'])->toContain('/themes/dusk/')   // not in the set
        ->and(Themes::forClient('doodle', 'en')['credit'])->toContain('CC BY')
        ->and(Themes::forClient('dusk', 'en')['credit'])->toBeNull();

    // cleaned for masks: no white inner fills or classes left / ไม่มีพื้นสีขาวเหลือ
    foreach (glob(public_path('themes/doodle/*/*.svg')) as $f) {
        expect(file_get_contents($f))->not->toContain('#ffffff')->not->toContain('class=');
    }
});
