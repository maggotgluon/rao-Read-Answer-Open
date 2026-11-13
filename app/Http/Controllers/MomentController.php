<?php

namespace App\Http\Controllers;

use App\Models\Moment;
use App\Models\ShareLink;
use App\Models\Space;
use App\Services\Achievements;
use App\Services\Analytics;
use App\Services\MomentPhotos;
use App\Services\Push;
use App\Support\Features;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Throwable;

class MomentController extends Controller
{
    public function store(Request $request, Space $space, MomentPhotos $photos, Push $push): RedirectResponse
    {
        $data = $request->validate([
            'body' => ['nullable', 'string', 'max:2000'],
            'photos' => ['nullable', 'array', 'max:'.Moment::MAX_PHOTOS],
            'photos.*' => ['image', 'mimes:jpeg,png,webp', 'max:8192'],
            'publish' => ['boolean'],
        ]);

        $files = $request->file('photos', []);
        if (count($files) > 0 && ! Features::on('photos', $space)) {
            throw ValidationException::withMessages(['photos' => __('feature.off')]);
        }
        if (blank($data['body'] ?? null) && count($files) === 0) {
            throw ValidationException::withMessages(['body' => __('moment.empty')]);
        }

        $publish = $request->boolean('publish');
        $stored = [];

        try {
            DB::transaction(function () use ($space, $request, $data, $files, $publish, $photos, &$stored) {
                $moment = $space->moments()->create([
                    'user_id' => $request->user()->id,
                    'body' => $data['body'] ?? null,
                    'status' => $publish ? Moment::STATUS_POSTED : Moment::STATUS_DRAFT,
                    'posted_at' => $publish ? now() : null,
                ]);

                foreach (array_values($files) as $i => $file) {
                    $meta = $photos->store($file, $space);
                    $stored[] = $meta['path'];
                    $moment->media()->create([...$meta, 'position' => $i]);
                }
            });
        } catch (Throwable $e) {
            // Don't leave orphan files behind if anything failed.
            array_walk($stored, fn ($p) => $photos->delete($p));
            if ($e instanceof \RuntimeException) {
                throw ValidationException::withMessages(['photos' => __('moment.bad_photo')]);
            }
            throw $e;
        }

        Analytics::track($request->user(), $publish ? 'moment_posted' : 'moment_draft', ['photos' => count($stored)], $space);
        if ($publish) {
            $this->tellPartner($request, $space, $push);
            app(Achievements::class)->check($space);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __($publish ? 'moment.posted' : 'moment.saved_draft')]);

        return back();
    }

    public function publish(Request $request, Space $space, Moment $moment, Push $push): RedirectResponse
    {
        $this->ownDraftOr404($request, $moment);

        $moment->update(['status' => Moment::STATUS_POSTED, 'posted_at' => now()]);
        Analytics::track($request->user(), 'moment_posted', ['from_draft' => true], $space);
        $this->tellPartner($request, $space, $push);
        app(Achievements::class)->check($space);
        Inertia::flash('toast', ['type' => 'success', 'message' => __('moment.posted')]);

        return back();
    }

    public function destroy(Request $request, Space $space, Moment $moment, MomentPhotos $photos): RedirectResponse
    {
        abort_unless($moment->isVisibleTo($request->user()), 404);
        abort_unless($moment->user_id === $request->user()->id, 403);

        $paths = $moment->media()->pluck('path');
        ShareLink::revokeFor('moment', $moment->id);   // public links stop at once / ลิงก์หยุดทันที
        $moment->delete();
        $paths->each(fn ($p) => $photos->delete($p));

        return back();
    }

    private function tellPartner(Request $request, Space $space, Push $push): void
    {
        if ($partner = $space->partnerOf($request->user())) {
            $push->notify($partner, 'partner_moment', 'moment', ['name' => $request->user()->name], route('spaces.moments', $space), $space);
        }
    }

    private function ownDraftOr404(Request $request, Moment $moment): void
    {
        abort_unless($moment->isDraft() && $moment->user_id === $request->user()->id, 404);
    }
}
