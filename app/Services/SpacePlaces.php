<?php

namespace App\Services;

use App\Models\CityVisit;
use App\Models\Place;
use App\Models\Space;
use App\Models\User;
use App\Support\Features;

/**
 * Our places for the space pages, plus the city history of members who chose to keep one.
 * สถานที่ของเรา และประวัติเมืองของสมาชิกที่เลือกเปิดไว้
 */
class SpacePlaces
{
    public const VISITS_SHOWN = 30;

    /** @return list<array<string, mixed>> */
    public function list(Space $space): array
    {
        return $space->places()->with('author:id,name')->withCount(['moments', 'events'])
            ->orderByRaw('date is null')->orderBy('date')->orderBy('id')->get()
            ->map(fn (Place $p) => [
                'id' => $p->id,
                'name' => $p->name,
                'kind' => $p->kind,
                'city' => $p->city,
                'note' => $p->note,
                'date' => $p->date?->toDateString(),
                'author' => $p->author?->name,
                'moments' => $p->moments_count,
                'events' => $p->events_count,
            ])->all();
    }

    /**
     * City stays of this space's members who keep a history (newest first). Needs the
     * location feature; the owner's own switch decides, so it's never shown without consent.
     * แสดงเฉพาะคนที่เปิดเก็บประวัติเมืองเอง
     *
     * @return list<array<string, mixed>>
     */
    public function visits(Space $space, User $viewer): array
    {
        if (! Features::on('location', $space)) {
            return [];
        }
        $members = $space->members()->where('keep_city_history', true)->get(['users.id', 'name']);
        if ($members->isEmpty()) {
            return [];
        }
        $names = $members->pluck('name', 'id');

        return CityVisit::whereIn('user_id', $names->keys())
            ->orderByDesc('from_date')->orderByDesc('id')->limit(self::VISITS_SHOWN)->get()
            ->map(fn (CityVisit $v) => [
                'id' => $v->id,
                'mine' => $v->user_id === $viewer->id,
                'who' => $names[$v->user_id],
                'city' => $v->city,
                'from' => $v->from_date->toDateString(),
                'to' => $v->to_date?->toDateString(),
            ])->all();
    }
}
