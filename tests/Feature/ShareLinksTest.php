<?php

use App\Models\DailyPrompt;
use App\Models\Feature;
use App\Models\Moment;
use App\Models\Prompt;
use App\Models\ShareLink;
use App\Models\ShareRequest;
use App\Models\Space;
use App\Models\User;
use App\Support\Features;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    Features::flush();
    Storage::fake(ShareLink::DISK);
    test()->travelTo(Carbon::parse('2026-11-14 10:00', 'Asia/Bangkok'));
});

function shareCouple(): array
{
    [$a, $b] = User::factory()->count(2)->create();
    $space = Space::factory()->withMembers($a, $b)->create();

    return [$space, $a, $b];
}

function cardPng(int $h = 1350): UploadedFile
{
    return UploadedFile::fake()->image('card.png', 1080, $h);
}

function postcard(Space $space, User $by, string $body = 'beach day'): Moment
{
    return $space->moments()->create(['user_id' => $by->id, 'body' => $body, 'status' => Moment::STATUS_POSTED, 'posted_at' => now()]);
}

function letterDay(Space $space, User $a, User $b): DailyPrompt
{
    $p = Prompt::create(['key' => 'share-q', 'kind' => 'question', 'tag' => 'fun', 'text_en' => 'Best trip?', 'text_th' => 'ทริปที่ดีที่สุด?']);
    $d = $space->dailyPrompts()->create(['date' => '2026-11-14', 'prompt_id' => $p->id, 'slot' => DailyPrompt::MAIN]);
    $d->answers()->create(['user_id' => $a->id, 'body' => 'Krabi']);
    $d->answers()->create(['user_id' => $b->id, 'body' => 'Nan']);

    return $d;
}

function makeLink(User $u, Space $space, string $type, string|int $id, string $expires = '30')
{
    return test()->actingAs($u)->post(route('spaces.share.links.store', $space), [
        'type' => $type, 'id' => (string) $id, 'expires' => $expires, 'image' => cardPng(),
    ], ['Accept' => 'application/json']);
}

test('own postcard: link is made, the public page shows only the card picture', function () {
    [$space, $a] = shareCouple();
    $m = postcard($space, $a, 'zebra-secret-words');

    $res = makeLink($a, $space, 'moment', $m->ulid)->assertCreated();
    $link = ShareLink::firstOrFail();
    expect($res->json('url'))->toBe(route('share.show', $link->token))
        ->and($link->expires_at->toDateString())->toBe('2026-12-14');
    Storage::disk(ShareLink::DISK)->assertExists($link->path);

    auth()->logout();
    $page = $this->get('/p/'.$link->token)->assertOk()
        ->assertInertia(fn ($p) => $p->component('share/show')->where('image', route('share.image', $link->token)));
    expect($page->getContent())->not->toContain('zebra-secret-words')
        ->and($page->getContent())->toContain('noindex')
        ->and($page->getContent())->toContain(route('share.image', $link->token));
    $this->get(route('share.image', $link->token))->assertOk()->assertHeader('Content-Type', 'image/png');
    expect($link->fresh()->views)->toBe(1);
});

test('partner postcard and letters need an OK; Allow lets the asker share for 7 days', function () {
    [$space, $a, $b] = shareCouple();
    $m = postcard($space, $b);
    $day = letterDay($space, $a, $b);

    $this->actingAs($a)->get(route('spaces.moments', $space))->assertInertia(fn ($p) => $p->where('moments.0.share', 'ask'));
    makeLink($a, $space, 'moment', $m->ulid)->assertForbidden();
    makeLink($a, $space, 'letter', $day->id)->assertForbidden();

    $this->actingAs($a)->post(route('spaces.share.ask', $space), ['type' => 'moment', 'id' => $m->ulid])->assertRedirect();
    $this->actingAs($a)->post(route('spaces.share.ask', $space), ['type' => 'moment', 'id' => $m->ulid]);   // no duplicate
    expect(ShareRequest::count())->toBe(1);
    $this->actingAs($a)->get(route('spaces.moments', $space))->assertInertia(fn ($p) => $p->where('moments.0.share', 'pending'));

    // B sees it with a preview; A can't answer their own ask / B เห็นคำขอ
    $req = ShareRequest::firstOrFail();
    $this->actingAs($b)->get(route('spaces.show', $space))->assertInertia(fn ($p) => $p
        ->where('shareRequests.0.kind', 'moment')->where('shareRequests.0.by', $a->name)->where('shareRequests.0.preview', 'beach day'));
    $this->actingAs($a)->put(route('spaces.share.decide', [$space, $req]), ['allow' => true])->assertNotFound();

    $this->actingAs($b)->put(route('spaces.share.decide', [$space, $req]), ['allow' => true])->assertRedirect();
    makeLink($a, $space, 'moment', $m->ulid)->assertCreated();

    test()->travel(8)->days();
    $this->actingAs($a)->get(route('spaces.moments', $space))->assertInertia(fn ($p) => $p->where('moments.0.share', 'ask'));
});

test('Not now hides the ask for a day', function () {
    [$space, $a, $b] = shareCouple();
    $day = letterDay($space, $a, $b);
    $this->actingAs($a)->post(route('spaces.share.ask', $space), ['type' => 'letter', 'id' => $day->id]);
    $this->actingAs($b)->put(route('spaces.share.decide', [$space, ShareRequest::first()]), ['allow' => false]);

    $this->actingAs($a)->get(route('spaces.daily', $space))->assertInertia(fn ($p) => $p->where('days.0.share', 'not_now'));
    makeLink($a, $space, 'letter', $day->id)->assertForbidden();
    test()->travel(25)->hours();
    $this->actingAs($a)->get(route('spaces.daily', $space))->assertInertia(fn ($p) => $p->where('days.0.share', 'ask'));
});

test('turning a link off, deleting the postcard or freezing the space stops it; picture deleted', function () {
    [$space, $a, $b] = shareCouple();
    $m = postcard($space, $a);
    makeLink($a, $space, 'moment', $m->ulid);
    makeLink($a, $space, 'moment', $m->ulid);
    [$one, $two] = ShareLink::orderBy('id')->get();

    // partner (not the owner of the content, not the maker) can't turn it off / คู่ปิดไม่ได้
    $this->actingAs($b)->delete(route('shared-links.destroy', $one))->assertNotFound();
    $this->actingAs($a)->delete(route('shared-links.destroy', $one))->assertRedirect();
    $this->get('/p/'.$one->token)->assertNotFound();
    Storage::disk(ShareLink::DISK)->assertMissing($one->path);

    $space->forceFill(['status' => Space::STATUS_FROZEN])->save();
    $this->get('/p/'.$two->token)->assertNotFound();
    $space->forceFill(['status' => Space::STATUS_ACTIVE])->save();
    $this->get('/p/'.$two->token)->assertOk();

    $this->actingAs($a)->delete(route('spaces.moments.destroy', [$space, $m]))->assertRedirect();
    $this->get('/p/'.$two->token)->assertNotFound();
    Storage::disk(ShareLink::DISK)->assertMissing($two->path);
});

test('the content owner sees and can turn off links their partner made', function () {
    [$space, $a, $b] = shareCouple();
    $m = postcard($space, $b);
    $this->actingAs($a)->post(route('spaces.share.ask', $space), ['type' => 'moment', 'id' => $m->ulid]);
    $this->actingAs($b)->put(route('spaces.share.decide', [$space, ShareRequest::first()]), ['allow' => true]);
    makeLink($a, $space, 'moment', $m->ulid);
    $link = ShareLink::firstOrFail();

    $this->actingAs($b)->get(route('shared-links.index'))->assertInertia(fn ($p) => $p
        ->where('links.0.mine', false)->where('links.0.by', $a->name)->where('links.0.live', true));
    $this->actingAs($b)->delete(route('shared-links.destroy', $link))->assertRedirect();
    expect($link->fresh()->isLive())->toBeFalse();
});

test('links expire; prune deletes pictures of expired links and orphan files', function () {
    [$space, $a] = shareCouple();
    $m = postcard($space, $a);
    makeLink($a, $space, 'moment', $m->ulid, '7');
    $link = ShareLink::firstOrFail();
    Storage::disk(ShareLink::DISK)->put('share-cards/orphan.png', 'x');

    test()->travel(8)->days();
    $this->get('/p/'.$link->token)->assertNotFound();
    $this->artisan('share:prune')->assertSuccessful();
    Storage::disk(ShareLink::DISK)->assertMissing($link->path);
    Storage::disk(ShareLink::DISK)->assertMissing('share-cards/orphan.png');
    expect($link->fresh()->revoked_at)->not->toBeNull();
});

test('stamps can be linked by either member; wrong size, other spaces and outsiders are refused', function () {
    [$space, $a, $b] = shareCouple();
    $stamp = $space->achievements()->create(['key' => 'first_letter', 'earned_at' => now(), 'seen_by' => []]);
    makeLink($b, $space, 'achievement', $stamp->id, 'never')->assertCreated();
    expect(ShareLink::first()->expires_at)->toBeNull();

    $this->actingAs($a)->post(route('spaces.share.links.store', $space), [
        'type' => 'achievement', 'id' => (string) $stamp->id, 'expires' => '7', 'image' => UploadedFile::fake()->image('x.png', 500, 500),
    ], ['Accept' => 'application/json'])->assertUnprocessable();

    [$other, $c] = shareCouple();
    $theirs = postcard($other, $c);
    makeLink($a, $space, 'moment', $theirs->ulid)->assertNotFound();
    makeLink($c, $space, 'achievement', $stamp->id)->assertNotFound();   // not a member
});

test('sharing off: no share state, no links, no requests', function () {
    [$space, $a] = shareCouple();
    $m = postcard($space, $a);
    Feature::updateOrCreate(['key' => 'sharing'], ['enabled' => false, 'tier' => 'free']);
    Features::flush();

    $this->actingAs($a)->get(route('spaces.moments', $space))->assertInertia(fn ($p) => $p->where('moments.0.share', null));
    makeLink($a, $space, 'moment', $m->ulid)->assertNotFound();
});

test('bad tokens are 404, export lists my links', function () {
    $this->get('/p/'.str_repeat('a', 32))->assertNotFound();
    $this->get('/p/short')->assertNotFound();

    [$space, $a] = shareCouple();
    makeLink($a, $space, 'moment', postcard($space, $a)->ulid);
    $data = app(App\Services\AccountData::class)->collect($a);
    expect($data['share_links'][0]['kind'])->toBe('moment');
});
