<?php

use App\Models\Feature;
use App\Models\Space;
use App\Models\User;
use App\Support\Features;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(fn () => Features::flush());

// Cards are drawn on the phone; the server only says whether sharing is on (hidden when off).
// การ์ดวาดบนเครื่อง เซิร์ฟเวอร์บอกแค่ว่าเปิดฟีเจอร์ไหม (ปิด = ซ่อนปุ่ม)
test('the sharing switch reaches every space tab and can be turned off', function () {
    [$a, $b] = User::factory()->count(2)->create();
    $space = Space::factory()->withMembers($a, $b)->create();

    $this->actingAs($a)->get(route('spaces.moments', $space))
        ->assertInertia(fn ($page) => $page->where('space.features.sharing', true));

    Feature::updateOrCreate(['key' => 'sharing'], ['enabled' => false, 'tier' => 'free']);
    Features::flush();
    $this->actingAs($a)->get(route('spaces.show', $space))
        ->assertInertia(fn ($page) => $page->where('space.features.sharing', false));
});
