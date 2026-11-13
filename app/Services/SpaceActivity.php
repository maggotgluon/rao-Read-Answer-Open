<?php

namespace App\Services;

use App\Models\Answer;
use App\Models\Moment;
use App\Models\Space;
use App\Models\SpaceEvent;
use App\Models\User;

/**
 * "What happened lately" — last 7 days, both partners. Never includes answer text
 * or drafts; it only says THAT something happened.
 * ความเคลื่อนไหว 7 วันล่าสุด ไม่แสดงเนื้อหาคำตอบหรือร่าง
 */
class SpaceActivity
{
    public const DAYS = 7;

    public const LIMIT = 20;

    /** @return list<array<string, mixed>> */
    public function recent(Space $space, User $viewer): array
    {
        $since = now()->subDays(self::DAYS);
        $names = $space->members()->pluck('name', 'users.id');
        $who = fn (int $id) => ['actor' => $names[$id] ?? '?', 'mine' => $id === $viewer->id];

        $answers = Answer::query()
            ->whereHas('dailyPrompt', fn ($q) => $q->where('space_id', $space->id))
            ->where('created_at', '>=', $since)
            ->with('dailyPrompt.prompt:id,kind')->get()
            ->map(fn (Answer $a) => [
                ...$who($a->user_id),
                'type' => $a->dailyPrompt->prompt->kind === 'quest' ? 'quest_done' : 'answered',
                'at' => $a->created_at,
            ]);

        $moments = $space->moments()->posted()->where('posted_at', '>=', $since)->get()
            ->map(fn (Moment $m) => [...$who($m->user_id), 'type' => 'moment', 'at' => $m->posted_at]);

        $events = $space->events()->where('created_at', '>=', $since)->whereNotNull('created_by')->get()
            ->map(fn (SpaceEvent $e) => [...$who($e->created_by), 'type' => 'event', 'title' => $e->title, 'at' => $e->created_at]);

        return $answers->concat($moments)->concat($events)
            ->sortByDesc('at')->take(self::LIMIT)
            ->map(fn ($i) => [...$i, 'at' => $i['at']->toIso8601String()])
            ->values()->all();
    }
}
