<?php

namespace App\Services;

use App\Jobs\SendPush;
use App\Models\Space;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Sends web push notifications. Text never contains answers, moment text or comments —
 * only THAT something happened (lock screens are visible to others).
 * ข้อความแจ้งเตือนไม่มีเนื้อหาคำตอบ/โพสต์ — บอกแค่ว่ามีอะไรเกิดขึ้น (หน้าจอล็อกคนอื่นเห็นได้)
 */
class Push
{
    public static function configured(): bool
    {
        return filled(config('services.webpush.public_key')) && filled(config('services.webpush.private_key'));
    }

    /**
     * @param  array<string, string|int>  $replace
     */
    public function notify(User $to, string $type, string $key, array $replace = [], ?string $url = null, ?Space $space = null): bool
    {
        if (! $to->wants($type) || ! $to->pushSubscriptions()->exists()) {
            return false;
        }

        $locale = $to->locale ?: 'th';
        if ($space) {
            // Poly: always say which space. / บอกเสมอว่ามาจาก space ไหน
            $replace['space'] = $space->name ?: ($space->partnerOf($to)?->name ?? '');
        }

        $payload = [
            'title' => __("push.{$key}.title", $replace, $locale),
            'body' => __("push.{$key}.body", $replace, $locale),
            'url' => $url ?? route('dashboard'),
            'tag' => $space ? "{$type}-{$space->ulid}" : $type,
        ];

        SendPush::dispatch($to->id, $payload);

        return true;
    }

    /**
     * Run $send only once per (user, space, kind, ref) — for scheduled pushes.
     * ส่งครั้งเดียวต่อ (ผู้ใช้, space, ประเภท, อ้างอิง)
     */
    public function once(User $to, ?Space $space, string $kind, string $ref, callable $send): bool
    {
        $inserted = DB::table('push_logs')->insertOrIgnore([
            'user_id' => $to->id,
            'space_id' => $space?->id,
            'kind' => $kind,
            'ref' => Str::limit($ref, 40, ''),
            'created_at' => now(),
        ]);

        if ($inserted) {
            $send();
        }

        return (bool) $inserted;
    }
}
