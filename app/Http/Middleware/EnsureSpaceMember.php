<?php

namespace App\Http\Middleware;

use App\Models\Space;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * The wall between spaces. Non-members get a 404 so they can't even tell the
 * space exists. Pass "active" to also block writes on frozen spaces.
 * กำแพงระหว่าง space: คนนอกได้ 404 (ไม่รู้ด้วยซ้ำว่ามี space นี้)
 * ใส่ "active" เพื่อห้ามแก้ไขเมื่อ space ถูกแช่แข็ง
 */
class EnsureSpaceMember
{
    public function handle(Request $request, Closure $next, ?string $mode = null): Response
    {
        $space = $request->route('space');
        $user = $request->user();

        abort_unless($space instanceof Space && $user && $space->hasMember($user), 404);

        if ($mode === 'active' && ! $space->isActive()) {
            abort(423, __('space.frozen_readonly'));
        }

        return $next($request);
    }
}
