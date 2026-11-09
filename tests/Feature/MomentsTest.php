<?php

use App\Models\Moment;
use App\Models\Space;
use App\Models\User;
use App\Services\MomentPhotos;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(fn () => Storage::fake(MomentPhotos::DISK));

/** @return array{0: Space, 1: User, 2: User} */
function pair(): array
{
    [$a, $b] = User::factory()->count(2)->create();

    return [Space::factory()->withMembers($a, $b)->create(), $a, $b];
}

function post($test, Space $space, User $user, array $data)
{
    return $test->actingAs($user)->post(route('spaces.moments.store', $space), $data);
}

function props($test, Space $space, User $user): array
{
    return $test->actingAs($user)->get(route('spaces.moments', $space))->assertOk()->viewData('page')['props'];
}

function photo(int $w = 800, int $h = 600): UploadedFile
{
    return UploadedFile::fake()->image('p.jpg', $w, $h);
}

// ── Posting / โพสต์ ──────────────────────────────────────────────

test('a posted quote shows up for the partner', function () {
    [$space, $a, $b] = pair();

    post($this, $space, $a, ['body' => 'Coffee with you ☕', 'publish' => true])->assertRedirect();

    $moments = props($this, $space, $b)['moments'];
    expect($moments)->toHaveCount(1)
        ->and($moments[0]['body'])->toBe('Coffee with you ☕')
        ->and($moments[0]['mine'])->toBeFalse();
});

test('photos are re-encoded to JPEG, size-capped and stored privately', function () {
    [$space, $a] = pair();

    post($this, $space, $a, ['photos' => [photo(3000, 1000), UploadedFile::fake()->image('b.png', 400, 400)], 'publish' => true])
        ->assertRedirect()->assertSessionHasNoErrors();

    $media = Moment::first()->media;
    expect($media)->toHaveCount(2)
        ->and($media[0]->width)->toBe(2048)
        ->and($media[0]->path)->toStartWith('spaces/'.$space->ulid.'/')
        ->and($media[0]->path)->toEndWith('.jpg');

    $bytes = Storage::disk(MomentPhotos::DISK)->get($media[1]->path);
    expect(substr($bytes, 0, 3))->toBe("\xFF\xD8\xFF");     // JPEG magic, even from a PNG
    expect(is_dir(public_path('storage/spaces')))->toBeFalse();
});

test('more than 4 photos, empty moments and non-images are rejected', function () {
    [$space, $a] = pair();

    post($this, $space, $a, ['photos' => array_map(fn () => photo(), range(1, 5))])->assertSessionHasErrors('photos');
    post($this, $space, $a, ['body' => ''])->assertSessionHasErrors('body');
    post($this, $space, $a, ['photos' => [UploadedFile::fake()->create('x.pdf', 10, 'application/pdf')]])
        ->assertSessionHasErrors('photos.0');

    expect(Moment::count())->toBe(0);
});

// ── Drafts / ร่าง ────────────────────────────────────────────────

test('drafts are only visible to their author — feed, drafts list and photos', function () {
    [$space, $a, $b] = pair();
    post($this, $space, $a, ['body' => 'secret draft', 'photos' => [photo()]]);
    $moment = Moment::first();
    $media = $moment->media->first();

    expect(props($this, $space, $a)['drafts'])->toHaveCount(1)
        ->and(props($this, $space, $a)['moments'])->toHaveCount(0);

    $forB = props($this, $space, $b);
    expect($forB['drafts'])->toHaveCount(0)->and($forB['moments'])->toHaveCount(0)
        ->and(json_encode($forB))->not->toContain('secret draft');

    $url = route('spaces.media.show', [$space, $moment, $media]);
    $this->actingAs($a)->get($url)->assertOk()->assertHeader('Content-Type', 'image/jpeg');
    $this->actingAs($b)->get($url)->assertNotFound();
});

test('only the author can publish a draft', function () {
    [$space, $a, $b] = pair();
    post($this, $space, $a, ['body' => 'draft']);
    $moment = Moment::first();

    $this->actingAs($b)->post(route('spaces.moments.publish', [$space, $moment]))->assertNotFound();
    $this->actingAs($a)->post(route('spaces.moments.publish', [$space, $moment]))->assertRedirect();

    expect($moment->fresh()->status)->toBe('posted')
        ->and(props($this, $space, $b)['moments'])->toHaveCount(1);
});

// ── Deleting / ลบ ───────────────────────────────────────────────

test('only the author can delete a moment, and its files go too', function () {
    [$space, $a, $b] = pair();
    post($this, $space, $a, ['photos' => [photo()], 'publish' => true]);
    $moment = Moment::first();
    $path = $moment->media->first()->path;

    $this->actingAs($b)->delete(route('spaces.moments.destroy', [$space, $moment]))->assertForbidden();
    $this->actingAs($a)->delete(route('spaces.moments.destroy', [$space, $moment]))->assertRedirect();

    expect(Moment::count())->toBe(0);
    Storage::disk(MomentPhotos::DISK)->assertMissing($path);
});

// ── The wall / กำแพง ─────────────────────────────────────────────

test('wall: outsiders and other spaces cannot reach a moment or its photo', function () {
    [$ab, $a, $b] = pair();
    $c = User::factory()->create();
    $ac = Space::factory()->withMembers($a, $c)->create();
    post($this, $ab, $a, ['photos' => [photo()], 'publish' => true]);
    $moment = Moment::first();
    $media = $moment->media->first();

    // C directly, and C through their own A↔C space URL.
    $this->actingAs($c)->get(route('spaces.media.show', [$ab, $moment, $media]))->assertNotFound();
    $this->actingAs($c)->get(route('spaces.media.show', [$ac, $moment, $media]))->assertNotFound();
    $this->actingAs($c)->put(route('spaces.reactions.update', [$ac, $moment]), ['emoji' => '❤️'])->assertNotFound();
    $this->actingAs($c)->post(route('spaces.comments.store', [$ac, $moment]), ['body' => 'hi'])->assertNotFound();

    // A's other space doesn't show it either.
    expect(props($this, $ac, $c)['moments'])->toHaveCount(0)
        ->and(props($this, $ac, $a)['moments'])->toHaveCount(0);
});

test('photos must be revalidated every time; members get 304, outsiders still 404', function () {
    [$space, $a] = pair();
    $c = User::factory()->create();
    post($this, $space, $a, ['photos' => [photo()], 'publish' => true]);
    $moment = Moment::first();
    $url = route('spaces.media.show', [$space, $moment, $moment->media->first()]);

    $first = $this->actingAs($a)->get($url)->assertOk();
    expect($first->headers->get('Cache-Control'))->toContain('no-cache')
        ->and($first->headers->get('Cache-Control'))->toContain('private')
        ->and($first->headers->get('Cache-Control'))->not->toContain('immutable');
    $etag = $first->headers->get('ETag');

    $this->actingAs($a)->get($url, ['If-None-Match' => $etag])->assertStatus(304);
    $this->actingAs($c)->get($url, ['If-None-Match' => $etag])->assertNotFound();
});

test('guests cannot load photos', function () {
    [$space, $a] = pair();
    post($this, $space, $a, ['photos' => [photo()], 'publish' => true]);
    $moment = Moment::first();
    auth()->logout();

    $this->get(route('spaces.media.show', [$space, $moment, $moment->media->first()]))->assertRedirect(route('login'));
});

// ── Reactions & comments / รีแอคชันและคอมเมนต์ ──────────────────────

test('one reaction per person: change it, or tap the same one to remove it', function () {
    [$space, $a, $b] = pair();
    post($this, $space, $a, ['body' => 'hi', 'publish' => true]);
    $moment = Moment::first();
    $react = fn ($emoji) => $this->actingAs($b)->put(route('spaces.reactions.update', [$space, $moment]), ['emoji' => $emoji]);

    $react('❤️');
    $react('😂');
    expect($moment->reactions()->count())->toBe(1)
        ->and($moment->reactions()->value('emoji'))->toBe('😂');

    $react('😂');
    expect($moment->reactions()->count())->toBe(0);

    $react('💩')->assertSessionHasErrors('emoji');
});

test('no reactions or comments on drafts', function () {
    [$space, $a] = pair();
    post($this, $space, $a, ['body' => 'draft']);
    $moment = Moment::first();

    $this->actingAs($a)->put(route('spaces.reactions.update', [$space, $moment]), ['emoji' => '❤️'])->assertNotFound();
    $this->actingAs($a)->post(route('spaces.comments.store', [$space, $moment]), ['body' => 'x'])->assertNotFound();
});

test('comments: add, and only delete your own', function () {
    [$space, $a, $b] = pair();
    post($this, $space, $a, ['body' => 'hi', 'publish' => true]);
    $moment = Moment::first();

    $this->actingAs($b)->post(route('spaces.comments.store', [$space, $moment]), ['body' => 'love this'])->assertRedirect();
    $comment = $moment->comments()->first();
    expect(props($this, $space, $a)['moments'][0]['comments'][0]['body'])->toBe('love this');

    $this->actingAs($a)->delete(route('spaces.comments.destroy', [$space, $moment, $comment]))->assertForbidden();
    $this->actingAs($b)->delete(route('spaces.comments.destroy', [$space, $moment, $comment]))->assertRedirect();
    expect($moment->comments()->count())->toBe(0);
});

// ── Frozen & purge / แช่แข็งและลบถาวร ──────────────────────────────

test('frozen: no new moments, but photos still load', function () {
    [$space, $a] = pair();
    post($this, $space, $a, ['photos' => [photo()], 'publish' => true]);
    $moment = Moment::first();
    $space->freeze($a);

    post($this, $space, $a, ['body' => 'x', 'publish' => true])->assertStatus(423);
    $this->actingAs($a)->get(route('spaces.media.show', [$space, $moment, $moment->media->first()]))->assertOk();
});

test('purging a space deletes its photo folder', function () {
    [$space, $a] = pair();
    post($this, $space, $a, ['photos' => [photo()], 'publish' => true]);
    $folder = MomentPhotos::folder($space);
    $space->freeze($a);
    $space->forceFill(['delete_after' => now()->subMinute()])->save();

    $this->artisan('spaces:purge')->assertSuccessful();

    expect(Storage::disk(MomentPhotos::DISK)->allFiles($folder))->toBe([]);
});
