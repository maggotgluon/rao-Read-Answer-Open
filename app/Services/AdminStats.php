<?php

namespace App\Services;

use App\Models\Answer;
use App\Models\DailyPrompt;
use App\Models\Moment;
use App\Models\Prompt;
use App\Models\PushSubscription;
use App\Models\Space;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Site numbers for the admin dashboard — counts and trends ONLY. Never answers, moments,
 * photos or locations. / ตัวเลขสถิติเท่านั้น ไม่มีเนื้อหาส่วนตัว
 */
class AdminStats
{
    public function __construct(private DailyPrompts $prompts) {}

    /** @return array<string, mixed> */
    public function overview(): array
    {
        $tz = 'Asia/Bangkok';
        $today = Carbon::now($tz)->startOfDay();
        $users = User::count();

        $spaces = Space::withCount('members')->get(['id', 'status', 'premium', 'long_distance', 'timezone']);
        $paired = $spaces->where('status', Space::STATUS_ACTIVE)->where('members_count', '>=', Space::MAX_MEMBERS);

        $active = fn (int $days) => DB::table('activity_days')
            ->where('date', '>', $today->copy()->subDays($days)->toDateString())->distinct()->count('user_id');

        // Main prompts of the last 7 finished days in paired spaces: how many both answered.
        $recent = DailyPrompt::where('slot', DailyPrompt::MAIN)
            ->whereIn('space_id', $paired->pluck('id'))
            ->whereBetween('date', [$today->copy()->subDays(7)->toDateString(), $today->copy()->subDay()->toDateString()])
            ->withCount('answers')->get();

        $streaks = $paired->take(500)->map(fn (Space $s) => $this->prompts->streak($s)['count']);

        return [
            'users' => [
                'total' => $users,
                'new_7d' => User::where('created_at', '>=', now()->subDays(7))->count(),
                'dau' => $active(1),
                'wau' => $active(7),
                'mau' => $active(30),
                'push_on' => PushSubscription::distinct()->count('user_id'),
                'location_on' => User::where('share_location', true)->count(),
            ],
            'spaces' => [
                'paired' => $paired->count(),
                'waiting' => $spaces->where('status', Space::STATUS_ACTIVE)->where('members_count', '<', Space::MAX_MEMBERS)->count(),
                'frozen' => $spaces->where('status', Space::STATUS_FROZEN)->count(),
                'long_distance' => $paired->where('long_distance', true)->count(),
                'premium' => $spaces->where('premium', true)->count(),
            ],
            'engagement' => [
                'answer_rate_7d' => $recent->count() ? (int) round(100 * $recent->where('answers_count', '>=', 2)->count() / $recent->count()) : null,
                'avg_streak' => $streaks->count() ? round($streaks->avg(), 1) : null,
                'best_streak' => (int) ($streaks->max() ?? 0),
                'answers_7d' => Answer::where('created_at', '>=', now()->subDays(7))->count(),
                'moments_7d' => Moment::posted()->where('posted_at', '>=', now()->subDays(7))->count(),
            ],
            'series' => $this->series($today),
            'prompts' => $this->promptRanking(),
        ];
    }

    /**
     * Last 30 days: active people, answers, moments per day.
     *
     * @return list<array{date: string, active: int, answers: int, moments: int}>
     */
    private function series(Carbon $today): array
    {
        $from = $today->copy()->subDays(29);
        $utcFrom = $from->copy()->setTimezone('UTC');

        $active = DB::table('activity_days')->where('date', '>=', $from->toDateString())
            ->selectRaw('date, count(*) as n')->groupBy('date')->pluck('n', 'date');
        $bucket = fn ($rows) => $rows->map(fn ($at) => Carbon::parse($at)->setTimezone('Asia/Bangkok')->toDateString())->countBy();
        $answers = $bucket(Answer::where('created_at', '>=', $utcFrom)->pluck('created_at'));
        $moments = $bucket(Moment::posted()->where('posted_at', '>=', $utcFrom)->pluck('posted_at'));

        $out = [];
        for ($d = $from->copy(); $d->lte($today); $d->addDay()) {
            $k = $d->toDateString();
            $out[] = ['date' => $k, 'active' => (int) ($active[$k] ?? 0), 'answers' => $answers[$k] ?? 0, 'moments' => $moments[$k] ?? 0];
        }

        return $out;
    }

    /**
     * Library prompts by 👍/👎 (best and worst). Ratings only — no answers.
     *
     * @return array{best: list<array<string, mixed>>, worst: list<array<string, mixed>>, total_ratings: int}
     */
    private function promptRanking(): array
    {
        $rows = DB::table('prompt_ratings')
            ->join('daily_prompts', 'daily_prompts.id', '=', 'prompt_ratings.daily_prompt_id')
            ->join('prompts', 'prompts.id', '=', 'daily_prompts.prompt_id')
            ->whereNull('prompts.space_id')
            ->groupBy('prompts.id')
            ->selectRaw('prompts.id, sum(case when value > 0 then 1 else 0 end) as up, sum(case when value < 0 then 1 else 0 end) as down')
            ->get();

        $ids = $rows->pluck('id');
        $texts = Prompt::whereIn('id', $ids)->get(['id', 'key', 'kind', 'text_th', 'text_en'])->keyBy('id');
        $list = $rows->map(fn ($r) => [
            'id' => $r->id,
            'key' => $texts[$r->id]->key ?? null,
            'kind' => $texts[$r->id]->kind ?? null,
            'text' => $texts[$r->id]?->textFor(app()->getLocale()),
            'up' => (int) $r->up,
            'down' => (int) $r->down,
            'score' => (int) $r->up - (int) $r->down,
        ]);

        return [
            'best' => $list->sortByDesc('score')->take(5)->values()->all(),
            'worst' => $list->where('down', '>', 0)->sortBy('score')->take(5)->values()->all(),
            'total_ratings' => (int) $rows->sum(fn ($r) => $r->up + $r->down),
        ];
    }
}
