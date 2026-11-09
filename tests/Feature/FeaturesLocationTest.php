<?php

use App\Models\Feature;
use App\Models\Moment;
use App\Models\Prompt;
use App\Models\Space;
use App\Models\SpaceInvite;
use App\Models\User;
use App\Services\DailyPrompts;
use App\Services\Location;
use App\Services\SpaceCalendar;
use App\Support\Features;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(fn () => Features::flush());

function flCouple(): array
{
    [$a, $b] = User::factory()->count(2)->create(['locale' => 'en']);

    return [Space::factory()->withMembers($a, $b)->create(), $a, $b];
}

function setFeature(string $key, bool $enabled, string $tier = 'free'): void
{
    Feature::updateOrCreate(['key' => $key], ['enabled' => $enabled, 'tier' => $tier]);
}

function fakeGeo(): void
{
    // North of 16°N → Chiang Mai, else Bangkok. / ตอบชื่อเมืองตามละติจูด
    Http::fake(['nominatim.openstreetmap.org/*' => fn ($req) => Http::response([
        'address' => ['city' => (float) $req->data()['lat'] > 16 ? 'Chiang Mai' : 'Bangkok'],
    ])]);
}

// ── Feature switches / สวิตช์ฟีเจอร์ ───────────────────────────────────

test('features are on and free by default; premium works only in premium spaces', function () {
    [$space, $a] = flCouple();
    expect(Features::on('photos', $space))->toBeTrue();

    setFeature('photos', true, 'premium');
    expect(Features::on('photos', $space))->toBeFalse();

    $space->forceFill(['premium' => true])->save();
    expect(Features::on('photos', $space->fresh()))->toBeTrue();

    setFeature('themes', true, 'premium');
    expect(Features::on('themes', $a))->toBeTrue();   // person counts as premium via the space
});

test('photos off: moments without photos still work, photos are refused', function () {
    [$space, $a] = flCouple();
    setFeature('photos', false);

    $this->actingAs($a)->post(route('spaces.moments.store', $space), ['body' => 'words only', 'publish' => true])->assertSessionHasNoErrors();
    $this->actingAs($a)->post(route('spaces.moments.store', $space), [
        'body' => 'x', 'publish' => true, 'photos' => [UploadedFile::fake()->image('a.jpg')],
    ])->assertSessionHasErrors('photos');

    expect(Moment::count())->toBe(1);
});

test('quests off: weekends get a question', function () {
    Prompt::create(['kind' => 'question', 'text_en' => 'Q?']);
    Prompt::create(['kind' => 'quest', 'text_en' => 'Do it.']);
    $this->travelTo(Carbon::parse('2026-11-14 10:00', 'Asia/Bangkok'));   // Saturday
    [$space] = flCouple();
    setFeature('quests', false);

    expect(app(DailyPrompts::class)->forDate($space, $space->today())->prompt->kind)->toBe('question');
});

test('couple-written prompts off: cannot add, and queued ones are skipped', function () {
    Prompt::create(['kind' => 'question', 'text_en' => 'Library?']);
    [$space, $a] = flCouple();
    $space->customPrompts()->create(['kind' => 'question', 'text_en' => 'Ours?', 'created_by' => $a->id]);
    setFeature('custom_prompts', false);

    $this->actingAs($a)->post(route('spaces.prompts.store', $space), ['kind' => 'question', 'text' => 'x'])->assertNotFound();
    expect(app(DailyPrompts::class)->forDate($space, $space->today())->prompt->text_en)->toBe('Library?');
});

test('themes off: everyone gets blush and cannot change it', function () {
    $a = User::factory()->create(['theme' => 'candle']);
    setFeature('themes', false);

    $this->actingAs($a)->get(route('profile.edit'))->assertSee('data-theme="blush"', false);
    $this->actingAs($a)->put(route('theme.update'), ['theme' => 'paper'])->assertForbidden();
});

test('memories off: no "on this day"', function () {
    $this->travelTo(Carbon::parse('2026-11-09 09:00', 'Asia/Bangkok'));
    [$space, $a] = flCouple();
    $e = $space->events()->create(['title' => 'First date', 'date' => '2024-11-09', 'kind' => 'special', 'repeats_yearly' => true]);
    $space->moments()->create(['user_id' => $a->id, 'space_event_id' => $e->id, 'status' => 'posted', 'posted_at' => '2025-11-09 10:00:00', 'body' => 'x']);

    expect(app(SpaceCalendar::class)->memories($space, $space->today()))->toHaveCount(1);
    setFeature('memories', false);
    expect(app(SpaceCalendar::class)->memories($space, $space->today()))->toBe([]);
});

test('poly off: a second space can be neither created nor joined; the first one is fine', function () {
    [$space, $a, $b] = flCouple();
    $c = User::factory()->create();
    $cSpace = Space::factory()->withMembers($c)->create();
    $code = $cSpace->invites()->create(['code' => SpaceInvite::generateCode(), 'created_by' => $c->id, 'expires_at' => now()->addDay()])->code;
    setFeature('poly', false);

    $this->actingAs($a)->post(route('spaces.store'), ['name' => 'second']);
    expect($a->spaces()->count())->toBe(1);

    $this->actingAs($a)->post(route('invites.accept', $code))->assertRedirect();
    expect($cSpace->members()->count())->toBe(1);

    setFeature('poly', true);
    $this->actingAs($a)->post(route('invites.accept', $code));
    expect($cSpace->members()->count())->toBe(2);
});

test('non-admins cannot change features; admins can', function () {
    $u = User::factory()->create();
    $this->actingAs($u)->put(route('admin.features.update', 'photos'), ['enabled' => false, 'tier' => 'free'])->assertNotFound();

    $u->forceFill(['is_admin' => true])->save();
    $this->actingAs($u)->put(route('admin.features.update', 'photos'), ['enabled' => false, 'tier' => 'premium'])->assertRedirect();
    $this->actingAs($u)->put(route('admin.features.update', 'nope'), ['enabled' => false, 'tier' => 'free'])->assertNotFound();
    expect(Feature::find('photos')->tier)->toBe('premium');
});

// ── Location / ตำแหน่ง ──────────────────────────────────────────────

test('location is rounded to ~5 km, needs sharing on, and turning off deletes it', function () {
    fakeGeo();
    [$space, $a] = flCouple();

    $this->actingAs($a)->postJson(route('location.update'), ['lat' => 18.7883, 'lng' => 98.9853])->assertStatus(409);

    $this->actingAs($a)->put(route('location.toggle'), ['on' => true]);
    $this->actingAs($a)->postJson(route('location.update'), ['lat' => 18.7883, 'lng' => 98.9853, 'tz' => 'Asia/Bangkok'])->assertOk();

    $a->refresh();
    expect($a->loc_lat)->toBe(18.8)->and($a->loc_lng)->toBe(99.0)->and($a->loc_city)->toBe('Chiang Mai');
    Http::assertSent(fn ($r) => str_contains($r->url(), 'lat=18.8') && ! str_contains($r->url(), '18.7883'));

    $this->actingAs($a)->put(route('location.toggle'), ['on' => false]);
    expect($a->fresh()->loc_lat)->toBeNull()->and($a->fresh()->loc_city)->toBeNull();
});

test('partners see distance, city and timezone only when BOTH share; never coordinates', function () {
    fakeGeo();
    [$space, $a, $b] = flCouple();
    $a->forceFill(['share_location' => true])->save();
    app(Location::class)->update($a, 13.75, 100.5, 'Asia/Bangkok');
    $b->forceFill(['share_location' => true])->save();

    $props = fn () => $this->actingAs($a->fresh())->get(route('spaces.show', $space))->viewData('page')['props'];
    expect($props()['location']['km'])->toBeNull();   // B shares but has no fix yet

    app(Location::class)->update($b->fresh(), 18.79, 98.98, 'Asia/Bangkok');
    $loc = $props()['location'];

    expect($loc['km'])->toBeGreaterThan(560)->toBeLessThan(620)
        ->and($loc['partner_city'])->toBe('Chiang Mai')
        ->and($loc['partner_tz'])->toBe('Asia/Bangkok')
        ->and($loc['suggest_long_distance'])->toBeTrue();

    $page = json_encode($this->actingAs($a->fresh())->get(route('spaces.daily', $space))->viewData('page'));
    expect($page)->not->toContain('loc_lat')->not->toContain('18.8')->not->toContain('100.5');

    $a->forceFill(['share_location' => false])->save();
    expect($props()['location']['km'])->toBeNull()->and($props()['location']['partner_city'])->toBeNull();
});

test('location off as a feature: no location prop, updates refused, long-distance mode 404', function () {
    [$space, $a] = flCouple();
    $a->forceFill(['share_location' => true])->save();
    setFeature('location', false);

    expect($this->actingAs($a)->get(route('spaces.show', $space))->viewData('page')['props']['location'])->toBeNull();
    $this->actingAs($a)->postJson(route('location.update'), ['lat' => 1, 'lng' => 1])->assertForbidden();
    $this->actingAs($a)->put(route('spaces.long-distance', $space), ['on' => true])->assertNotFound();
});

test('repeat updates from the same spot within 30 minutes are skipped', function () {
    fakeGeo();
    $a = User::factory()->create(['share_location' => true]);
    $loc = app(Location::class);

    expect($loc->update($a, 18.79, 98.98, 'Asia/Bangkok'))->toBeTrue()
        ->and($loc->update($a, 18.80, 98.99, 'Asia/Bangkok'))->toBeFalse();   // same 5 km cell
    $this->travel(31)->minutes();
    expect($loc->update($a, 18.80, 98.99, 'Asia/Bangkok'))->toBeTrue();
    Http::assertSentCount(1);   // city cached per cell
});

// ── Long-distance mode / โหมดไกลกัน ─────────────────────────────────

test('either partner switches long-distance mode; it changes which prompts come', function () {
    Prompt::create(['kind' => 'quest', 'text_en' => 'Cook together.']);                    // together (default)
    Prompt::create(['kind' => 'quest', 'fit' => 'any', 'text_en' => 'Watch a movie at the same time.']);
    Prompt::create(['kind' => 'quest', 'fit' => 'apart', 'text_en' => 'Send a photo of your view.']);
    $this->travelTo(Carbon::parse('2026-11-14 10:00', 'Asia/Bangkok'));   // Saturday
    [$space, $a, $b] = flCouple();
    $daily = app(DailyPrompts::class);

    $this->actingAs($b)->put(route('spaces.long-distance', $space), ['on' => true])->assertRedirect();
    expect($space->fresh()->long_distance)->toBeTrue();

    $got = $daily->forDate($space->fresh(), $space->today())->prompt->text_en;
    expect($got)->not->toBe('Cook together.');

    // Normal mode never gets "apart" prompts.
    [$other] = flCouple();
    $seen = collect(range(0, 1))->map(fn ($i) => $daily->forDate($other, $other->today()->subDays($i * 7))?->prompt->text_en);
    expect($seen)->not->toContain('Send a photo of your view.');
});

// ── Ratings / ให้คะแนน ──────────────────────────────────────────────

test('rating is private: I see mine, my partner never sees it', function () {
    Prompt::create(['kind' => 'question', 'text_en' => 'Q?']);
    $this->travelTo(Carbon::parse('2026-11-11 10:00', 'Asia/Bangkok'));
    [$space, $a, $b] = flCouple();
    $d = app(DailyPrompts::class)->forDate($space, $space->today());

    $this->actingAs($a)->put(route('spaces.ratings.update', [$space, $d]), ['value' => -1])->assertRedirect();
    $this->actingAs($a)->put(route('spaces.ratings.update', [$space, $d]), ['value' => 1]);

    $mine = $this->actingAs($a)->get(route('spaces.daily', $space))->viewData('page')['props']['days'][0];
    $theirs = $this->actingAs($b)->get(route('spaces.daily', $space))->viewData('page')['props']['days'][0];
    expect($mine['my_rating'])->toBe(1)->and($theirs['my_rating'])->toBe(0)
        ->and($d->ratings()->count())->toBe(1);

    $this->actingAs($a)->put(route('spaces.ratings.update', [$space, $d]), ['value' => 0]);
    expect($d->ratings()->count())->toBe(0);

    $this->actingAs($a)->put(route('spaces.ratings.update', [$space, $d]), ['value' => 5])->assertSessionHasErrors('value');
});

test('cannot rate another space\'s day', function () {
    Prompt::create(['kind' => 'question', 'text_en' => 'Q?']);
    [$ab, $a] = flCouple();
    [$cd] = flCouple();
    $d = app(DailyPrompts::class)->forDate($cd, $cd->today());

    $this->actingAs($a)->put(route('spaces.ratings.update', [$ab, $d]), ['value' => 1])->assertNotFound();
    $this->actingAs($a)->put(route('spaces.ratings.update', [$cd, $d]), ['value' => 1])->assertNotFound();
});
