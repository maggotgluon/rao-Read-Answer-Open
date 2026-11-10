<?php

namespace App\Services;

use App\Models\Space;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * First-party usage analytics. Records ACTIONS only (never letters, moments, photos,
 * moods or locations) and only for people who opted in. Nothing leaves our server.
 * analytics ของเราเอง: บันทึกเฉพาะการกระทำ ไม่มีเนื้อหา และเฉพาะคนที่ยินยอม
 */
class Analytics
{
    /** Raw events are kept this long. / เก็บข้อมูลดิบนานเท่านี้ */
    public const KEEP_MONTHS = 13;

    /** @param  array<string, scalar|null>  $props */
    public static function track(?User $user, string $name, array $props = [], ?Space $space = null): void
    {
        if (! $user || ! $user->analyticsOn()) {
            return;
        }

        DB::table('analytics_events')->insert([
            'user_id' => $user->id,
            'space_id' => $space?->id,
            'name' => $name,
            'props' => $props ? json_encode($props) : null,
            'created_at' => now(),
        ]);
    }

    /** Withdrawing consent also deletes what was collected. / ถอนความยินยอม = ลบข้อมูลที่เก็บไว้ */
    public static function forget(User $user): void
    {
        DB::table('analytics_events')->where('user_id', $user->id)->delete();
        DB::table('activity_days')->where('user_id', $user->id)->delete();
    }

    /** Rough length bucket, so we never store how long a letter really is. */
    public static function lengthBucket(string $text): string
    {
        $n = mb_strlen(trim($text));

        return match (true) {
            $n < 40 => 'short',
            $n < 200 => 'medium',
            default => 'long',
        };
    }
}
