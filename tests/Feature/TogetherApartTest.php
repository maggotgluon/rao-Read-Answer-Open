<?php

use App\Models\Space;
use App\Models\SpaceDistanceDay;
use App\Models\User;
use App\Services\Location;
use App\Services\SpaceStory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(fn () => Http::fake(['nominatim.openstreetmap.org/*' => Http::response(['address' => ['city' => 'Testville']])]));

function storyCouple(string $at = '2026-11-01 09:00'): array
{
    test()->travelTo(Carbon::parse($at, 'Asia/Bangkok'));
    [$a, $b] = User::factory()->count(2)->create(['share_location' => true]);
    $space = Space::factory()->withMembers($a, $b)->create();

    return [$space, $a, $b];
}

function storyOf(Space $space): array
{
    return app(SpaceStory::class)->timeline($space->fresh());
}

test('a new space starts its timeline together, from the day you paired', function () {
    [$space] = storyCouple();
    test()->travelTo(Carbon::parse('2026-11-10 12:00', 'Asia/Bangkok'));

    $s = storyOf($space);
    expect($s['since'])->toBe('2026-11-01')
        ->and($s['periods'])->toBe([['mode' => 'together', 'from' => '2026-11-01', 'to' => null, 'days' => 10]])
        ->and($s['together_days'])->toBe(10)->and($s['apart_days'])->toBe(0);
});

test('switching long-distance mode is logged and builds periods', function () {
    [$space, $a] = storyCouple();

    test()->travelTo(Carbon::parse('2026-11-05 20:00', 'Asia/Bangkok'));
    $this->actingAs($a)->put(route('spaces.long-distance', $space), ['on' => true])->assertRedirect();
    // switching on again changes nothing / เปิดซ้ำไม่บันทึกเพิ่ม
    $this->actingAs($a)->put(route('spaces.long-distance', $space), ['on' => true]);

    test()->travelTo(Carbon::parse('2026-11-20 08:00', 'Asia/Bangkok'));
    $this->actingAs($a)->put(route('spaces.long-distance', $space), ['on' => false]);

    expect($space->modeChanges()->count())->toBe(3);
    $s = storyOf($space);
    expect($s['periods'])->toBe([
        ['mode' => 'together', 'from' => '2026-11-20', 'to' => null, 'days' => 1],
        ['mode' => 'apart', 'from' => '2026-11-05', 'to' => '2026-11-19', 'days' => 15],
        ['mode' => 'together', 'from' => '2026-11-01', 'to' => '2026-11-04', 'days' => 4],
    ])->and($s['together_days'])->toBe(5)->and($s['apart_days'])->toBe(15);
});

test('switching back and forth on the same day keeps only the last mode', function () {
    [$space, $a] = storyCouple();
    test()->travelTo(Carbon::parse('2026-11-03 10:00', 'Asia/Bangkok'));
    $space->setLongDistance(true, $a);
    test()->travelTo(Carbon::parse('2026-11-03 11:00', 'Asia/Bangkok'));
    $space->setLongDistance(false, $a);

    expect(storyOf($space)['periods'])->toHaveCount(1)
        ->and(storyOf($space)['periods'][0]['from'])->toBe('2026-11-01');
});

test('distance is saved only when both share a fresh location, rounded to 10 km', function () {
    [$space, $a, $b] = storyCouple();
    $loc = app(Location::class);

    $loc->update($a, 13.7563, 100.5018, 'Asia/Bangkok');        // Bangkok
    expect(SpaceDistanceDay::count())->toBe(0);                  // partner has no location yet

    $loc->update($b, 18.7883, 98.9853, 'Asia/Bangkok');         // Chiang Mai
    $row = SpaceDistanceDay::first();
    expect($row->date->toDateString())->toBe('2026-11-01')
        ->and($row->km % 10)->toBe(0)
        ->and($row->km)->toBeGreaterThan(560)->toBeLessThan(600);

    // a partner location older than a day doesn't count / ตำแหน่งเก่าเกิน 1 วันไม่นับ
    test()->travelTo(Carbon::parse('2026-11-03 09:00', 'Asia/Bangkok'));
    $loc->update($a, 13.9, 100.6, 'Asia/Bangkok');
    expect(SpaceDistanceDay::count())->toBe(1);

    // stopping sharing stops recording / หยุดแชร์ก็หยุดบันทึก
    $b->forceFill(['share_location' => false])->save();
    $loc->update($b->fresh(), 13.9, 100.6, 'Asia/Bangkok');
    expect(SpaceDistanceDay::count())->toBe(1);
});

test('calendar days carry km; any member can delete the distance history; outsiders get 404', function () {
    [$space, $a, $b] = storyCouple('2026-11-12 09:00');
    SpaceDistanceDay::create(['space_id' => $space->id, 'date' => '2026-11-12', 'km' => 570]);

    $this->actingAs($a)->get(route('spaces.show', $space))->assertInertia(fn ($page) => $page
        ->where('calendar.days.11.km', 570)
        ->where('calendar.days.10.km', null)
        ->where('story.has_distance', true));

    $outsider = User::factory()->create();
    $this->actingAs($outsider)->delete(route('spaces.distance.forget', $space))->assertNotFound();
    expect(SpaceDistanceDay::count())->toBe(1);

    $this->actingAs($b)->delete(route('spaces.distance.forget', $space))->assertRedirect();
    expect(SpaceDistanceDay::count())->toBe(0)
        ->and($space->modeChanges()->count())->toBe(1);   // periods stay
});

test('no story or km when the location feature is off', function () {
    [$space, $a] = storyCouple('2026-11-12 09:00');
    SpaceDistanceDay::create(['space_id' => $space->id, 'date' => '2026-11-12', 'km' => 570]);
    App\Models\Feature::updateOrCreate(['key' => 'location'], ['enabled' => false, 'tier' => 'free']);
    App\Support\Features::flush();

    $this->actingAs($a)->get(route('spaces.show', $space))->assertInertia(fn ($page) => $page
        ->where('story', null)
        ->where('calendar.days.11.km', null));
});

test('the data export includes the space timeline and distances', function () {
    [$space, $a] = storyCouple('2026-11-12 09:00');
    SpaceDistanceDay::create(['space_id' => $space->id, 'date' => '2026-11-12', 'km' => 570]);

    $data = app(App\Services\AccountData::class)->collect($a);
    expect($data['spaces'][0]['distance_km_by_day']->all())->toBe(['2026-11-12' => 570])
        ->and($data['spaces'][0]['long_distance_changes'])->toHaveCount(1);
});
