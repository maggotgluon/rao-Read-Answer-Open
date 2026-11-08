<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Locale order: signed-in user's setting → session (guests) → browser → Thai.
 * ลำดับภาษา: ตั้งค่าผู้ใช้ → session → เบราว์เซอร์ → ไทย
 */
class SetLocale
{
    public const SUPPORTED = ['th', 'en'];

    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->user()?->locale
            ?? $request->session()->get('locale')
            ?? $request->getPreferredLanguage(self::SUPPORTED)
            ?? 'th';

        app()->setLocale(in_array($locale, self::SUPPORTED, true) ? $locale : 'th');

        return $next($request);
    }
}
