<?php

namespace App\Services;

use App\Models\CityVisit;
use App\Models\Space;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Where partners are, roughly. The exact spot is never stored: coordinates are rounded
 * to a ~5 km grid first. Partners see distance + city + their local time only.
 * ตำแหน่งแบบคร่าว ๆ ปัดเป็นตาราง ~5 กม. ก่อนบันทึก คู่เห็นแค่ระยะทาง เมือง และเวลาท้องถิ่น
 */
class Location
{
    /** Grid size in degrees (0.05° ≈ 5.5 km). / ขนาดตาราง */
    public const GRID = 0.05;

    /** Ignore repeat updates from the same place within this many minutes. */
    public const MIN_MINUTES = 30;

    /** Suggest long-distance mode from this distance. / แนะนำโหมดไกลกันเมื่อห่างเกินนี้ */
    public const SUGGEST_KM = 100;

    public static function round(float $v): float
    {
        return round(round($v / self::GRID) * self::GRID, 4);
    }

    /** @return bool true when saved (false = skipped as too soon / same place) */
    public function update(User $user, float $lat, float $lng, ?string $tz): bool
    {
        $lat = self::round($lat);
        $lng = self::round($lng);
        $same = $user->loc_lat === $lat && $user->loc_lng === $lng;

        if ($same && $user->loc_at?->gt(now()->subMinutes(self::MIN_MINUTES)) && $user->loc_tz === $tz) {
            return false;
        }

        $user->forceFill([
            'loc_lat' => $lat,
            'loc_lng' => $lng,
            'loc_tz' => $tz,
            'loc_city' => $same && $user->loc_city ? $user->loc_city : $this->city($lat, $lng, $user->locale ?? 'th'),
            'loc_at' => now(),
        ])->save();

        app(SpaceStory::class)->recordFor($user);   // today's distance, if both share / ระยะห่างวันนี้
        $this->logCity($user);

        return true;
    }

    /**
     * City history (only if the person turned it on): a new stay starts when the city
     * changes. City names and dates only. / ประวัติเมือง เก็บแค่ชื่อเมืองและวันที่
     */
    public function logCity(User $user): void
    {
        if (! $user->keep_city_history || ! $user->loc_city) {
            return;
        }
        $today = now($user->loc_tz ?: 'Asia/Bangkok')->toDateString();
        $open = CityVisit::where('user_id', $user->id)->whereNull('to_date')->latest('from_date')->latest('id')->first();
        if ($open?->city === $user->loc_city) {
            return;
        }
        $open?->update(['to_date' => max($open->from_date->toDateString(), $today)]);
        CityVisit::create(['user_id' => $user->id, 'city' => $user->loc_city, 'from_date' => $today]);
    }

    /** City name for a spot (rounded first, nothing stored). / ชื่อเมืองจากพิกัด ไม่บันทึก */
    public function cityAt(float $lat, float $lng, string $locale): ?string
    {
        return $this->city(self::round($lat), self::round($lng), $locale);
    }

    public function clear(User $user): void
    {
        $user->forceFill(['loc_lat' => null, 'loc_lng' => null, 'loc_city' => null, 'loc_tz' => null, 'loc_at' => null])->save();
    }

    /** Great-circle distance in km. / ระยะทางเป็นกิโลเมตร */
    public static function km(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $r = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        return $r * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }

    /**
     * What the viewer sees on a space page. Nothing about the partner unless BOTH share
     * (fair: you only see theirs if they can see yours).
     * จะเห็นของอีกฝ่ายก็ต่อเมื่อเปิดแชร์ทั้งคู่
     *
     * @return array<string, mixed>
     */
    public function forSpace(Space $space, User $viewer): array
    {
        $partner = $space->partnerOf($viewer);
        $both = $viewer->share_location && $partner?->share_location
            && $viewer->loc_lat !== null && $partner->loc_lat !== null;

        $km = $both ? self::km($viewer->loc_lat, $viewer->loc_lng, $partner->loc_lat, $partner->loc_lng) : null;

        return [
            'me_sharing' => (bool) $viewer->share_location,
            'partner_sharing' => (bool) $partner?->share_location,
            'km' => $km === null ? null : (int) round($km),
            'partner_city' => $both ? $partner->loc_city : null,
            'partner_tz' => $both ? $partner->loc_tz : null,
            'partner_updated_at' => $both ? $partner->loc_at?->toIso8601String() : null,
            'suggest_long_distance' => $km !== null && $km >= self::SUGGEST_KM && ! $space->long_distance,
            'me_keeps_history' => (bool) $viewer->keep_city_history,
        ];
    }

    /** City name from OpenStreetMap (only rounded coordinates are sent). Cached per grid cell. */
    private function city(float $lat, float $lng, string $locale): ?string
    {
        $key = "geo:{$lat},{$lng}:{$locale}";

        return Cache::remember($key, now()->addDays(30), function () use ($lat, $lng, $locale) {
            try {
                $res = Http::timeout(5)
                    ->withHeaders(['User-Agent' => 'Rao/1.0 ('.config('app.url').')'])
                    ->get('https://nominatim.openstreetmap.org/reverse', [
                        'lat' => $lat, 'lon' => $lng, 'format' => 'jsonv2', 'zoom' => 10,
                        'accept-language' => $locale === 'en' ? 'en' : 'th,en',
                    ]);
                $a = $res->json('address') ?? [];

                return $a['city'] ?? $a['town'] ?? $a['county'] ?? $a['state_district'] ?? $a['state'] ?? $a['country'] ?? null;
            } catch (Throwable) {
                return null;   // distance still works without a name
            }
        });
    }

    public static function localTime(?string $tz): ?string
    {
        return $tz ? Carbon::now($tz)->format('H:i') : null;
    }
}
