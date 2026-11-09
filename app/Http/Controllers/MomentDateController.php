<?php

namespace App\Http\Controllers;

use App\Models\Moment;
use App\Models\Space;
use App\Models\SpaceEvent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/**
 * Mark a moment as one of "our dates": attach to an existing date, create a new one
 * from it, or detach. Either partner can do it (both manage dates).
 * ผูกช่วงเวลากับวันสำคัญ: เลือกวันที่มีอยู่ สร้างใหม่ หรือยกเลิก (ทำได้ทั้งคู่)
 */
class MomentDateController extends Controller
{
    public function update(Request $request, Space $space, Moment $moment): RedirectResponse
    {
        abort_if($moment->isDraft(), 404);

        $data = $request->validate([
            'mode' => ['required', Rule::in(['existing', 'new', 'none'])],
            // Existing dates must belong to THIS space (the wall).
            'event_id' => ['required_if:mode,existing', 'nullable', 'integer',
                Rule::exists('space_events', 'id')->where('space_id', $space->id)],
            'title' => ['required_if:mode,new', 'nullable', 'string', 'max:80'],
            'date' => ['required_if:mode,new', 'nullable', 'date_format:Y-m-d'],
            'kind' => ['nullable', Rule::in(SpaceEvent::KINDS)],
            'repeats_yearly' => ['boolean'],
        ]);

        $eventId = match ($data['mode']) {
            'existing' => (int) $data['event_id'],
            'new' => $space->events()->create([
                'title' => $data['title'],
                'date' => $data['date'],
                'kind' => $data['kind'] ?? 'special',
                'repeats_yearly' => $request->boolean('repeats_yearly', true),
                'created_by' => $request->user()->id,
            ])->id,
            'none' => null,
        };

        $moment->update(['space_event_id' => $eventId]);

        if ($eventId) {
            Inertia::flash('toast', ['type' => 'success', 'message' => __('moment.marked_date')]);
        }

        return back();
    }
}
