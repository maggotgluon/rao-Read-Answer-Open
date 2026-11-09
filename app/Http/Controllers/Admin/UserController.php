<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Space;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * User list for admins: name, email, joined, last active, spaces. No content, no locations.
 * Spaces are shown only by their members' names, so the admin can give premium.
 * รายชื่อผู้ใช้ (ไม่มีเนื้อหาหรือตำแหน่ง)
 */
class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate(['q' => ['nullable', 'string', 'max:100']]);

        $query = User::query()->withCount('spaces')
            ->with(['spaces' => fn ($q) => $q->with('members:id,name')]);
        if ($q = $filters['q'] ?? null) {
            $query->where(fn ($w) => $w->where('name', 'like', "%{$q}%")->orWhere('email', 'like', "%{$q}%"));
        }

        return Inertia::render('admin/users', [
            'filters' => $filters,
            'users' => $query->latest()->paginate(30)->withQueryString()->through(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'verified' => (bool) $u->email_verified_at,
                'is_admin' => (bool) $u->is_admin,
                'locale' => $u->locale,
                'joined_at' => $u->created_at?->toIso8601String(),
                'last_seen_at' => $u->last_seen_at?->toIso8601String(),
                'spaces_count' => $u->spaces_count,
                'spaces' => $u->spaces->map(fn (Space $s) => [
                    'id' => $s->ulid,
                    'members' => $s->members->pluck('name')->all(),
                    'status' => $s->status,
                    'premium' => (bool) $s->premium,
                    'long_distance' => (bool) $s->long_distance,
                ])->all(),
            ]),
        ]);
    }

    /** Give or take premium for one space (no payments yet). / ให้หรือยกเลิกพรีเมียม */
    public function premium(Request $request, Space $space): RedirectResponse
    {
        $on = $request->validate(['on' => ['required', 'boolean']])['on'];
        $space->forceFill(['premium' => $on])->save();
        Inertia::flash('toast', ['type' => 'success', 'message' => __($on ? 'admin.premium_on' : 'admin.premium_off')]);

        return back();
    }
}
