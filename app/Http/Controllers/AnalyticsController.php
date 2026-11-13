<?php

namespace App\Http\Controllers;

use App\Services\Analytics;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * "App opened" beacon from the browser (once per visit): where from + device class.
 * Silently ignored without consent. / แจ้งว่าเปิดแอป (เฉพาะคนที่ยินยอม)
 */
class AnalyticsController extends Controller
{
    public function open(Request $request): Response
    {
        $data = $request->validate([
            'source' => ['required', 'in:push,pwa,browser'],
            'standalone' => ['required', 'boolean'],
        ]);
        $ua = (string) $request->userAgent();

        Analytics::track($request->user(), 'app_open', [
            'source' => $data['source'],
            'installed' => $data['standalone'],
            'device' => preg_match('/iPhone|Android.+Mobile|Mobile/i', $ua) ? 'phone' : (preg_match('/iPad|Tablet|Android/i', $ua) ? 'tablet' : 'desktop'),
            'os' => match (true) {
                (bool) preg_match('/iPhone|iPad|iPod/i', $ua) => 'ios',
                str_contains($ua, 'Android') => 'android',
                str_contains($ua, 'Mac OS') => 'mac',
                str_contains($ua, 'Windows') => 'windows',
                default => 'other',
            },
        ]);

        return response()->noContent();
    }
}
