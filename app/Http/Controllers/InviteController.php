<?php

namespace App\Http\Controllers;

use App\Models\Space;
use App\Models\SpaceInvite;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InviteController extends Controller
{
    /** Typed-in code → the invite page. / พิมพ์โค้ดเอง */
    public function lookup(Request $request): RedirectResponse
    {
        $data = $request->validate(['code' => ['required', 'string', 'max:20']]);

        return redirect()->route('invites.show', SpaceInvite::normalizeCode($data['code']));
    }

    /** Public landing page for an invite link. Guests are asked to sign up first. */
    public function show(Request $request, string $code): Response
    {
        $code = SpaceInvite::normalizeCode($code);
        $invite = SpaceInvite::with(['creator:id,name', 'space'])->where('code', $code)->first();
        $user = $request->user();

        if (! $user) {
            // Remember it so we come back here after register / login.
            $request->session()->put('pending_invite', $code);
        }

        $problem = $this->problem($invite, $user);

        return Inertia::render('invites/show', [
            'code' => $code,
            // Don't reveal who sent a dead/used invite. / ไม่เปิดเผยชื่อผู้เชิญถ้าโค้ดใช้ไม่ได้
            'inviter' => in_array($problem, [null, 'already_member'], true) ? $invite?->creator?->name : null,
            'problem' => $problem,
            'space_url' => $invite && $user && $invite->space->hasMember($user)
                ? route('spaces.show', $invite->space) : null,
        ]);
    }

    public function accept(Request $request, string $code): RedirectResponse
    {
        $user = $request->user();
        $code = SpaceInvite::normalizeCode($code);

        $result = DB::transaction(function () use ($code, $user) {
            $invite = SpaceInvite::where('code', $code)->lockForUpdate()->first();
            $space = $invite ? Space::whereKey($invite->space_id)->lockForUpdate()->first() : null;

            if ($problem = $this->problem($invite, $user)) {
                return $problem === 'already_member' ? $space : $problem;
            }

            $space->members()->attach($user->id, ['joined_at' => now()]);
            $invite->forceFill(['accepted_by' => $user->id, 'accepted_at' => now()])->save();

            return $space;
        });

        if (is_string($result)) {
            return redirect()->route('invites.show', $code);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('invite.joined')]);

        return redirect()->route('spaces.show', $result);
    }

    /** Why this user can't use this invite, or null if they can. */
    private function problem(?SpaceInvite $invite, ?User $user): ?string
    {
        if (! $invite || ! $invite->space) {
            return 'not_found';
        }

        $space = $invite->space;

        if ($user && $space->hasMember($user)) {
            return 'already_member';
        }
        if (! $invite->isUsable()) {
            return 'expired';
        }
        if (! $space->isActive()) {
            return 'not_found';
        }
        if ($space->isFull()) {
            return 'full';
        }
        if ($user && $this->alreadyPaired($user, $space)) {
            return 'already_paired';
        }

        return null;
    }

    /** The same two people may only share one active space. / คู่เดิมมี space ที่ใช้งานได้แค่ 1 อัน */
    private function alreadyPaired(User $user, Space $space): bool
    {
        $otherIds = $space->members()->pluck('users.id');

        return Space::active()
            ->whereKeyNot($space->id)
            ->whereHas('members', fn ($q) => $q->whereKey($user->id))
            ->whereHas('members', fn ($q) => $q->whereIn('users.id', $otherIds))
            ->exists();
    }
}
