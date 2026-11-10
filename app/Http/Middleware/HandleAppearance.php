<?php

namespace App\Http\Middleware;

use App\Support\Themes;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use Symfony\Component\HttpFoundation\Response;

/**
 * Picks the theme folder for this request: the person's choice (or a cookie for guests),
 * only if it's available to them; otherwise the default.
 * เลือกธีม: ของผู้ใช้ → คุกกี้ → ค่าเริ่มต้น (ต้องเป็นธีมที่ใช้ได้)
 */
class HandleAppearance
{
    public function handle(Request $request, Closure $next): Response
    {
        $wanted = Themes::normalize($request->user()?->theme ?? $request->cookie('theme'));
        $theme = in_array($wanted, Themes::availableFor($request->user()), true) ? $wanted : Themes::DEFAULT;
        $t = Themes::get($theme);

        $request->attributes->set('theme', $theme);
        View::share([
            'theme' => $theme,
            'themeDark' => $t['dark'],
            'themeCss' => Themes::css($theme),
            'themeStatusBar' => $t['status_bar'] ?? '#f3e3e7',
            'themeGround' => $t['tokens']['ground'] ?? '#f3e3e7',
        ]);

        return $next($request);
    }
}
