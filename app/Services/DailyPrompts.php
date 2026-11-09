<?php

namespace App\Services;

use App\Models\DailyPrompt;
use App\Models\Prompt;
use App\Models\Space;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

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
 */
class DailyPrompts
{
    public const FREEZES_PER_WEEK = 2;

    public function kindFor(Carbon $date): string
    {
        return $date->isWeekend() ? Prompt::KIND_QUEST : Prompt::KIND_QUESTION;
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

    /** Get (or assign) the prompt for a local date. Null when nothing is available. */
    public function forDate(Space $space, Carbon $date): ?DailyPrompt
    {
        $dateString = $date->toDateString();

        $existing = $space->dailyPrompts()->whereDate('date', $dateString)->first();
        if ($existing) {
            return $existing;
        }

        $prompt = $this->pick($space, $this->kindFor($date));
        if (! $prompt) {
            return null;
        }

        try {
            return $space->dailyPrompts()->create(['prompt_id' => $prompt->id, 'date' => $dateString]);
        } catch (UniqueConstraintViolationException) {
            // Both partners opened the app at the same moment — use the one that won.
            return $space->dailyPrompts()->whereDate('date', $dateString)->first();
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
            }
        }

        return (new EloquentCollection($days->all()))
            ->each(fn (DailyPrompt $d) => $d->setRelation('space', $space))
            ->load(['prompt.author:id,name', 'answers']);
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

        $complete = $space->dailyPrompts()
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
        ];
    }

    private function pick(Space $space, string $kind): ?Prompt
    {
        $used = $space->dailyPrompts()->select('prompt_id');
        $other = $kind === Prompt::KIND_QUEST ? Prompt::KIND_QUESTION : Prompt::KIND_QUEST;

        foreach ([$kind, $other] as $k) {
            $custom = $space->customPrompts()->where('kind', $k)->where('active', true)
                ->whereNotIn('id', $used)->oldest('id')->first();
            if ($custom) {
                return $custom;
            }

            $library = Prompt::library()->where('kind', $k)->whereNotIn('id', $used)->inRandomOrder()->first();
            if ($library) {
                return $library;
            }
        }

        return null;
    }
}
