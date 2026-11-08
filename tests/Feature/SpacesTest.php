<?php

use App\Models\Space;
use App\Models\SpaceInvite;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

function inviteFor(Space $space, User $by): SpaceInvite
{
    return $space->invites()->create([
        'code' => SpaceInvite::generateCode(),
        'created_by' => $by->id,
        'expires_at' => now()->addDays(7),
    ]);
}

// ── Creating & pairing / สร้างและจับคู่ ──────────────────────────────

test('a user can create a space and gets an invite', function () {
    $a = User::factory()->create();

    $this->actingAs($a)->post(route('spaces.store'))->assertRedirect();

    $space = $a->spaces()->first();
    expect($space)->not->toBeNull()
        ->and($space->members)->toHaveCount(1)
        ->and($space->invites()->whereNull('accepted_at')->count())->toBe(1);
});

test('partner joins with the invite code', function () {
    [$a, $b] = User::factory()->count(2)->create();
    $space = Space::factory()->withMembers($a)->create();
    $invite = inviteFor($space, $a);

    $this->actingAs($b)->post(route('invites.accept', $invite->code))
        ->assertRedirect(route('spaces.show', $space));

    expect($space->fresh()->members)->toHaveCount(2)
        ->and($invite->fresh()->accepted_by)->toBe($b->id);
});

test('typed codes are forgiving about case and dashes', function () {
    [$a, $b] = User::factory()->count(2)->create();
    $space = Space::factory()->withMembers($a)->create();
    $invite = inviteFor($space, $a);
    $messy = strtolower(substr($invite->code, 0, 4).'-'.substr($invite->code, 4));

    $this->actingAs($b)->post(route('invites.accept', $messy));

    expect($space->hasMember($b))->toBeTrue();
});

test('a space never gets a third member', function () {
    [$a, $b, $c] = User::factory()->count(3)->create();
    $space = Space::factory()->withMembers($a, $b)->create();
    $invite = inviteFor($space, $a);

    $this->actingAs($c)->post(route('invites.accept', $invite->code));

    expect($space->fresh()->members)->toHaveCount(2)
        ->and($space->hasMember($c))->toBeFalse();
});

test('expired invites do not work', function () {
    [$a, $b] = User::factory()->count(2)->create();
    $space = Space::factory()->withMembers($a)->create();
    $invite = inviteFor($space, $a);
    $invite->update(['expires_at' => now()->subMinute()]);

    $this->actingAs($b)->post(route('invites.accept', $invite->code));

    expect($space->hasMember($b))->toBeFalse();
});

test('an invite can only be used once', function () {
    [$a, $b] = User::factory()->count(2)->create();
    $space = Space::factory()->withMembers($a)->create();
    $invite = inviteFor($space, $a);
    $invite->forceFill(['accepted_at' => now(), 'accepted_by' => $b->id])->save();

    $c = User::factory()->create();
    $this->actingAs($c)->post(route('invites.accept', $invite->code));

    expect($space->hasMember($c))->toBeFalse();
});

test('the same two people cannot open a second active space together', function () {
    [$a, $b] = User::factory()->count(2)->create();
    Space::factory()->withMembers($a, $b)->create();
    $second = Space::factory()->withMembers($a)->create();

    $this->actingAs($b)->post(route('invites.accept', inviteFor($second, $a)->code));

    expect($second->hasMember($b))->toBeFalse();
});

test('poly: one person can be in several pair spaces', function () {
    [$a, $b, $c] = User::factory()->count(3)->create();
    $ab = Space::factory()->withMembers($a)->create();
    $ac = Space::factory()->withMembers($a)->create();

    $this->actingAs($b)->post(route('invites.accept', inviteFor($ab, $a)->code));
    $this->actingAs($c)->post(route('invites.accept', inviteFor($ac, $a)->code));

    expect($a->spaces()->count())->toBe(2)
        ->and($ab->hasMember($b))->toBeTrue()
        ->and($ac->hasMember($c))->toBeTrue();
});

test('guests opening an invite link are sent back to it after signing in', function () {
    $a = User::factory()->create();
    $space = Space::factory()->withMembers($a)->create();
    $invite = inviteFor($space, $a);

    $this->get(route('invites.show', $invite->code))->assertOk()
        ->assertSessionHas('pending_invite', $invite->code);

    $b = User::factory()->create();
    $this->actingAs($b)->get(route('dashboard'))
        ->assertRedirect(route('invites.show', $invite->code));
});

test('a used invite does not reveal who sent it', function () {
    [$a, $b, $c] = User::factory()->count(3)->create();
    $space = Space::factory()->withMembers($a, $b)->create();
    $invite = inviteFor($space, $a);
    $invite->forceFill(['accepted_at' => now(), 'accepted_by' => $b->id])->save();

    $this->actingAs($c)->get(route('invites.show', $invite->code))
        ->assertInertia(fn ($page) => $page
            ->where('problem', 'expired')
            ->where('inviter', null));
});

test('joining shows a welcome toast', function () {
    [$a, $b] = User::factory()->count(2)->create();
    $space = Space::factory()->withMembers($a)->create();

    $this->actingAs($b)->post(route('invites.accept', inviteFor($space, $a)->code))
        ->assertInertiaFlash('toast.type', 'success');
});

// ── The wall / กำแพงระหว่าง space ─────────────────────────────────

test('outsiders get 404 on a space, not 403', function () {
    [$a, $b, $c] = User::factory()->count(3)->create();
    $space = Space::factory()->withMembers($a, $b)->create();

    $this->actingAs($c)->get(route('spaces.show', $space))->assertNotFound();
    $this->actingAs($c)->patch(route('spaces.update', $space), ['timezone' => 'UTC'])->assertNotFound();
    $this->actingAs($c)->post(route('spaces.freeze', $space))->assertNotFound();
});

test('poly wall: B cannot see the A↔C space', function () {
    [$a, $b, $c] = User::factory()->count(3)->create();
    Space::factory()->withMembers($a, $b)->create();
    $ac = Space::factory()->withMembers($a, $c)->create();

    $this->actingAs($b)->get(route('spaces.show', $ac))->assertNotFound();
});

test('shared props only list the users own spaces', function () {
    [$a, $b, $c] = User::factory()->count(3)->create();
    $ab = Space::factory()->withMembers($a, $b)->create();
    $ac = Space::factory()->withMembers($a, $c)->create();

    $this->actingAs($b)->get(route('spaces.show', $ab))
        ->assertInertia(fn ($page) => $page
            ->has('spaces', 1)
            ->where('spaces.0.id', $ab->ulid));
});

test('members can see their space', function () {
    [$a, $b] = User::factory()->count(2)->create();
    $space = Space::factory()->withMembers($a, $b)->create();

    $this->actingAs($b)->get(route('spaces.show', $space))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('spaces/show')
            ->where('space.partner.name', $a->name));
});

test('guests are redirected to login', function () {
    $space = Space::factory()->create();

    $this->get(route('spaces.show', $space))->assertRedirect(route('login'));
});

// ── Unpair / เลิกจับคู่ ───────────────────────────────────────────

test('unpair freezes the space for 30 days and makes it read-only', function () {
    [$a, $b] = User::factory()->count(2)->create();
    $space = Space::factory()->withMembers($a, $b)->create();

    $this->actingAs($a)->post(route('spaces.freeze', $space))->assertRedirect();

    $space->refresh();
    expect($space->isFrozen())->toBeTrue()
        ->and((int) round(now()->diffInDays($space->delete_after)))->toBe(30);

    // Still viewable (export later), but no more writes.
    $this->actingAs($b)->get(route('spaces.show', $space))->assertOk();
    $this->actingAs($b)->patch(route('spaces.update', $space), ['timezone' => 'UTC'])->assertStatus(423);
});

test('freezing one space leaves the users other spaces alone', function () {
    [$a, $b, $c] = User::factory()->count(3)->create();
    $ab = Space::factory()->withMembers($a, $b)->create();
    $ac = Space::factory()->withMembers($a, $c)->create();

    $this->actingAs($a)->post(route('spaces.freeze', $ab));

    expect($ab->fresh()->isFrozen())->toBeTrue()
        ->and($ac->fresh()->isActive())->toBeTrue();
});

test('only the person who froze a space can restore it', function () {
    [$a, $b] = User::factory()->count(2)->create();
    $space = Space::factory()->withMembers($a, $b)->create();
    $space->freeze($a);

    $this->actingAs($b)->post(route('spaces.restore', $space))->assertForbidden();
    $this->actingAs($a)->post(route('spaces.restore', $space))->assertRedirect();

    expect($space->fresh()->isActive())->toBeTrue();
});

test('frozen spaces cannot be joined', function () {
    [$a, $b] = User::factory()->count(2)->create();
    $space = Space::factory()->withMembers($a)->create();
    $invite = inviteFor($space, $a);
    $space->freeze($a);

    $this->actingAs($b)->post(route('invites.accept', $invite->code));

    expect($space->hasMember($b))->toBeFalse();
});

test('purge deletes spaces only after the 30 days are up', function () {
    [$a, $b] = User::factory()->count(2)->create();
    $old = Space::factory()->withMembers($a, $b)->create();
    $recent = Space::factory()->withMembers($a)->create();
    $old->freeze($a);
    $recent->freeze($a);
    $old->forceFill(['delete_after' => now()->subMinute()])->save();

    $this->artisan('spaces:purge')->assertSuccessful();

    expect(Space::find($old->id))->toBeNull()
        ->and(Space::find($recent->id))->not->toBeNull();
});

// ── Locale / ภาษา ─────────────────────────────────────────────────

test('users can switch language and it sticks', function () {
    $a = User::factory()->create(['locale' => 'th']);

    $this->actingAs($a)->post(route('locale.update'), ['locale' => 'en'])->assertRedirect();

    expect($a->fresh()->locale)->toBe('en');
});

test('unsupported languages are rejected', function () {
    $this->post(route('locale.update'), ['locale' => 'fr'])->assertSessionHasErrors('locale');
});
