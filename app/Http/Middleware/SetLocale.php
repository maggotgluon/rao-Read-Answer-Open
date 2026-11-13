<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Locale order: ?lang= (the hreflang links search engines follow) → signed-in user's
 * setting → session (guests) → browser → Thai. A guest's ?lang= is remembered.
 * ลำดับภาษา: ?lang= → ตั้งค่าผู้ใช้ → session → เบราว์เซอร์ → ไทย
 */
class SetLocale
{
    public const SUPPORTED = ['th', 'en'];

    public function handle(Request $request, Closure $next): Response
    {
        $asked = $request->query('lang');
        if (is_string($asked) && in_array($asked, self::SUPPORTED, true)) {
            if (! $request->user()) {
                $request->session()->put('locale', $asked);
            }
            app()->setLocale($asked);

            return $next($request);
        }

        $locale = $request->user()?->locale
            ?? $request->session()->get('locale')
            ?? $request->getPreferredLanguage(self::SUPPORTED)
            ?? 'th';

        app()->setLocale(in_array($locale, self::SUPPORTED, true) ? $locale : 'th');

        return $next($request);
    }
}
