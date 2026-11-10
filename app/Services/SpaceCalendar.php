<?php

namespace App\Services;

use App\Models\DailyPrompt;
use App\Models\Moment;
use App\Models\Space;
use App\Models\SpaceEvent;
use App\Models\SpecialDay;
use App\Models\User;
use App\Support\Features;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Month view, day detail and upcoming events for a space.
 * มุมมองรายเดือน รายละเอียดรายวัน และวันสำคัญที่กำลังจะมาถึง
 *
 * Day status (from the viewer's side, privacy-safe — no answer text here):
 *   complete  both answered          / ตอบครบทั้งคู่
 *   partial   only one answered       / ตอบคนเดียว
 *   forgiven  missed, but one of the week's 2 free misses / พลาดแต่ใช้วันพัก
 *   missed    missed                  / พลาด
 *   today | future | before           (before = before the couple paired)
 */
class SpaceCalendar
{
    /** Default date picture per kind. / ภาพเริ่มต้นตามประเภท */
    public const ICONS = ['anniversary' => 'anniversary', 'birthday' => 'birthday', 'special' => 'special', 'other' => 'other', 'site' => 'valentine'];

    public function __construct(private DailyPrompts $prompts) {}

    /** @return array<string, mixed> */
    public function month(Space $space, Carbon $month): array
    {
        $start = $month->copy()->startOfMonth();
        $end = $month->copy()->endOfMonth();
        $today = $space->today();
        $pairedOn = $this->prompts->pairedOn($space);

        $answerCounts = $space->dailyPrompts()->where('slot', DailyPrompt::MAIN)
            ->whereBetween('date', [$start->copy()->startOfWeek()->toDateString(), $end->toDateString()])
            ->withCount('answers')->get()
            ->mapWithKeys(fn (DailyPrompt $d) => [$d->date->toDateString() => $d->answers_count]);

        $momentDays = $space->moments()->posted()
            ->whereBetween('posted_at', [$start->copy()->setTimezone('UTC'), $end->copy()->endOfDay()->setTimezone('UTC')])
            ->pluck('posted_at')
            ->map(fn ($at) => Carbon::parse($at)->setTimezone($space->timezone)->toDateString())
            ->countBy();

        $events = $this->occurrences($space, $start, $end)->groupBy('date');

        $missesPerWeek = [];
        $days = [];
        // Walk from the Monday of the first week so "2 free misses per week" counts whole weeks.
        for ($d = $start->copy()->startOfWeek(); $d->lte($end); $d->addDay()) {
            $key = $d->toDateString();
            $count = $answerCounts[$key] ?? 0;
            $status = match (true) {
                ! $pairedOn || $d->lt($pairedOn) => 'before',
                $d->gt($today) => 'future',
                $count >= Space::MAX_MEMBERS => 'complete',
                $d->equalTo($today) => $count ? 'partial' : 'today',
                $count === 1 => 'partial',
                default => 'missed',
            };

            if (in_array($status, ['missed', 'partial'], true) && ! $d->equalTo($today)) {
                $week = $d->format('o-W');
                $missesPerWeek[$week] = ($missesPerWeek[$week] ?? 0) + 1;
                if ($status === 'missed' && $missesPerWeek[$week] <= DailyPrompts::FREEZES_PER_WEEK) {
                    $status = 'forgiven';
                }
            }

            if ($d->lt($start)) {
                continue;
            }

            $days[] = [
                'date' => $key,
                'status' => $status,
                'is_today' => $d->equalTo($today),
                'moments' => $momentDays[$key] ?? 0,
                'events' => ($events[$key] ?? collect())->pluck('title')->values()->all(),
            ];
        }

        $past = collect($days)->filter(fn ($d) => ! in_array($d['status'], ['before', 'future'], true));
        $week = $this->weekStats($space, $today, $pairedOn, $answerCounts->all());

        return [
            'month' => $start->format('Y-m'),
            'prev' => $start->copy()->subMonth()->format('Y-m'),
            'next' => $start->copy()->addMonth()->format('Y-m'),
            'is_current' => $start->format('Y-m') === $today->format('Y-m'),
            'days' => $days,
            'stats' => [
                'month_complete' => $past->where('status', 'complete')->count(),
                'month_elapsed' => $past->count(),
                'week_complete' => $week['complete'],
                'week_elapsed' => $week['elapsed'],
            ],
        ];
    }

    /**
     * Everything about one day. Partner's answer is included only if the viewer answered too
     * (stays hidden forever otherwise — decided in planning).
     * คำตอบของอีกฝ่ายจะแสดงเฉพาะเมื่อผู้ดูตอบแล้ว (ถ้าไม่ตอบ จะซ่อนตลอดไป)
     *
     * @return array<string, mixed>
     */
    public function day(Space $space, Carbon $date, User $viewer, string $locale): array
    {
        $dailies = $space->dailyPrompts()->whereDate('date', $date->toDateString())
            ->with(['prompt.author:id,name', 'answers', 'ratings'])->get()
            ->each(fn (DailyPrompt $d) => $d->setRelation('space', $space));
        $daily = $dailies->firstWhere('slot', DailyPrompt::MAIN);
        $bonus = $dailies->firstWhere('slot', DailyPrompt::BONUS);

        $moments = $space->moments()->posted()
            ->whereBetween('posted_at', [
                $date->copy()->startOfDay()->setTimezone('UTC'),
                $date->copy()->endOfDay()->setTimezone('UTC'),
            ])
            ->with('user:id,name', 'media')->oldest('posted_at')->get()
            ->map(fn (Moment $m) => [
                'id' => $m->ulid,
                'author' => $m->user->name,
                'body' => $m->body,
                'photos' => $m->media->map(fn ($media) => route('spaces.media.show', [$space, $m, $media]))->all(),
            ]);

        return [
            'date' => $date->toDateString(),
            'prompt' => $daily ? $this->prompts->present($daily, $viewer, $locale) : null,
            'bonus' => $bonus ? $this->prompts->present($bonus, $viewer, $locale) : null,
            'moments' => $moments->all(),
            'events' => $this->occurrences($space, $date, $date)->values()->all(),
            'memories' => $this->memories($space, $date),
        ];
    }

    /**
     * Upcoming occurrences (today included), soonest first.
     *
     * @return list<array<string, mixed>>
     */
    public function upcoming(Space $space, int $limit = 6): array
    {
        $today = $space->today();

        return $this->occurrences($space, $today, $today->copy()->addYear()->subDay())
            ->sortBy('date')->take($limit)
            ->map(fn ($o) => [...$o, 'in_days' => (int) $today->diffInDays(Carbon::parse($o['date'], $space->timezone))])
            ->values()->all();
    }

    /** @return list<array<string, mixed>> */
    public function eventList(Space $space): array
    {
        return $space->events()->with('author:id,name')->withCount('moments')->orderBy('date')->get()
            ->map(fn (SpaceEvent $e) => [
                'id' => $e->id,
                'kind' => $e->kind,
                'title' => $e->kind === 'anniversary' ? __('event.anniversary') : $e->title,
                'moments' => $e->moments_count,
                'date' => $e->date->toDateString(),
                'repeats_yearly' => $e->repeats_yearly,
                'author' => $e->author?->name,
            ])->all();
    }

    /**
     * Occurrences between two local dates: space events (incl. yearly repeats and the
     * anniversary) + members' birthdays from their profiles. Feb 29 → Feb 28 in non-leap years.
     * วันสำคัญของ space + วันเกิดของสมาชิก (จากโปรไฟล์)
     *
     * @return Collection<int, array<string, mixed>>
     */
    public function occurrences(Space $space, Carbon $from, Carbon $to): Collection
    {
        $from = $from->copy()->startOfDay();
        $to = $to->copy()->startOfDay();
        $out = collect();

        $sources = $space->events()->withCount('moments')->get()->map(fn (SpaceEvent $e) => [
            'event_id' => $e->id,
            'user_id' => null,
            'kind' => $e->kind,
            'title' => $e->kind === 'anniversary' ? __('event.anniversary') : $e->title,
            'date' => $e->date,
            'yearly' => $e->repeats_yearly || $e->kind === 'anniversary',
            'show_years' => in_array($e->kind, ['anniversary', 'special'], true),
            'memories' => $e->moments_count,
        ]);

        // Days the admin added for everyone (Valentine's, Songkran…). / วันพิเศษจากแอดมิน
        foreach (SpecialDay::where('active', true)->get() as $day) {
            $sources->push([
                'event_id' => null,
                'user_id' => null,
                'kind' => 'site',
                'icon' => $day->icon,
                'title' => $day->titleFor(app()->getLocale()),
                'date' => $day->date,
                'yearly' => $day->repeats_yearly,
                'show_years' => false,
                'memories' => 0,
            ]);
        }

        foreach ($space->members()->whereNotNull('birthday')->get() as $member) {
            $sources->push([
                'event_id' => null,
                'user_id' => $member->id,
                'kind' => 'birthday',
                'title' => __('event.birthday_of', ['name' => $member->name]),
                'date' => $member->birthday,
                'yearly' => true,
                'show_years' => $member->show_age,   // each person decides / แต่ละคนเลือกเอง
                'memories' => 0,
            ]);
        }

        foreach ($sources as $s) {
            $base = Carbon::parse($s['date']->toDateString(), $space->timezone);

            if (! $s['yearly']) {
                if ($base->betweenIncluded($from, $to)) {
                    $out->push($this->occurrence($s, $base, 0));
                }

                continue;
            }

            for ($year = $from->year; $year <= $to->year; $year++) {
                if ($year < $base->year) {
                    continue;
                }
                $day = min($base->day, Carbon::create($year, $base->month, 1, 0, 0, 0, $space->timezone)->daysInMonth);
                $on = Carbon::create($year, $base->month, $day, 0, 0, 0, $space->timezone);
                if ($on->betweenIncluded($from, $to)) {
                    $out->push($this->occurrence($s, $on, $year - $base->year));
                }
            }
        }

        return $out;
    }

    /**
     * Moments attached to the yearly dates that fall on $date, from earlier years.
     * "On this day" memories. / ความทรงจำของวันสำคัญที่ตรงกับวันนี้ จากปีก่อน ๆ
     *
     * @return list<array<string, mixed>>
     */
    public function memories(Space $space, Carbon $date): array
    {
        if (! Features::on('memories', $space)) {
            return [];
        }

        $eventIds = $this->occurrences($space, $date, $date)->pluck('event_id')->filter()->all();
        if (! $eventIds) {
            return [];
        }

        return $space->moments()->posted()
            ->whereIn('space_event_id', $eventIds)
            ->where('posted_at', '<', $date->copy()->startOfDay()->setTimezone('UTC'))
            ->with('user:id,name', 'media', 'event:id,kind,title')
            ->latest('posted_at')->get()
            ->map(fn (Moment $m) => [
                'id' => $m->ulid,
                'author' => $m->user->name,
                'body' => $m->body,
                'posted_at' => $m->posted_at?->toIso8601String(),
                'years_ago' => (int) $m->posted_at->copy()->setTimezone($space->timezone)->startOfDay()->diffInYears($date),
                'event' => $m->event?->kind === 'anniversary' ? __('event.anniversary') : $m->event?->title,
                'photos' => $m->media->map(fn ($media) => route('spaces.media.show', [$space, $m, $media]))->all(),
            ])->all();
    }

    /** @return array<string, mixed> */
    private function occurrence(array $source, Carbon $on, int $years): array
    {
        return [
            'event_id' => $source['event_id'],
            'user_id' => $source['user_id'],
            'kind' => $source['kind'],
            // picture in the theme's dates/ folder / ภาพในโฟลเดอร์ dates ของธีม
            'icon' => 'dates.'.($source['icon'] ?? null ?: self::ICONS[$source['kind']] ?? 'other'),
            'title' => $source['title'],
            'date' => $on->toDateString(),
            'years' => $source['show_years'] ? $years : 0,   // 3rd anniversary / turns 30
            'memories' => $source['memories'],
        ];
    }

    /** @return array{complete: int, elapsed: int} */
    private function weekStats(Space $space, Carbon $today, ?Carbon $pairedOn, array $answerCounts): array
    {
        if (! $pairedOn) {
            return ['complete' => 0, 'elapsed' => 0];
        }

        $complete = 0;
        $elapsed = 0;
        for ($d = $today->copy()->startOfWeek(); $d->lte($today); $d->addDay()) {
            if ($d->lt($pairedOn)) {
                continue;
            }
            $elapsed++;
            $count = $answerCounts[$d->toDateString()] ?? $space->dailyPrompts()->where('slot', DailyPrompt::MAIN)
                ->whereDate('date', $d->toDateString())->withCount('answers')->first()?->answers_count ?? 0;
            $complete += $count >= Space::MAX_MEMBERS ? 1 : 0;
        }

        return compact('complete', 'elapsed');
    }
}
