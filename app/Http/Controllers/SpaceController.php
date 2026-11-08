<?php

namespace App\Http\Controllers;

use App\Models\Space;
use App\Models\SpaceInvite;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SpaceController extends Controller
{
    /** Home: the user's spaces. Jumps straight in when there is only one. */
    public function index(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        // Came from an invite link before signing up / logging in.
        if ($code = $request->session()->pull('pending_invite')) {
            return redirect()->route('invites.show', $code);
        }

        $spaces = $user->spaces()->with('members:id,name')->latest('space_members.created_at')->get();

        if ($spaces->count() === 1 && ! $request->boolean('all')) {
            return redirect()->route('spaces.show', $spaces->first());
        }

        return Inertia::render('spaces/index', [
            'spaces' => $spaces->map(fn (Space $s) => $this->summary($s, $user)),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['nullable', 'string', 'max:60'],
            'timezone' => ['nullable', 'timezone:all'],
        ]);

        $space = DB::transaction(function () use ($request, $data) {
            $space = Space::create([
                'name' => $data['name'] ?? null,
                'timezone' => $data['timezone'] ?? 'Asia/Bangkok',
                'created_by' => $request->user()->id,
            ]);
            $space->members()->attach($request->user()->id);

            return $space;
        });

        $this->freshInvite($space, $request->user()->id);

        return redirect()->route('spaces.show', $space);
    }

    public function show(Request $request, Space $space): Response
    {
        $user = $request->user();
        $space->load('members:id,name');

        $invite = null;
        if ($space->isActive() && ! $space->isFull()) {
            $invite = $space->invites()->whereNull('accepted_at')
                ->where('expires_at', '>', now())->latest()->first()
                ?? $this->freshInvite($space, $user->id);
        }

        return Inertia::render('spaces/show', [
            'space' => [
                ...$this->summary($space, $user),
                'timezone' => $space->timezone,
                'frozen_at' => $space->frozen_at?->toIso8601String(),
                'delete_after' => $space->delete_after?->toIso8601String(),
                'can_restore' => $space->isFrozen() && $space->frozen_by === $user->id,
            ],
            'invite' => $invite ? [
                'code' => $invite->code,
                'url' => route('invites.show', $invite->code),
                'expires_at' => $invite->expires_at->toIso8601String(),
            ] : null,
        ]);
    }

    public function update(Request $request, Space $space): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['nullable', 'string', 'max:60'],
            'timezone' => ['required', 'timezone:all'],
        ]);

        $space->update($data);

        return back()->with('success', __('space.saved'));
    }

    /** Unpair: freeze for 30 days, then the scheduler purges it. / เลิกจับคู่ */
    public function freeze(Request $request, Space $space): RedirectResponse
    {
        $space->freeze($request->user());

        return redirect()->route('spaces.show', $space)->with('success', __('space.frozen_flash'));
    }

    public function restore(Request $request, Space $space): RedirectResponse
    {
        abort_unless($space->isFrozen() && $space->frozen_by === $request->user()->id, 403);

        $space->restore();

        return back()->with('success', __('space.restored_flash'));
    }

    public function regenerateInvite(Request $request, Space $space): RedirectResponse
    {
        abort_if($space->isFull(), 422, __('space.full'));

        $this->freshInvite($space, $request->user()->id);

        return back();
    }

    private function freshInvite(Space $space, int $userId): SpaceInvite
    {
        // Only one live invite per space; old codes stop working.
        $space->invites()->whereNull('accepted_at')->delete();

        return $space->invites()->create([
            'code' => SpaceInvite::generateCode(),
            'created_by' => $userId,
            'expires_at' => now()->addDays(SpaceInvite::VALID_DAYS),
        ]);
    }

    /** @return array<string, mixed> */
    private function summary(Space $space, $user): array
    {
        $partner = $space->partnerOf($user);

        return [
            'id' => $space->ulid,
            'name' => $space->name,
            'status' => $space->status,
            'partner' => $partner ? ['name' => $partner->name] : null,
            'url' => route('spaces.show', $space),
        ];
    }
}
