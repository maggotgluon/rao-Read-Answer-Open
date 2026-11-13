<?php

namespace App\Http\Controllers;

use App\Models\Moment;
use App\Models\MomentReaction;
use App\Models\Mood;
use App\Models\ShareRequest;
use App\Models\Space;
use App\Models\SpaceEvent;
use App\Models\SpaceInvite;
use App\Models\SurveyResponse;
use App\Models\User;
use App\Services\Analytics;
use App\Services\DailyPrompts;
use App\Services\Achievements;
use App\Services\Shareables;
use App\Services\Location;
use App\Services\SpacePlaces;
use App\Services\SpaceStory;
use App\Services\SpaceActivity;
use App\Services\SpaceCalendar;
use App\Support\Features;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
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
            // Today's letter is the heart of the app. / เปิดหน้าจดหมายวันนี้ก่อน
            return redirect()->route('spaces.daily', $spaces->first());
        }

        return Inertia::render('spaces/index', [
            'spaces' => $spaces->map(fn (Space $s) => $this->summary($s, $user)),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        // "Multiple spaces" switched off: one active space per person. / ปิดฟีเจอร์หลาย space
        if (! Features::on('poly', $request->user()) && $request->user()->spaces()->active()->exists()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('feature.poly_off')]);

            return back();
        }

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
            $space->members()->attach($request->user()->id, ['joined_at' => now()]);

            return $space;
        });

        Analytics::track($request->user(), 'space_created', [], $space);
        $this->freshInvite($space, $request->user()->id);

        return redirect()->route('spaces.show', $space);
    }

    /** Tab 1 — Overview: month calendar, stats, upcoming events. / ภาพรวม */
    public function show(Request $request, Space $space, SpaceCalendar $calendar): Response
    {
        $user = $request->user();
        $month = $this->monthFrom($request, $space);

        return Inertia::render('spaces/show', [
            ...$this->shell($space, $user),
            'calendar' => fn () => $calendar->month($space, $month, $user),
            'upcoming' => fn () => $calendar->upcoming($space),
            'events' => fn () => $calendar->eventList($space),
            // Loaded on demand when a day is tapped: router.reload({ only: ['day'], data: { day } })
            'day' => Inertia::optional(fn () => $this->dayFrom($request, $space)
                ? $calendar->day($space, $this->dayFrom($request, $space), $user, app()->getLocale())
                : null),
            'invite' => fn () => $this->inviteFor($space, $user),
            'location' => fn () => Features::on('location', $space) ? app(Location::class)->forSpace($space, $user) : null,
            'story' => fn () => Features::on('location', $space) ? app(SpaceStory::class)->timeline($space) : null,
            'achievements' => fn () => Features::on('achievements', $space) ? app(Achievements::class)->sheet($space, $user) : null,
            'shareRequests' => fn () => $this->shareRequestsFor($space, $user),
            'places' => fn () => Features::on('places', $space) ? [
                'items' => app(SpacePlaces::class)->list($space),
                'visits' => app(SpacePlaces::class)->visits($space, $user),
            ] : null,
        ]);
    }

    /** @return array<string, mixed> */
    private function moods(Space $space, User $user): array
    {
        $partner = $space->partnerOf($user);
        $today = Mood::whereDate('date', $space->today()->toDateString())
            ->whereIn('user_id', array_filter([$user->id, $partner?->id]))->pluck('mood', 'user_id');

        return [
            'options' => Mood::MOODS,
            'mine' => $today[$user->id] ?? null,
            'partner' => $partner ? ($today[$partner->id] ?? null) : null,
        ];
    }

    /** Tab 2 — Daily: today's card, streak, today's events, activity. / รายวัน */
    public function daily(Request $request, Space $space, DailyPrompts $prompts, SpaceCalendar $calendar, SpaceActivity $activity): Response
    {
        $user = $request->user();
        $today = $space->today();

        return Inertia::render('spaces/daily', [
            ...$this->shell($space, $user),
            'days' => fn () => $prompts->window($space)
                ->map(fn ($d) => $prompts->present($d, $user, app()->getLocale()))->values(),
            'streak' => fn () => $prompts->streak($space),
            'todayEvents' => fn () => $calendar->occurrences($space, $today, $today)->values(),
            'memories' => fn () => $calendar->memories($space, $today),
            'activity' => fn () => $activity->recent($space, $user),
            'location' => fn () => Features::on('location', $space) ? app(Location::class)->forSpace($space, $user) : null,
            'moods' => fn () => $this->moods($space, $user),
            // Ask once, ~14 days after joining. / ถามครั้งเดียวหลังสมัคร ~14 วัน
            'survey' => fn () => $user->created_at?->lte(now()->subDays(14))
                && ! SurveyResponse::where('user_id', $user->id)->exists(),
        ]);
    }

    /** Tab 3 — Moments: the shared wall. / ช่วงเวลา */
    public function moments(Request $request, Space $space, SpaceCalendar $calendar): Response
    {
        $user = $request->user();

        return Inertia::render('spaces/moments', [
            ...$this->shell($space, $user),
            'moments' => fn () => $this->momentList($space, $user, Moment::STATUS_POSTED),
            'drafts' => fn () => $this->momentList($space, $user, Moment::STATUS_DRAFT),
            'reactionKeys' => array_keys(MomentReaction::REACTIONS),
            'dateOptions' => fn () => $calendar->eventList($space),
            'placeOptions' => fn () => Features::on('places', $space) ? app(SpacePlaces::class)->list($space) : [],
        ]);
    }

    public function update(Request $request, Space $space): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['nullable', 'string', 'max:60'],
            'timezone' => ['required', 'timezone:all'],
            'anniversary_on' => ['nullable', 'date_format:Y-m-d', 'before_or_equal:today'],
        ]);

        $space->update(['name' => $data['name'] ?? null, 'timezone' => $data['timezone']]);

        // The anniversary is a normal "our date" (kind=anniversary) so moments can attach to it.
        $anniversary = $space->anniversary();
        if (filled($data['anniversary_on'] ?? null)) {
            $anniversary
                ? $anniversary->update(['date' => $data['anniversary_on']])
                : $space->events()->create([
                    'kind' => SpaceEvent::ANNIVERSARY, 'title' => 'anniversary',
                    'date' => $data['anniversary_on'], 'repeats_yearly' => true,
                    'created_by' => $request->user()->id,
                ]);
        } else {
            $anniversary?->delete();   // attached moments stay, just unlinked
        }
        $this->toast('space.saved');

        return back();
    }

    /** Either partner switches long-distance mode on/off. / เปิด-ปิดโหมดไกลกัน */
    public function longDistance(Request $request, Space $space): RedirectResponse
    {
        abort_unless(Features::on('location', $space), 404);
        $on = $request->validate(['on' => ['required', 'boolean']])['on'];

        $space->setLongDistance($on, $request->user());
        Analytics::track($request->user(), $on ? 'long_distance_on' : 'long_distance_off', [], $space);
        $this->toast($on ? 'ld.on_flash' : 'ld.off_flash');

        return back();
    }

    /** Delete the whole daily-distance history of this space. / ลบประวัติระยะห่างทั้งหมด */
    public function forgetDistance(Request $request, Space $space): RedirectResponse
    {
        $space->distanceDays()->delete();
        $this->toast('story.forgot_flash');

        return back();
    }

    /** Unpair: freeze for 30 days, then the scheduler purges it. / เลิกจับคู่ */
    public function freeze(Request $request, Space $space): RedirectResponse
    {
        $space->freeze($request->user());
        $this->toast('space.frozen_flash');

        return redirect()->route('spaces.show', $space);
    }

    public function restore(Request $request, Space $space): RedirectResponse
    {
        abort_unless($space->isFrozen() && $space->frozen_by === $request->user()->id, 403);

        $space->restore();
        $this->toast('space.restored_flash');

        return back();
    }

    public function regenerateInvite(Request $request, Space $space): RedirectResponse
    {
        abort_if($space->isFull(), 422, __('space.full'));

        $this->freshInvite($space, $request->user()->id);

        return back();
    }

    private function toast(string $key): void
    {
        Inertia::flash('toast', ['type' => 'success', 'message' => __($key)]);
    }

    /**
     * Props every tab needs (header, tabs, settings).
     *
     * @return array<string, mixed>
     */
    private function shell(Space $space, User $user): array
    {
        $space->load('members');

        return [
            'space' => [
                ...$this->summary($space, $user),
                'timezone' => $space->timezone,
                'anniversary_on' => $space->anniversary()?->date->toDateString(),
                'today' => $space->today()->toDateString(),
                'frozen_at' => $space->frozen_at?->toIso8601String(),
                'delete_after' => $space->delete_after?->toIso8601String(),
                'can_restore' => $space->isFrozen() && $space->frozen_by === $user->id,
                'long_distance' => (bool) $space->long_distance,
                'premium' => (bool) $space->premium,
                'features' => Features::forSpace($space),
            ],
            // New stamps this person hasn't seen yet: a small celebration on any tab.
            // แสตมป์ใหม่ที่ยังไม่เคยเห็น แสดงฉลองบนทุกแท็บ
            'newAchievements' => Features::on('achievements', $space)
                ? $space->achievements()->orderBy('earned_at')->get()
                    ->reject(fn ($a) => $a->seenBy($user))
                    ->map(fn ($a) => [...Achievements::describe($a->key), 'id' => $a->id])->values()->all()
                : [],
        ];
    }

    /**
     * "May I share this?" waiting for MY answer, with a short preview of what it is.
     * คำขอแชร์ที่รอฉันตอบ พร้อมตัวอย่างสั้น ๆ
     *
     * @return list<array<string, mixed>>
     */
    private function shareRequestsFor(Space $space, User $user): array
    {
        if (! app(Shareables::class)->enabled($space)) {
            return [];
        }

        return $space->shareRequests()->where(['owner_id' => $user->id, 'status' => ShareRequest::PENDING])
            ->with('requester:id,name')->latest('id')->limit(10)->get()
            ->map(function (ShareRequest $r) use ($space) {
                $item = app(Shareables::class)->find($space, $r->item_type, $r->item_id);
                if (! $item) {
                    return null;
                }
                $preview = $item instanceof Moment
                    ? Str::limit((string) $item->body, 120)
                    : $item->prompt?->textFor(app()->getLocale());

                return [
                    'id' => $r->id,
                    'kind' => $r->item_type,
                    'by' => $r->requester?->name,
                    'preview' => $preview,
                    'at' => $r->created_at?->toIso8601String(),
                ];
            })->filter()->values()->all();
    }

    /** The viewer saw their new stamps. / ดูแสตมป์ใหม่แล้ว */
    public function seenAchievements(Request $request, Space $space, Achievements $achievements): RedirectResponse
    {
        $achievements->markSeen($space, $request->user());

        return back();
    }

    /** @return array<string, string>|null */
    private function inviteFor(Space $space, User $user): ?array
    {
        if (! $space->isActive() || $space->isFull()) {
            return null;
        }

        $invite = $space->invites()->whereNull('accepted_at')
            ->where('expires_at', '>', now())->latest()->first()
            ?? $this->freshInvite($space, $user->id);

        return [
            'code' => $invite->code,
            'url' => route('invites.show', $invite->code),
            'expires_at' => $invite->expires_at->toIso8601String(),
        ];
    }

    private function monthFrom(Request $request, Space $space): Carbon
    {
        $raw = (string) $request->query('month');

        return preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', $raw)
            ? Carbon::createFromFormat('Y-m-d', "{$raw}-01", $space->timezone)->startOfDay()
            : $space->today()->startOfMonth();
    }

    private function dayFrom(Request $request, Space $space): ?Carbon
    {
        $raw = (string) $request->input('day');

        return preg_match('/^\d{4}-\d{2}-\d{2}$/', $raw) && strtotime($raw)
            ? Carbon::createFromFormat('Y-m-d', $raw, $space->timezone)->startOfDay()
            : null;
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

    /**
     * Posted moments (both partners) or MY drafts only. Never the partner's drafts.
     * โพสต์ของทั้งคู่ หรือร่างของฉันเท่านั้น
     *
     * @return list<array<string, mixed>>
     */
    private function momentList(Space $space, User $user, string $status): array
    {
        $query = $space->moments()->where('status', $status)
            ->with(['user:id,name', 'media', 'reactions', 'comments.user:id,name', 'event:id,kind,title', 'place:id,name,kind']);

        $status === Moment::STATUS_DRAFT
            ? $query->where('user_id', $user->id)->latest()
            : $query->latest('posted_at');

        return $query->limit(50)->get()->map(fn (Moment $m) => [
            'id' => $m->ulid,
            'author' => $m->user->name,
            'mine' => $m->user_id === $user->id,
            'body' => $m->body,
            'status' => $m->status,
            'posted_at' => $m->posted_at?->toIso8601String(),
            'date' => $m->event ? [
                'id' => $m->event->id,
                'kind' => $m->event->kind,
                'title' => $m->event->kind === SpaceEvent::ANNIVERSARY ? __('event.anniversary') : $m->event->title,
            ] : null,
            'place' => $m->place ? ['id' => $m->place->id, 'name' => $m->place->name, 'kind' => $m->place->kind] : null,
            // own / allowed / ask / pending / not_now, null = sharing off or a draft
            'share' => $m->status === Moment::STATUS_POSTED ? app(Shareables::class)->state($space, $m, $user) : null,
            'photos' => $m->media->map(fn ($media) => [
                'url' => route('spaces.media.show', [$space, $m, $media]),
                'width' => $media->width,
                'height' => $media->height,
            ])->all(),
            'reactions' => $m->reactions->map(fn ($r) => [
                'emoji' => $r->emoji,
                'mine' => $r->user_id === $user->id,
            ])->all(),
            'comments' => $m->comments->map(fn ($c) => [
                'id' => $c->id,
                'author' => $c->user->name,
                'mine' => $c->user_id === $user->id,
                'body' => $c->body,
                'created_at' => $c->created_at?->toIso8601String(),
            ])->all(),
        ])->all();
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
