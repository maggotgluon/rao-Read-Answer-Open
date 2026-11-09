<?php

namespace App\Http\Controllers;

use App\Models\Space;
use App\Models\SpaceEvent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/** Both partners can add, edit and delete the space's events. / ทั้งคู่จัดการวันสำคัญได้ */
class SpaceEventController extends Controller
{
    public const MAX_EVENTS = 100;

    public function store(Request $request, Space $space): RedirectResponse
    {
        abort_if($space->events()->count() >= self::MAX_EVENTS, 422);

        $space->events()->create([...$this->validated($request), 'created_by' => $request->user()->id]);
        Inertia::flash('toast', ['type' => 'success', 'message' => __('event.added')]);

        return back();
    }

    public function update(Request $request, Space $space, SpaceEvent $event): RedirectResponse
    {
        $event->update($this->validated($request));

        return back();
    }

    public function destroy(Space $space, SpaceEvent $event): RedirectResponse
    {
        $event->delete();

        return back();
    }

    /** @return array<string, mixed> */
    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:80'],
            'date' => ['required', 'date_format:Y-m-d', 'after:1900-01-01', 'before:2200-01-01'],
            'kind' => ['required', Rule::in(SpaceEvent::KINDS)],
            'repeats_yearly' => ['boolean'],
        ]);
    }
}
