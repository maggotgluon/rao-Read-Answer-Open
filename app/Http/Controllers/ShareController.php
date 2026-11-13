<?php

namespace App\Http\Controllers;

use App\Models\ShareLink;
use App\Models\ShareRequest;
use App\Models\Space;
use App\Services\Analytics;
use App\Services\Push;
use App\Services\Shareables;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Asking the partner's OK, public card links, and the public card page.
 * ขออนุญาตคู่ สร้างลิงก์การ์ด และหน้าการ์ดสาธารณะ
 */
class ShareController extends Controller
{
    public function __construct(private Shareables $shareables) {}

    /** "May I share this?" → the partner gets a push. / ขออนุญาตแชร์ */
    public function ask(Request $request, Space $space, Push $push): RedirectResponse
    {
        abort_unless($this->shareables->enabled($space), 404);
        $data = $request->validate([
            'type' => ['required', Rule::in(['moment', 'letter'])],
            'id' => ['required', 'regex:/^[A-Za-z0-9]{1,40}$/'],
        ]);
        $user = $request->user();
        $item = $this->shareables->find($space, $data['type'], (string) $data['id']) ?? abort(404);
        $owner = $this->shareables->ownerFor($item, $user) ?? abort(422);

        if ($this->shareables->state($space, $item, $user) === 'ask') {
            ShareRequest::create([
                'space_id' => $space->id, 'requester_id' => $user->id, 'owner_id' => $owner,
                'item_type' => $data['type'], 'item_id' => $item->getKey(), 'status' => ShareRequest::PENDING,
            ]);
            $partner = $space->members()->whereKey($owner)->first();
            if ($partner) {
                $push->notify($partner, 'share_asks', 'share_ask', ['name' => $user->name], route('spaces.show', $space), $space);
            }
            Analytics::track($user, 'share_asked', ['type' => $data['type']], $space);
            Inertia::flash('toast', ['type' => 'success', 'message' => __('share.asked')]);
        }

        return back();
    }

    /** Allow / Not now, by the person whose content it is. / อนุญาต หรือ ยังไม่ตอนนี้ */
    public function decide(Request $request, Space $space, ShareRequest $shareRequest, Push $push): RedirectResponse
    {
        $user = $request->user();
        abort_unless($shareRequest->space_id === $space->id && $shareRequest->owner_id === $user->id, 404);
        $allow = $request->validate(['allow' => ['required', 'boolean']])['allow'];

        if ($shareRequest->status === ShareRequest::PENDING) {
            $shareRequest->update([
                'status' => $allow ? ShareRequest::ALLOWED : ShareRequest::DECLINED,
                'decided_at' => now(),
            ]);
            if ($allow && $shareRequest->requester) {
                $push->notify($shareRequest->requester, 'share_asks', 'share_allowed', ['name' => $user->name],
                    route($shareRequest->item_type === 'letter' ? 'spaces.daily' : 'spaces.moments', $space), $space);
            }
        }

        return back();
    }

    /**
     * Make a public link for a card picture drawn on the phone. Only the picture is public.
     * สร้างลิงก์สาธารณะจากรูปการ์ด เปิดเผยแค่รูปเท่านั้น
     */
    public function store(Request $request, Space $space): JsonResponse
    {
        abort_unless($this->shareables->enabled($space), 404);
        $data = $request->validate([
            'type' => ['required', Rule::in(Shareables::TYPES)],
            'id' => ['required', 'regex:/^[A-Za-z0-9]{1,40}$/'],
            'expires' => ['required', Rule::in(['7', '30', 'never'])],
            'image' => ['required', 'file', 'mimetypes:image/png', 'max:6144',
                'dimensions:width=1080,min_height=1350,max_height=1920'],
        ]);
        $user = $request->user();
        $item = $this->shareables->find($space, $data['type'], (string) $data['id']) ?? abort(404);
        abort_unless($this->shareables->canShare($space, $item, $user), 403);
        abort_if(ShareLink::where('user_id', $user->id)->live()->count() >= ShareLink::MAX_ACTIVE_PER_USER, 422, __('share.too_many'));

        [$w, $h] = getimagesize($data['image']->getRealPath()) ?: [0, 0];
        abort_unless(in_array($h, [1350, 1920], true), 422);

        $token = Str::lower(Str::random(32));
        $path = "share-cards/{$token}.png";
        Storage::disk(ShareLink::DISK)->putFileAs('share-cards', $data['image'], "{$token}.png");

        $link = ShareLink::create([
            'token' => $token, 'user_id' => $user->id, 'space_id' => $space->id,
            'item_type' => $data['type'], 'item_id' => $item->getKey(), 'path' => $path,
            'width' => $w, 'height' => $h,
            'expires_at' => $data['expires'] === 'never' ? null : now()->addDays((int) $data['expires']),
        ]);
        Analytics::track($user, 'share_link_made', ['type' => $data['type'], 'expires' => $data['expires']], $space);

        return response()->json(['url' => $link->url(), 'expires_at' => $link->expires_at?->toIso8601String()], 201);
    }

    /** The public page: the card picture only. / หน้าสาธารณะ: รูปการ์ดเท่านั้น */
    public function show(string $token): Response
    {
        $link = $this->liveLink($token);
        $link->increment('views');

        // noindex comes from the page meta (Seo) / ไม่ให้ค้นหาเจอ ตั้งใน meta
        return Inertia::render('share/show', [
            'image' => route('share.image', $link->token),
            'width' => $link->width,
            'height' => $link->height,
            'kind' => $link->item_type,
        ]);
    }

    public function image(string $token): StreamedResponse
    {
        $link = $this->liveLink($token);

        return Storage::disk(ShareLink::DISK)->response($link->path, 'rao-card.png', [
            'Content-Type' => 'image/png',
            'Cache-Control' => 'public, max-age=300',
            'X-Robots-Tag' => 'noindex',
        ]);
    }

    /** Live, space not frozen, item still there, picture on disk; anything else is 404. */
    private function liveLink(string $token): ShareLink
    {
        $link = ShareLink::where('token', Str::lower($token))->with('space')->first();
        abort_unless($link && $link->isLive() && $link->space && ! $link->space->isFrozen(), 404);
        abort_unless($this->shareables->find($link->space, $link->item_type, $link->item_id), 404);
        abort_unless(Storage::disk(ShareLink::DISK)->exists($link->path), 404);

        return $link;
    }
}
