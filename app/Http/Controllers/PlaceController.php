<?php

namespace App\Http\Controllers;

use App\Models\Moment;
use App\Models\Place;
use App\Models\Space;
use App\Services\Achievements;
use App\Services\Analytics;
use App\Services\Location;
use App\Support\Features;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/**
 * Our places: both partners add, edit and delete; link them to postcards and dates.
 * สถานที่ของเรา: ทั้งคู่เพิ่ม แก้ ลบได้ และผูกกับโปสการ์ดหรือวันสำคัญ
 */
class PlaceController extends Controller
{
    public function store(Request $request, Space $space): RedirectResponse
    {
        abort_unless(Features::on('places', $space), 404);
        abort_if($space->places()->count() >= Place::MAX_PER_SPACE, 422);

        $space->places()->create([...$this->validated($request), 'created_by' => $request->user()->id]);
        Analytics::track($request->user(), 'place_added', [], $space);   // which place stays private
        app(Achievements::class)->check($space);
        Inertia::flash('toast', ['type' => 'success', 'message' => __('places.added')]);

        return back();
    }

    public function update(Request $request, Space $space, Place $place): RedirectResponse
    {
        abort_unless(Features::on('places', $space), 404);
        $place->update($this->validated($request));

        return back();
    }

    public function destroy(Space $space, Place $place): RedirectResponse
    {
        $place->delete();   // linked postcards and dates stay, just unlinked / โปสการ์ดยังอยู่

        return back();
    }

    /**
     * Link a posted postcard to a place: an existing one, a new one, or none.
     * ผูกโปสการ์ดกับสถานที่: ที่มีอยู่ สร้างใหม่ หรือยกเลิก
     */
    public function moment(Request $request, Space $space, Moment $moment): RedirectResponse
    {
        abort_unless(Features::on('places', $space), 404);
        abort_if($moment->isDraft(), 404);

        $data = $request->validate([
            'mode' => ['required', Rule::in(['existing', 'new', 'none'])],
            'place_id' => ['required_if:mode,existing', 'nullable', 'integer',
                Rule::exists('places', 'id')->where('space_id', $space->id)],
            'name' => ['required_if:mode,new', 'nullable', 'string', 'max:80'],
            'kind' => ['nullable', Rule::in(Place::KINDS)],
        ]);

        $placeId = match ($data['mode']) {
            'existing' => (int) $data['place_id'],
            'new' => $space->places()->create([
                'name' => $data['name'], 'kind' => $data['kind'] ?? 'other',
                'created_by' => $request->user()->id,
            ])->id,
            'none' => null,
        };
        $moment->update(['place_id' => $placeId]);

        return back();
    }

    /**
     * "Where I am now": the city name for a one-time location. Nothing is stored.
     * ชื่อเมืองของตำแหน่งตอนนี้ (ครั้งเดียว ไม่บันทึก)
     */
    public function here(Request $request, Space $space, Location $location): JsonResponse
    {
        abort_unless(Features::on('places', $space), 404);
        $data = $request->validate([
            'lat' => ['required', 'numeric', 'between:-90,90'],
            'lng' => ['required', 'numeric', 'between:-180,180'],
        ]);

        return response()->json([
            'city' => $location->cityAt((float) $data['lat'], (float) $data['lng'], app()->getLocale()),
        ]);
    }

    /** @return array<string, mixed> */
    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'kind' => ['required', Rule::in(Place::KINDS)],
            'city' => ['nullable', 'string', 'max:100'],
            'note' => ['nullable', 'string', 'max:300'],
            'date' => ['nullable', 'date_format:Y-m-d', 'after:1900-01-01', 'before:2200-01-01'],
        ]);
    }
}
