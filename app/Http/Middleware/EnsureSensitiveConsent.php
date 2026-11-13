<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Spaces need explicit consent for sensitive topics (PDPA s.26). Without it: the consent page.
 * ต้องให้ความยินยอมเรื่องอ่อนไหวก่อนเข้า space
 */
class EnsureSensitiveConsent
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ! $user->sensitive_consent_at) {
            if ($request->isMethod('GET')) {
                $request->session()->put('url.intended', $request->fullUrl());
            }

            return redirect()->route('consent.show');
        }

        return $next($request);
    }
}
