<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

/**
 * Remembers WHEN people use the app (last seen + one row per active day) for the admin
 * dashboard. Never what they did. Writes at most every 5 minutes per person.
 * บันทึกแค่ว่าใช้งานเมื่อไร (ไม่บันทึกว่าทำอะไร) สำหรับหน้าสถิติแอดมิน
 */
class TrackActivity
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && (! $user->last_seen_at || $user->last_seen_at->lt(now()->subMinutes(5)))) {
            $user->forceFill(['last_seen_at' => now()])->saveQuietly();
            DB::table('activity_days')->insertOrIgnore([
                'user_id' => $user->id,
                'date' => now('Asia/Bangkok')->toDateString(),
            ]);
        }

        return $next($request);
    }
}
