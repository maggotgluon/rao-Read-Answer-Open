<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Answer;
use App\Models\Moment;
use App\Models\ShareLink;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

/**
 * "My shared links": links I made, and links my partner made of MY postcards or our letters
 * (so I can turn those off too). / ลิงก์ที่ฉันสร้าง และลิงก์ที่คู่สร้างจากเนื้อหาของฉัน
 */
class SharedLinksController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('settings/shared-links', [
            'links' => $this->visible($user)->map(fn (ShareLink $l) => [
                'id' => $l->id,
                'url' => $l->url(),
                'image' => $l->isLive() && Storage::disk(ShareLink::DISK)->exists($l->path) ? route('share.image', $l->token) : null,
                'kind' => $l->item_type,
                'mine' => $l->user_id === $user->id,
                'by' => $l->user?->name,
                'space' => $l->space?->name ?: $l->space?->partnerOf($user)?->name,
                'created_at' => $l->created_at?->toIso8601String(),
                'expires_at' => $l->expires_at?->toIso8601String(),
                'live' => $l->isLive(),
                'views' => $l->views,
            ])->values()->all(),
        ]);
    }

    public function destroy(Request $request, ShareLink $link): RedirectResponse
    {
        abort_unless($this->mayTurnOff($request->user(), $link), 404);
        $link->revoke();
        Inertia::flash('toast', ['type' => 'success', 'message' => __('share.link_off')]);

        return back();
    }

    /** @return \Illuminate\Support\Collection<int, ShareLink> */
    private function visible(User $user)
    {
        $spaceIds = $user->spaces()->pluck('spaces.id');

        return ShareLink::with(['user:id,name', 'space'])
            ->where(fn ($q) => $q->where('user_id', $user->id)->orWhereIn('space_id', $spaceIds))
            ->latest('id')->limit(200)->get()
            ->filter(fn (ShareLink $l) => $this->mayTurnOff($user, $l))->values();
    }

    public function mayTurnOff(User $user, ShareLink $link): bool
    {
        if ($link->user_id === $user->id) {
            return true;
        }

        return match ($link->item_type) {
            'moment' => Moment::whereKey($link->item_id)->where('user_id', $user->id)->exists(),
            'letter' => Answer::where('daily_prompt_id', $link->item_id)->where('user_id', $user->id)->exists(),
            // Stamps belong to both: either member may turn them off. / แสตมป์เป็นของทั้งคู่
            default => $link->space?->hasMember($user) ?? false,
        };
    }
}
