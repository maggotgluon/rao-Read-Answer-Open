<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use Symfony\Component\HttpFoundation\Response;

class HandleAppearance
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Theme: signed-in user's choice → cookie (guests) → blush (default).
        // candle is the dark theme. / ธีม: ของผู้ใช้ → คุกกี้ → blush (ค่าเริ่มต้น)
        $theme = $request->user()?->theme ?? $request->cookie('theme');
        $theme = in_array($theme, User::THEMES, true) ? $theme : 'blush';

        $request->attributes->set('theme', $theme);
        View::share('theme', $theme);

        return $next($request);
    }
}
