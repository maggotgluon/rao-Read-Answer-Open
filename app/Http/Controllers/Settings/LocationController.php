<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Services\Analytics;
use App\Services\Location;
use App\Support\Features;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

/** Turn location sharing on/off, and receive the automatic update when the app opens. */
class LocationController extends Controller
{
    public function toggle(Request $request, Location $location): RedirectResponse
    {
        $on = $request->validate(['on' => ['required', 'boolean']])['on'];
        $user = $request->user();

        $user->forceFill(['share_location' => $on])->save();
        if (! $on) {
            $location->clear($user);   // turning off deletes it / ปิดแล้วลบตำแหน่งทันที
        }

        Analytics::track($user, $on ? 'location_on' : 'location_off');
        Inertia::flash('toast', ['type' => 'success', 'message' => __($on ? 'location.on_flash' : 'location.off_flash')]);

        return back();
    }

    public function update(Request $request, Location $location): JsonResponse
    {
        $data = $request->validate([
            'lat' => ['required', 'numeric', 'between:-90,90'],
            'lng' => ['required', 'numeric', 'between:-180,180'],
            'tz' => ['nullable', 'timezone:all'],
        ]);
        $user = $request->user();

        abort_unless($user->share_location, 409);
        // Only useful if location is on in at least one of their spaces.
        abort_unless($user->spaces()->get()->contains(fn ($s) => Features::on('location', $s)), 403);

        $saved = $location->update($user, (float) $data['lat'], (float) $data['lng'], $data['tz'] ?? null);

        return response()->json(['saved' => $saved]);
    }
}
