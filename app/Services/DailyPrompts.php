<?php

namespace App\Services;

use App\Models\DailyPrompt;
use App\Models\Prompt;
use App\Models\ScheduledPrompt;
use App\Models\Space;
use App\Models\User;
use App\Support\Features;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * The "Today" card: one question or quest per space per local day.
 * การ์ด "วันนี้": คำถามหรือภารกิจวันละ 1 อันต่อ space ตามเวลาท้องถิ่น
 *
 * Rules / กฎ:
 *  - Weekdays = question, Sat/Sun = quest. / วันธรรมดา = คำถาม, เสาร์-อาทิตย์ = ภารกิจ
 *  - Couple-written prompts go first, then random library items; never repeats in a space.
 *  - Days start once the space has 2 members (no prompts while waiting for a partner).
 *  - Answer window: the day itself + 6 earlier days.
 *  - Partner's answer is hidden until you answer; you can edit until they answer.
 *  - Admin-scheduled prompt for a date becomes the day's prompt. If the couple queued their
 *    own, theirs stays the main one and the admin's shows as a BONUS (no streak effect).
 *  - Long-distance mode: no "together" prompts, "apart" ones mixed in. Normal: no "apart".
 *  - Feature switches: quests off → questions every day; couple prompts off → library only.
 *  ของแอดมินเป็นคำถามของวัน ถ้าคู่มีคำถามของตัวเองจะเป็นโบนัส / โหมดไกลกันเลือกคำถามที่ทำได้แม้อยู่ไกล
 */
class DailyPrompts
{
    public const FREEZES_PER_WEEK = 2;

    public function kindFor(Carbon $date, ?Space $space = null): string
    {
        $quests = $space ? Features::on('quests', $space) : true;

        return $date->isWeekend() && $quests ? Prompt::KIND_QUEST : Prompt::KIND_QUESTION;
    }

    public function longDistance(Space $space): bool
    {
        return $space->long_distance && Features::on('location', $space);
    }

    /** When the couple became a couple in this space (local date), or null if still solo. */
    public function pairedOn(Space $space): ?Carbon
    {
        $members = $space->members()->get();

        if ($members->count() < Space::MAX_MEMBERS) {
            return null;
        }

        $joined = $members->map(fn ($m) => Carbon::parse($m->pivot->joined_at))->max();

        return $joined->setTimezone($space->timezone)->startOfDay();
    }

    /** Get (or assign) the day's main prompt for a local date. Null when nothing is available. */
    public function forDate(Space $space, Carbon $date): ?DailyPrompt
    {
        $dateString = $date->toDateString();

        $existing = $space->dailyPrompts()->where('slot', DailyPrompt::MAIN)->whereDate('date', $dateString)->first();
        if ($existing) {
            return $existing;
        }

        $kind = $this->kindFor($date, $space);
        $prompt = $this->custom($space, $kind)
            ?? $this->scheduled($space, $date)
            ?? $this->pick($space, $kind);
        if (! $prompt) {
            return null;
        }

        return $this->assign($space, $prompt, $dateString, DailyPrompt::MAIN);
    }

    /** The admin's scheduled prompt as a bonus, when the couple's own took the main slot. */
    public function bonusFor(Space $space, Carbon $date, DailyPrompt $main): ?DailyPrompt
    {
        $dateString = $date->toDateString();

        $existing = $space->dailyPrompts()->where('slot', DailyPrompt::BONUS)->whereDate('date', $dateString)->first();
        if ($existing) {
            return $existing;
        }

        $scheduled = $this->scheduled($space, $date);
        if (! $scheduled || $scheduled->id === $main->prompt_id) {
            return null;
        }

        return $this->assign($space, $scheduled, $dateString, DailyPrompt::BONUS);
    }

    private function assign(Space $space, Prompt $prompt, string $date, string $slot): ?DailyPrompt
    {
        try {
            return $space->dailyPrompts()->create(['prompt_id' => $prompt->id, 'date' => $date, 'slot' => $slot]);
        } catch (UniqueConstraintViolationException) {
            // Both partners opened the app at the same moment — use the one that won.
            return $space->dailyPrompts()->where('slot', $slot)->whereDate('date', $date)->first();
        }
    }

    /**
     * The answerable window, newest first (today … 6 days ago), never before pairing.
     *
     * @return Collection<int, DailyPrompt>
     */
    public function window(Space $space): Collection
    {
        $pairedOn = $this->pairedOn($space);
        if (! $pairedOn) {
            return collect();
        }

        $today = $space->today();
        $days = collect();

        for ($i = 0; $i <= DailyPrompt::LATE_DAYS; $i++) {
            $date = $today->copy()->subDays($i);
            if ($date->lt($pairedOn)) {
                break;
            }
            if ($daily = $this->forDate($space, $date)) {
                $days->push($daily);
                if ($bonus = $this->bonusFor($space, $date, $daily)) {
                    $days->push($bonus);
                }
            }
        }

        return (new EloquentCollection($days->all()))
            ->each(fn (DailyPrompt $d) => $d->setRelation('space', $space))
            ->load(['prompt.author:id,name', 'answers', 'ratings', 'replies']);
    }

    /**
     * Streak = consecutive days you BOTH answered. Up to 2 missed days per week are
     * forgiven ("freezes"). Today doesn't break it while it's still in progress.
     * สตรีค = จำนวนวันติดกันที่ตอบทั้งคู่ พลาดได้ 2 วัน/สัปดาห์โดยไม่ขาด
     *
     * @return array{count: int, freezes_left: int, together_total: int}
     */
    public function streak(Space $space): array
    {
        $pairedOn = $this->pairedOn($space);
        $empty = ['count' => 0, 'freezes_left' => self::FREEZES_PER_WEEK, 'together_total' => 0];
        if (! $pairedOn) {
            return $empty;
        }

        $complete = $space->dailyPrompts()->where('slot', DailyPrompt::MAIN)
            ->has('answers', '>=', Space::MAX_MEMBERS)
            ->pluck('date')
            ->map(fn ($d) => Carbon::parse($d)->toDateString())
            ->flip();

        $today = $space->today();
        $count = 0;
        $used = [];      // ISO week => freezes that sit between counted days
        $pending = [];   // freezes not yet "confirmed" by an older counted day
        $date = $today->copy();

        while ($date->gte($pairedOn)) {
            $week = $date->format('o-W');

            if ($complete->has($date->toDateString())) {
                $count++;
                foreach ($pending as $w => $n) {
                    $used[$w] = ($used[$w] ?? 0) + $n;
                }
                $pending = [];
            } elseif (! $date->equalTo($today)) {
                if (($used[$week] ?? 0) + ($pending[$week] ?? 0) >= self::FREEZES_PER_WEEK) {
                    break;
                }
                $pending[$week] = ($pending[$week] ?? 0) + 1;
            }

            $date->subDay();
        }

        return [
            'count' => $count,
            'freezes_left' => max(0, self::FREEZES_PER_WEEK - ($used[$today->format('o-W')] ?? 0)),
            'together_total' => $complete->count(),
        ];
    }

    /**
     * What the viewer may see. The partner's answer is only included once the viewer answered.
     * สิ่งที่ผู้ดูเห็นได้ คำตอบของอีกฝ่ายจะส่งมาเมื่อผู้ดูตอบแล้วเท่านั้น
     *
     * @return array<string, mixed>
     */
    public function present(DailyPrompt $daily, User $viewer, string $locale): array
    {
        $mine = $daily->answers->firstWhere('user_id', $viewer->id);
        $theirs = $daily->answers->first(fn ($a) => $a->user_id !== $viewer->id);
        $open = $daily->isOpen();
        // Only couple-written prompts show an author (admin-added library prompts don't).
        $author = $daily->prompt->space_id ? $daily->prompt->author : null;

        return [
            'id' => $daily->id,
            'date' => $daily->date->toDateString(),
            'is_today' => $daily->date->toDateString() === $daily->space->today()->toDateString(),
            'kind' => $daily->prompt->kind,
            'tag' => $daily->prompt->tag,
            'text' => $daily->prompt->textFor($locale),
            'written_by' => $author?->name,
            'open' => $open,
            'mine' => $mine ? ['body' => $mine->body, 'updated_at' => $mine->updated_at?->toIso8601String()] : null,
            'partner_answered' => (bool) $theirs,
            'partner' => $mine && $theirs ? ['body' => $theirs->body] : null,
            'can_edit' => $open && ! $theirs,
            'bonus' => $daily->slot === DailyPrompt::BONUS,
            // Only my own rating, never the partner's. / เฉพาะคะแนนของฉัน
            'my_rating' => (int) ($daily->ratings->firstWhere('user_id', $viewer->id)?->value ?? 0),
            // Replies only exist once both letters are open. / ตอบกลับได้เมื่อเปิดทั้งคู่แล้ว
            'replies' => $mine && $theirs ? $daily->replies->map(fn ($r) => [
                'id' => $r->id, 'mine' => $r->user_id === $viewer->id, 'body' => $r->body,
                'at' => $r->created_at?->toIso8601String(),
            ])->values()->all() : [],
            // Already reminded the partner today? / เตือนไปแล้ววันนี้หรือยัง
            'nudged' => $mine && ! $theirs && $daily->date->isSameDay($daily->space->today())
                && DB::table('push_logs')->where(['user_id' => $viewer->id, 'space_id' => $daily->space_id, 'kind' => 'nudge', 'ref' => $daily->date->toDateString()])->exists(),
        ];
    }

    /** The couple's own next queued prompt (if that feature is on). */
    private function custom(Space $space, string $kind): ?Prompt
    {
        if (! Features::on('custom_prompts', $space)) {
            return null;
        }

        $used = $space->dailyPrompts()->select('prompt_id');

        return $space->customPrompts()->where('kind', $kind)->where('active', true)
            ->whereNotIn('id', $used)->oldest('id')->first();
    }

    /** Admin's prompt for this date and couple (specific audience beats "all"), if not used yet. */
    private function scheduled(Space $space, Carbon $date): ?Prompt
    {
        $row = ScheduledPrompt::for($space, $date)->with('prompt')
            ->orderByRaw("case when audience = 'all' then 1 else 0 end")->first();
        $prompt = $row?->prompt;

        if (! $prompt || ! $prompt->active) {
            return null;
        }

        return $space->dailyPrompts()->where('prompt_id', $prompt->id)->exists() ? null : $prompt;
    }

    private function pick(Space $space, string $kind): ?Prompt
    {
        $used = $space->dailyPrompts()->select('prompt_id');
        // Saved for their date — never handed out early. / เก็บไว้ให้วันที่แอดมินกำหนด
        $reserved = ScheduledPrompt::query()->whereDate('date', '>=', $space->today()->toDateString())->select('prompt_id');
        $ld = $this->longDistance($space);
        $other = $kind === Prompt::KIND_QUEST ? Prompt::KIND_QUESTION : Prompt::KIND_QUEST;

        foreach ([$kind, $other] as $k) {
            if ($k === Prompt::KIND_QUEST && ! Features::on('quests', $space)) {
                continue;
            }

            $base = fn () => Prompt::library()->where('kind', $k)->fitting($ld)
                ->whereNotIn('id', $used)->whereNotIn('id', $reserved);

            // Long-distance: half the time try the "apart" set first. / โหมดไกลกัน: สุ่มชุดไกลกันก่อนครึ่งหนึ่ง
            if ($ld && random_int(0, 1) === 1 && ($apart = $base()->where('fit', 'apart')->inRandomOrder()->first())) {
                return $apart;
            }

            if ($library = $base()->inRandomOrder()->first()) {
                return $library;
            }
        }

        return null;
    }
}
