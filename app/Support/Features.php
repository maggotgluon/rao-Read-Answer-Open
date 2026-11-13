<?php

namespace App\Support;

use App\Models\Feature;
use App\Models\Space;
use App\Models\User;

/**
 * Feature switches: admin turns a feature on/off for everyone and tags it free or premium.
 * Premium features work only in spaces the admin marked premium (no payments yet).
 * สวิตช์ฟีเจอร์: แอดมินเปิด/ปิด และกำหนดว่าฟรีหรือพรีเมียม (พรีเมียมใช้ได้เฉพาะ space ที่แอดมินให้)
 *
 * Space features are checked against a space; person features (themes, poly) against a
 * person — they count as premium if any of their active spaces is premium.
 */
class Features
{
    /** key => applies to 'space' or 'user' / ใช้กับ space หรือกับคน */
    public const ALL = [
        'photos' => 'space',          // photos in moments / รูปในช่วงเวลา
        'quests' => 'space',          // weekend quests / ภารกิจวันหยุด
        'custom_prompts' => 'space',  // couple-written questions / คำถามที่คู่เขียนเอง
        'location' => 'space',        // distance + long-distance mode / ระยะทาง + โหมดไกลกัน
        'memories' => 'space',        // "On this day" / วันนี้ในความทรงจำ
        'places' => 'space',          // our places / สถานที่ของเรา
        'themes' => 'user',           // choose a theme / เลือกธีม
        'poly' => 'user',             // more than one active space / มีได้หลาย space
    ];

    public const FREE = 'free';

    public const PREMIUM = 'premium';

    /** @var array{at: int, data: array<string, array{enabled: bool, tier: string}>}|null */
    private static ?array $cache = null;

    /**
     * Read once per 30 s (the queue worker is long-lived, so never cache forever).
     * Saving a Feature clears it right away.
     *
     * @return array<string, array{enabled: bool, tier: string}>
     */
    public static function settings(): array
    {
        if (self::$cache && self::$cache['at'] > time() - 30) {
            return self::$cache['data'];
        }

        $rows = Feature::all()->keyBy('key');
        $data = collect(self::ALL)->map(fn ($scope, $key) => [
            'enabled' => (bool) ($rows[$key]->enabled ?? true),
            'tier' => $rows[$key]->tier ?? self::FREE,
        ])->all();
        self::$cache = ['at' => time(), 'data' => $data];

        return $data;
    }

    public static function flush(): void
    {
        self::$cache = null;
    }

    public static function on(string $key, Space|User|null $for = null): bool
    {
        $s = self::settings()[$key] ?? null;
        if (! $s || ! $s['enabled']) {
            return false;
        }
        if ($s['tier'] === self::FREE) {
            return true;
        }

        return match (true) {
            $for instanceof Space => (bool) $for->premium,
            $for instanceof User => $for->spaces()->where('premium', true)->where('status', Space::STATUS_ACTIVE)->exists(),
            default => false,
        };
    }

    /**
     * What's on for this space (space features) — sent to the space pages.
     *
     * @return array<string, bool>
     */
    public static function forSpace(Space $space): array
    {
        return collect(self::ALL)->filter(fn ($scope) => $scope === 'space')
            ->map(fn ($scope, $key) => self::on($key, $space))->all();
    }

    /** @return array<string, bool> */
    public static function forUser(?User $user): array
    {
        return collect(self::ALL)->filter(fn ($scope) => $scope === 'user')
            ->map(fn ($scope, $key) => $user ? self::on($key, $user) : self::on($key))->all();
    }
}
