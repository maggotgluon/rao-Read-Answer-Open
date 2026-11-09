<?php

namespace App\Console\Commands;

use App\Models\Space;
use App\Models\User;
use App\Services\DailyPrompts;
use App\Services\Push;
use App\Services\SpaceCalendar;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

/**
 * Runs every 5 minutes. For each person in each active, paired space (space timezone):
 *  - morning (their morning_at): "today's question/quest is here" + date reminders
 *    (tomorrow + today, incl. partner birthday; mentions memories)
 *  - evening (their evening_at): reminder ONLY if they haven't answered today
 * Each is sent once per day (push_logs). Late by > 3h (e.g. server was down) → skipped.
 *
 * ทุก 5 นาที: เช้า = คำถามวันนี้ + เตือนวันสำคัญ, เย็น = เตือนเฉพาะถ้ายังไม่ตอบ
 */
class SendDailyPushes extends Command
{
    protected $signature = 'push:daily';

    protected $description = 'Morning question + evening reminder + date reminders (each person\'s own times)';

    public const GRACE_MINUTES = 180;

    public function handle(DailyPrompts $prompts, SpaceCalendar $calendar, Push $push): int
    {
        $sent = 0;

        Space::active()->has('members', '>=', Space::MAX_MEMBERS)->with('members')->each(
            function (Space $space) use ($prompts, $calendar, $push, &$sent) {
                $now = Carbon::now($space->timezone);
                $today = $space->today();
                $daily = $prompts->forDate($space, $today);

                foreach ($space->members as $user) {
                    if ($this->due($now, $user->morning_at)) {
                        $sent += $this->morning($space, $user, $daily, $today, $calendar, $push);
                    }

                    if ($daily && $this->due($now, $user->evening_at)
                        && ! $daily->answers()->where('user_id', $user->id)->exists()) {
                        $sent += (int) $push->once($user, $space, 'evening', $today->toDateString(), fn () => $push->notify(
                            $user, 'evening', 'evening', [], route('spaces.daily', $space), $space,
                        ));
                    }
                }
            },
        );

        $this->info("Sent {$sent} push(es).");

        return self::SUCCESS;
    }

    private function due(Carbon $now, string $at): bool
    {
        [$h, $m] = array_map('intval', explode(':', $at));
        $slot = $now->copy()->setTime($h, $m);

        return $now->gte($slot) && $now->diffInMinutes($slot, true) <= self::GRACE_MINUTES;
    }

    private function morning(Space $space, User $user, $daily, Carbon $today, SpaceCalendar $calendar, Push $push): int
    {
        $count = 0;
        $locale = $user->locale ?: 'th';

        if ($daily) {
            $count += (int) $push->once($user, $space, 'morning', $today->toDateString(), fn () => $push->notify(
                $user, 'morning', $daily->prompt->kind === 'quest' ? 'morning_quest' : 'morning_question',
                ['text' => $daily->prompt->textFor($locale)], route('spaces.daily', $space), $space,
            ));
        }

        // Dates: today + tomorrow. Your own birthday isn't announced to you.
        foreach ([[$today, 'date_today'], [$today->copy()->addDay(), 'date_tomorrow']] as [$day, $key]) {
            foreach ($calendar->occurrences($space, $day, $day) as $o) {
                if ($o['kind'] === 'birthday' && $o['user_id'] === $user->id) {
                    continue;
                }
                $ref = $day->toDateString().':'.($o['event_id'] ?? 'u'.$o['user_id']);
                $count += (int) $push->once($user, $space, 'date', $ref, fn () => $push->notify(
                    $user, 'dates', $o['memories'] > 0 && $key === 'date_today' ? 'date_today_memories' : $key,
                    ['title' => $o['title'], 'count' => $o['memories']], route('spaces.show', $space), $space,
                ));
            }
        }

        return $count;
    }
}
