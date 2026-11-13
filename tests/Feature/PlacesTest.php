<?php

use App\Models\CityVisit;
use App\Models\Feature;
use App\Models\Moment;
use App\Models\Place;
use App\Models\Space;
use App\Models\User;
use App\Services\Location;
use App\Support\Features;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

function placeCouple(): array
{
    test()->travelTo(Carbon::parse('2026-11-13 10:00', 'Asia/Bangkok'));
    [$a, $b] = User::factory()->count(2)->create(['share_location' => true]);
    $space = Space::factory()->withMembers($a, $b)->create();

    return [$space, $a, $b];
}

function postedMoment(Space $space, User $by): Moment
{
    return $space->moments()->create(['user_id' => $by->id, 'body' => 'hi', 'status' => Moment::STATUS_POSTED, 'posted_at' => now()]);
}

test('both partners can add, edit and delete places; they show on the calendar tab', function () {
    [$space, $a, $b] = placeCouple();

    $this->actingAs($a)->post(route('spaces.places.store', $space), [
        'name' => 'Little café', 'kind' => 'first_date', 'city' => 'Bangkok', 'date' => '2024-02-14', 'note' => 'rain',
    ])->assertRedirect();
    $place = Place::firstOrFail();
    expect($place->created_by)->toBe($a->id);

    $this->actingAs($b)->patch(route('spaces.places.update', [$space, $place]), ['name' => 'The little café', 'kind' => 'first_date', 'city' => null, 'note' => null, 'date' => null])->assertRedirect();
    expect($place->fresh()->name)->toBe('The little café')->and($place->fresh()->city)->toBeNull();

    $this->actingAs($b)->get(route('spaces.show', $space))->assertInertia(fn ($page) => $page
        ->where('places.items.0.name', 'The little café')
        ->where('places.items.0.author', $a->name)
        ->where('places.visits', []));

    $this->actingAs($b)->delete(route('spaces.places.destroy', [$space, $place]))->assertRedirect();
    expect(Place::count())->toBe(0);
});

test('validation: kind must be known', function () {
    [$space, $a] = placeCouple();
    $this->actingAs($a)->post(route('spaces.places.store', $space), ['name' => 'x', 'kind' => 'castle'])
        ->assertSessionHasErrors('kind');
});

test('a postcard can be linked to a place (existing, new, none); deleting the place keeps the postcard', function () {
    [$space, $a, $b] = placeCouple();
    $m = postedMoment($space, $a);
    $place = $space->places()->create(['name' => 'Beach', 'kind' => 'trip']);

    $this->actingAs($b)->put(route('spaces.moments.place', [$space, $m]), ['mode' => 'existing', 'place_id' => $place->id])->assertRedirect();
    expect($m->fresh()->place_id)->toBe($place->id);

    $this->actingAs($a)->get(route('spaces.moments', $space))->assertInertia(fn ($page) => $page
        ->where('moments.0.place', ['id' => $place->id, 'name' => 'Beach', 'kind' => 'trip'])
        ->where('placeOptions.0.moments', 1));

    $this->actingAs($a)->put(route('spaces.moments.place', [$space, $m]), ['mode' => 'new', 'name' => 'Home', 'kind' => 'home']);
    expect($m->fresh()->place->name)->toBe('Home');

    $m->fresh()->place->delete();
    expect($m->fresh())->not->toBeNull()->and($m->fresh()->place_id)->toBeNull();

    $this->actingAs($a)->put(route('spaces.moments.place', [$space, $m]), ['mode' => 'none']);
    expect($m->fresh()->place_id)->toBeNull();
});

test('places of another space can never be linked or touched (the wall)', function () {
    [$space, $a] = placeCouple();
    [$other] = placeCouple();
    $theirs = $other->places()->create(['name' => 'Secret', 'kind' => 'other']);
    $m = postedMoment($space, $a);

    $this->actingAs($a)->put(route('spaces.moments.place', [$space, $m]), ['mode' => 'existing', 'place_id' => $theirs->id])
        ->assertSessionHasErrors('place_id');
    $this->actingAs($a)->patch(route('spaces.places.update', [$space, $theirs]), ['name' => 'x', 'kind' => 'other'])->assertNotFound();
    $this->actingAs($a)->delete(route('spaces.places.destroy', [$space, $theirs]))->assertNotFound();
    $this->actingAs($a)->post(route('spaces.events.store', $space), [
        'title' => 'Trip', 'date' => '2026-12-01', 'kind' => 'special', 'place_id' => $theirs->id,
    ])->assertSessionHasErrors('place_id');
    expect($theirs->fresh()->name)->toBe('Secret');
});

test('a date can be linked to a place', function () {
    [$space, $a] = placeCouple();
    $place = $space->places()->create(['name' => 'Beach', 'kind' => 'trip']);
    $this->actingAs($a)->post(route('spaces.events.store', $space), [
        'title' => 'Trip', 'date' => '2026-12-01', 'kind' => 'special', 'place_id' => $place->id,
    ])->assertRedirect();

    $this->actingAs($a)->get(route('spaces.show', $space))->assertInertia(fn ($page) => $page
        ->where('places.items.0.events', 1)
        ->where('events.0.place_id', $place->id));
});

test('"where I am" returns a city name and stores nothing', function () {
    Http::fake(['nominatim.openstreetmap.org/*' => Http::response(['address' => ['city' => 'Chiang Mai']])]);
    [$space, $a] = placeCouple();
    $before = $a->fresh()->only(['loc_lat', 'loc_lng', 'loc_city']);

    $this->actingAs($a)->postJson(route('spaces.places.here', $space), ['lat' => 18.7883, 'lng' => 98.9853])
        ->assertOk()->assertJson(['city' => 'Chiang Mai']);
    expect($a->fresh()->only(['loc_lat', 'loc_lng', 'loc_city']))->toBe($before)
        ->and(Place::count())->toBe(0);
});

test('city list: off by default, logs a new stay only when the city changes, deleted when turned off', function () {
    $city = 'Bangkok';
    Http::fake(['nominatim.openstreetmap.org/*' => fn () => Http::response(['address' => ['city' => $GLOBALS['__city']]])]);
    $GLOBALS['__city'] = $city;
    [$space, $a, $b] = placeCouple();
    $loc = app(Location::class);

    $loc->update($a, 13.75, 100.50, 'Asia/Bangkok');
    expect(CityVisit::count())->toBe(0);   // not turned on / ยังไม่เปิด

    $this->actingAs($a)->put(route('location.history'), ['on' => true])->assertRedirect();
    expect(CityVisit::count())->toBe(1);

    test()->travelTo(Carbon::parse('2026-11-14 10:00', 'Asia/Bangkok'));
    $loc->update($a->fresh(), 13.80, 100.55, 'Asia/Bangkok');   // same city / เมืองเดิม
    expect(CityVisit::count())->toBe(1);

    $GLOBALS['__city'] = 'Chiang Mai';
    test()->travelTo(Carbon::parse('2026-11-20 10:00', 'Asia/Bangkok'));
    $loc->update($a->fresh(), 18.79, 98.99, 'Asia/Bangkok');
    $visits = CityVisit::orderBy('id')->get();
    expect($visits)->toHaveCount(2)
        ->and($visits[0]->only(['city']))->toBe(['city' => 'Bangkok'])
        ->and($visits[0]->to_date->toDateString())->toBe('2026-11-20')
        ->and($visits[1]->city)->toBe('Chiang Mai')->and($visits[1]->to_date)->toBeNull();

    // the partner sees it (they chose to share it) / คู่เห็น
    $this->actingAs($b)->get(route('spaces.show', $space))->assertInertia(fn ($page) => $page
        ->where('places.visits.0.city', 'Chiang Mai')
        ->where('places.visits.0.mine', false));

    $this->actingAs($a)->put(route('location.history'), ['on' => false]);
    expect(CityVisit::count())->toBe(0)->and($a->fresh()->keep_city_history)->toBeFalse();
});

test('places are hidden and refused when the feature is off', function () {
    [$space, $a] = placeCouple();
    Feature::updateOrCreate(['key' => 'places'], ['enabled' => false, 'tier' => 'free']);
    Features::flush();

    $this->actingAs($a)->get(route('spaces.show', $space))->assertInertia(fn ($page) => $page->where('places', null));
    $this->actingAs($a)->post(route('spaces.places.store', $space), ['name' => 'x', 'kind' => 'other'])->assertNotFound();
});

test('export includes places I added and my city list', function () {
    [$space, $a] = placeCouple();
    $space->places()->create(['name' => 'Beach', 'kind' => 'trip', 'created_by' => $a->id]);
    CityVisit::create(['user_id' => $a->id, 'city' => 'Bangkok', 'from_date' => '2026-11-01']);

    $data = app(App\Services\AccountData::class)->collect($a);
    expect($data['places_added'][0]['name'])->toBe('Beach')
        ->and($data['city_history'][0]['city'])->toBe('Bangkok');
});
