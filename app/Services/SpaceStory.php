<?php

namespace App\Services;

use App\Models\Space;
use App\Models\SpaceDistanceDay;
use App\Models\SpaceModeChange;
use App\Models\User;
use App\Support\Features;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Together / apart timeline + daily distance. Distance is recorded only on days BOTH partners
 * shared a location that is less than a day old, as km rounded to 10 (no places, no coordinates).
 * ไทม์ไลน์ช่วงอยู่ใกล้–ไกล และระยะห่างรายวัน บันทึกเฉพาะวันที่แชร์ตำแหน่งทั้งคู่ เก็บแค่กิโลเมตร
 */
class SpaceStory
{
    /** A location older than this doesn't count for today's distance. */
    public const FRESH_HOURS = 24;

    public function __construct(private DailyPrompts $prompts) {}

    /**
     * Called after a person's location is saved: log today's distance in each of their spaces
     * where the partner also shares a fresh location.
     * หลังบันทึกตำแหน่ง: บันทึกระยะห่างของวันนี้ในทุกพื้นที่ที่คู่แชร์ด้วย
     */
    public function recordFor(User $user): void
    {
        if (! $this->fresh($user)) {
            return;
        }
        foreach ($user->spaces()->get() as $space) {
            if (! $space->isActive() || ! Features::on('location', $space)) {
                continue;
            }
            $partner = $space->partnerOf($user);
            if (! $partner || ! $this->fresh($partner)) {
                continue;
            }
            $km = (int) (round(Location::km($user->loc_lat, $user->loc_lng, $partner->loc_lat, $partner->loc_lng) / 10) * 10);
            SpaceDistanceDay::updateOrCreate(['space_id' => $space->id, 'date' => $space->today()->toDateString()], ['km' => $km]);
        }
    }

    /** @return array<string, int> date => km for the given range */
    public function distances(Space $space, Carbon $from, Carbon $to): array
    {
        return $space->distanceDays()->whereBetween('date', [$from->toDateString(), $to->toDateString()])
            ->get(['date', 'km'])->mapWithKeys(fn ($d) => [$d->date->toDateString() => $d->km])->all();
    }

    /**
     * Periods newest first: [{mode: together|apart, from, to (null = now), days}], plus totals.
     * ช่วงเวลาล่าสุดก่อน พร้อมยอดรวมวันอยู่ใกล้/ไกล
     *
     * @return array<string, mixed>
     */
    public function timeline(Space $space): array
    {
        $tz = $space->timezone;
        $today = $space->today();
        $paired = $this->prompts->pairedOn($space);

        // One mode per day (a later switch the same day wins), then merge repeats.
        // วันละหนึ่งโหมด (สลับหลายครั้งในวันเดียวใช้ครั้งล่าสุด) แล้วรวมช่วงที่ซ้ำกัน
        $byDay = $space->modeChanges()->orderBy('changed_at')->orderBy('id')->get()
            ->map(function (SpaceModeChange $c) use ($tz, $paired) {
                $from = $c->changed_at->copy()->setTimezone($tz)->startOfDay();
                if ($paired && $from->lt($paired)) {
                    $from = $paired->copy()->startOfDay();   // nothing before you were two
                }

                return ['mode' => $c->long_distance ? 'apart' : 'together', 'from' => $from];
            })
            ->groupBy(fn ($r) => $r['from']->toDateString())
            ->map(fn (Collection $rows) => $rows->last())
            ->values();

        /** @var Collection<int, array{mode: string, from: Carbon}> $starts */
        $starts = collect();
        foreach ($byDay as $r) {
            if ($starts->last()['mode'] ?? null) {
                if ($starts->last()['mode'] === $r['mode']) {
                    continue;
                }
            }
            $starts->push($r);
        }

        if (! $paired || $starts->isEmpty()) {
            return ['since' => null, 'periods' => [], 'together_days' => 0, 'apart_days' => 0, 'has_distance' => false];
        }

        $periods = [];
        $totals = ['together' => 0, 'apart' => 0];
        foreach ($starts->values() as $i => $s) {
            $next = $starts->get($i + 1);
            $end = $next ? $next['from']->copy()->subDay() : $today->copy();
            $days = (int) round(abs($s['from']->diffInDays($end))) + 1;
            $totals[$s['mode']] += $days;
            $periods[] = [
                'mode' => $s['mode'],
                'from' => $s['from']->toDateString(),
                'to' => $next ? $end->toDateString() : null,
                'days' => $days,
            ];
        }

        return [
            'since' => $starts->first()['from']->toDateString(),
            'periods' => array_reverse($periods),
            'together_days' => $totals['together'],
            'apart_days' => $totals['apart'],
            'has_distance' => $space->distanceDays()->exists(),
        ];
    }

    private function fresh(User $u): bool
    {
        return $u->share_location && $u->loc_lat !== null && $u->loc_lng !== null
            && $u->loc_at?->gt(now()->subHours(self::FRESH_HOURS));
    }
}
