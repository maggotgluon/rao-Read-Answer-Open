<?php

namespace App\Services;

use App\Models\DailyPrompt;
use App\Models\Moment;
use App\Models\Space;
use App\Models\SpaceEvent;
use App\Models\User;
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
    public function __construct(private DailyPrompts $prompts) {}

    /** @return array<string, mixed> */
    public function month(Space $space, Carbon $month): array
    {
        $start = $month->copy()->startOfMonth();
        $end = $month->copy()->endOfMonth();
        $today = $space->today();
        $pairedOn = $this->prompts->pairedOn($space);

        $answerCounts = $space->dailyPrompts()
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
        $daily = $space->dailyPrompts()->whereDate('date', $date->toDateString())
            ->with(['prompt.author:id,name', 'answers'])->first();
        $daily?->setRelation('space', $space);

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
            'moments' => $moments->all(),
            'events' => $this->occurrences($space, $date, $date)->values()->all(),
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
        return $space->events()->with('author:id,name')->orderBy('date')->get()
            ->map(fn (SpaceEvent $e) => [
                'id' => $e->id,
                'kind' => $e->kind,
                'title' => $e->title,
                'date' => $e->date->toDateString(),
                'repeats_yearly' => $e->repeats_yearly,
                'author' => $e->author?->name,
            ])->all();
    }

    /**
     * Event occurrences between two local dates, incl. yearly repeats and the anniversary.
     * Feb 29 falls on Feb 28 in non-leap years.
     *
     * @return Collection<int, array<string, mixed>>
     */
    public function occurrences(Space $space, Carbon $from, Carbon $to): Collection
    {
        $from = $from->copy()->startOfDay();
        $to = $to->copy()->startOfDay();
        $out = collect();

        $sources = $space->events()->get()->map(fn (SpaceEvent $e) => [
            'id' => $e->id, 'kind' => $e->kind, 'title' => $e->title,
            'date' => $e->date, 'yearly' => $e->repeats_yearly,
        ]);
        if ($space->anniversary_on) {
            $sources->push([
                'id' => null, 'kind' => 'anniversary', 'title' => __('event.anniversary'),
                'date' => $space->anniversary_on, 'yearly' => true,
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

    /** @return array<string, mixed> */
    private function occurrence(array $source, Carbon $on, int $years): array
    {
        return [
            'event_id' => $source['id'],
            'kind' => $source['kind'],
            'title' => $source['title'],
            'date' => $on->toDateString(),
            'years' => $years,   // e.g. 3rd anniversary
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
            $count = $answerCounts[$d->toDateString()] ?? $space->dailyPrompts()
                ->whereDate('date', $d->toDateString())->withCount('answers')->first()?->answers_count ?? 0;
            $complete += $count >= Space::MAX_MEMBERS ? 1 : 0;
        }

        return compact('complete', 'elapsed');
    }
}
