<?php

namespace App\Services;

use App\Models\SurveyResponse;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Product insight for the admin: aggregated numbers only, never anyone's content.
 * Funnel and retention come from core tables (everyone, counted); opens/push/features
 * come from opt-in analytics events (people who agreed only).
 * ข้อมูลเชิงลึกสำหรับแอดมิน เป็นตัวเลขรวมเท่านั้น
 */
class Insights
{
    private const TZ = 'Asia/Bangkok';

    /** @return array<string, mixed> */
    public function all(): array
    {
        return [
            'consent' => [
                'users' => User::count(),
                'opted_in' => User::whereNotNull('analytics_consent_at')->count(),
            ],
            'funnel' => $this->funnel(),
            'cohorts' => $this->cohorts(),
            'hours' => $this->answerHours(),
            'opens' => $this->opens(),
            'push' => $this->push(),
            'features' => $this->features(),
            'survey' => $this->survey(),
        ];
    }

    /** Sign-ups in the last 90 days, step by step. / ขั้นตอนตั้งแต่สมัครจนใช้งานต่อเนื่อง */
    private function funnel(): array
    {
        $users = User::where('created_at', '>=', now()->subDays(90))->get(['id', 'created_at']);
        $ids = $users->pluck('id');

        $inSpace = DB::table('space_members')->whereIn('user_id', $ids)->distinct()->pluck('user_id');
        $pairedSpaces = DB::table('space_members')->select('space_id')->groupBy('space_id')->havingRaw('count(*) >= 2');
        $paired = DB::table('space_members')->whereIn('user_id', $ids)->whereIn('space_id', $pairedSpaces)->distinct()->pluck('user_id');

        $answers = DB::table('answers')->whereIn('user_id', $ids)->get(['user_id', 'daily_prompt_id', 'created_at']);
        $wrote = $answers->pluck('user_id')->unique();
        $bothDays = DB::table('answers')->select('daily_prompt_id')->groupBy('daily_prompt_id')->havingRaw('count(*) >= 2')->pluck('daily_prompt_id')->flip();
        $both = $answers->filter(fn ($a) => isset($bothDays[$a->daily_prompt_id]))->pluck('user_id')->unique();

        $joined = $users->keyBy('id');
        $week2 = $answers->filter(fn ($a) => Carbon::parse($a->created_at)->gte($joined[$a->user_id]->created_at->copy()->addDays(7)))
            ->pluck('user_id')->unique();

        return [
            ['key' => 'signed_up', 'count' => $users->count()],
            ['key' => 'in_space', 'count' => $inSpace->count()],
            ['key' => 'paired', 'count' => $paired->count()],
            ['key' => 'first_letter', 'count' => $wrote->count()],
            ['key' => 'both_wrote', 'count' => $both->count()],
            ['key' => 'still_writing_week2', 'count' => $week2->count()],
        ];
    }

    /**
     * Weekly sign-up cohorts: % who wrote a letter in week 1..4 after joining.
     * กลุ่มตามสัปดาห์ที่สมัคร: กี่ % ยังเขียนจดหมายในสัปดาห์ที่ 1-4
     *
     * @return list<array{week: string, size: int, weeks: list<int|null>}>
     */
    private function cohorts(): array
    {
        $start = now(self::TZ)->startOfWeek()->subWeeks(7);
        $users = User::where('created_at', '>=', $start->copy()->utc())->get(['id', 'created_at']);
        $answers = DB::table('answers')->whereIn('user_id', $users->pluck('id'))->get(['user_id', 'created_at'])->groupBy('user_id');

        return $users->groupBy(fn ($u) => $u->created_at->copy()->tz(self::TZ)->startOfWeek()->toDateString())
            ->sortKeys()
            ->map(function (Collection $group, string $week) use ($answers) {
                $weeks = [];
                foreach (range(0, 3) as $n) {
                    $from = Carbon::parse($week, self::TZ)->addWeeks($n);
                    if ($from->isFuture()) {
                        $weeks[] = null;   // not reached yet

                        continue;
                    }
                    $active = $group->filter(function ($u) use ($answers, $n) {
                        $lo = $u->created_at->copy()->addDays(7 * $n);
                        $hi = $lo->copy()->addDays(7);

                        return ($answers[$u->id] ?? collect())->contains(fn ($a) => Carbon::parse($a->created_at)->between($lo, $hi));
                    })->count();
                    $weeks[] = (int) round(100 * $active / max(1, $group->count()));
                }

                return ['week' => $week, 'size' => $group->count(), 'weeks' => $weeks];
            })->values()->all();
    }

    /** When people write (Bangkok hour, last 30 days) → best push times. / เวลาที่คนเขียน */
    private function answerHours(): array
    {
        $hours = array_fill(0, 24, 0);
        DB::table('answers')->where('created_at', '>=', now()->subDays(30))->pluck('created_at')
            ->each(function ($at) use (&$hours) {
                $hours[(int) Carbon::parse($at)->tz(self::TZ)->format('G')]++;
            });

        return $hours;
    }

    /** @return Collection<int, object> */
    private function events(string $name, int $days = 30): Collection
    {
        return DB::table('analytics_events')->where('name', $name)
            ->where('created_at', '>=', now()->subDays($days))->get(['user_id', 'props']);
    }

    private function opens(): array
    {
        $opens = $this->events('app_open')->map(fn ($e) => json_decode((string) $e->props, true) ?: []);
        $count = fn (string $key) => $opens->countBy(fn ($p) => (string) ($p[$key] ?? 'unknown'))->sortDesc()->all();

        return [
            'total' => $opens->count(),
            'people' => $this->events('app_open')->pluck('user_id')->unique()->count(),
            'source' => $count('source'),
            'device' => $count('device'),
            'os' => $count('os'),
            'installed' => $opens->count() ? (int) round(100 * $opens->where('installed', true)->count() / $opens->count()) : null,
        ];
    }

    private function push(): array
    {
        $sent = $this->events('push_sent')->map(fn ($e) => json_decode((string) $e->props, true)['type'] ?? 'other');
        $opened = $this->events('app_open')->filter(fn ($e) => (json_decode((string) $e->props, true)['source'] ?? null) === 'push')->count();

        return [
            'sent' => $sent->count(),
            'by_type' => $sent->countBy()->sortDesc()->all(),
            'opened' => $opened,
            'open_rate' => $sent->count() ? (int) round(100 * $opened / $sent->count()) : null,
        ];
    }

    /** @return list<array{name: string, count: int, people: int}> */
    private function features(): array
    {
        return DB::table('analytics_events')
            ->where('created_at', '>=', now()->subDays(30))
            ->whereNotIn('name', ['app_open', 'push_sent'])
            ->selectRaw('name, count(*) as c, count(distinct user_id) as p')
            ->groupBy('name')->orderByDesc('c')->get()
            ->map(fn ($r) => ['name' => $r->name, 'count' => (int) $r->c, 'people' => (int) $r->p])->all();
    }

    /** Survey answers are shown without names. / แสดงคำตอบแบบไม่ระบุชื่อ */
    private function survey(): array
    {
        $all = SurveyResponse::where('survey', SurveyResponse::DAY14)->latest('created_at')->get();
        $scored = $all->whereNotNull('score');

        return [
            'responses' => $scored->count(),
            'dismissed' => $all->whereNull('score')->count(),
            'average' => $scored->count() ? round($scored->avg('score'), 1) : null,
            'scores' => collect(range(1, 5))->mapWithKeys(fn ($n) => [$n => $scored->where('score', $n)->count()])->all(),
            'comments' => $scored->filter(fn ($r) => $r->liked || $r->change)->take(30)
                ->map(fn ($r) => ['score' => $r->score, 'liked' => $r->liked, 'change' => $r->change, 'at' => $r->created_at?->toDateString()])->values()->all(),
        ];
    }
}
