<?php

namespace App\Services;

use App\Models\Achievement;
use App\Models\Space;
use App\Models\User;
use App\Support\Features;
use Illuminate\Database\UniqueConstraintViolationException;

/**
 * Milestone stamps. Checked after a letter, postcard or place, and hourly for day counts.
 * Stored when earned and never taken away; there are no "lost" or "missed" badges.
 * แสตมป์ความสำเร็จ ตรวจหลังเขียนจดหมาย โพสต์ หรือเพิ่มสถานที่ และทุกชั่วโมง ได้แล้วไม่ริบคืน
 *
 * Key = "<group>_<n>" (streak_7, letters_50, years_2…) or "first_<thing>".
 */
class Achievements
{
    /** group => thresholds, in the order they're shown / ลำดับที่แสดง */
    public const LADDERS = [
        'streak' => [7, 30, 100, 365],
        'letters' => [10, 50, 100, 365],
        'postcards' => [10, 50, 100],
        'days' => [100, 365, 1000],
    ];

    public const FIRSTS = ['first_letter', 'first_postcard', 'first_place'];

    public function __construct(private DailyPrompts $prompts, private Push $push) {}

    /**
     * Award everything the space has reached and tell both members once (a single push even
     * when several arrive together). Returns the new keys.
     * มอบแสตมป์ที่ถึงเกณฑ์ และแจ้งเตือนครั้งเดียว
     *
     * @return list<string>
     */
    public function check(Space $space, bool $notify = true): array
    {
        if ($space->isFrozen() || ! Features::on('achievements', $space) || ! $this->prompts->pairedOn($space)) {
            return [];
        }

        $have = $space->achievements()->pluck('key')->flip();
        $new = [];
        foreach ($this->reached($space) as $key) {
            if ($have->has($key)) {
                continue;
            }
            try {
                $space->achievements()->create(['key' => $key, 'earned_at' => now(), 'seen_by' => []]);
                $new[] = $key;
            } catch (UniqueConstraintViolationException) {
                // earned at the same moment by the partner's request / อีกฝ่ายได้พร้อมกัน
            }
        }

        if ($new && $notify) {
            foreach ($space->members()->get() as $member) {
                $this->push->notify($member, 'achievements', 'achievement', ['count' => count($new)], route('spaces.show', $space), $space);
            }
        }

        return $new;
    }

    /** @return list<string> every key the space qualifies for right now */
    public function reached(Space $space): array
    {
        $streak = $this->prompts->streak($space);
        $values = [
            'streak' => $streak['count'],
            'letters' => $streak['together_total'],
            'postcards' => $space->moments()->posted()->count(),
            'days' => $this->daysTogether($space),
        ];

        $keys = [];
        foreach (self::LADDERS as $group => $steps) {
            foreach ($steps as $n) {
                if ($values[$group] >= $n) {
                    $keys[] = "{$group}_{$n}";
                }
            }
        }
        if ($values['letters'] >= 1) {
            $keys[] = 'first_letter';
        }
        if ($values['postcards'] >= 1) {
            $keys[] = 'first_postcard';
        }
        if ($space->places()->exists()) {
            $keys[] = 'first_place';
        }
        // One stamp per anniversary year. / หนึ่งดวงต่อการครบรอบหนึ่งปี
        $anniversary = $space->anniversary()?->date;
        if ($anniversary) {
            $years = (int) $anniversary->copy()->startOfDay()->diffInYears($space->today(), true);
            for ($y = 1; $y <= min($years, 100); $y++) {
                $keys[] = "years_{$y}";
            }
        }

        return $keys;
    }

    /**
     * For the stamp sheet: earned stamps (newest first) and the next few to aim for.
     * แสตมป์ที่ได้แล้ว และเป้าหมายถัดไป
     *
     * @return array<string, mixed>
     */
    public function sheet(Space $space, User $viewer): array
    {
        $earned = $space->achievements()->orderByDesc('earned_at')->orderByDesc('id')->get();
        $streak = $this->prompts->streak($space);
        $values = [
            'streak' => $streak['count'],
            'letters' => $streak['together_total'],
            'postcards' => $space->moments()->posted()->count(),
            'days' => $this->daysTogether($space),
        ];
        $have = $earned->pluck('key')->flip();

        $next = [];
        foreach (self::LADDERS as $group => $steps) {
            foreach ($steps as $n) {
                if (! $have->has("{$group}_{$n}")) {
                    $next[] = ['key' => "{$group}_{$n}", 'group' => $group, 'n' => $n, 'have' => min($values[$group], $n)];
                    break;   // only the next step of each ladder / เฉพาะขั้นถัดไป
                }
            }
        }

        return [
            'earned' => $earned->map(fn (Achievement $a) => [
                ...self::describe($a->key),
                'earned_at' => $a->earned_at->toIso8601String(),
                'new' => ! $a->seenBy($viewer),
            ])->values()->all(),
            'next' => $next,
        ];
    }

    /** Mark everything in this space as seen by the viewer. / ดูแล้ว */
    public function markSeen(Space $space, User $user): void
    {
        $space->achievements()->get()->each(function (Achievement $a) use ($user) {
            if (! $a->seenBy($user)) {
                $a->update(['seen_by' => [...($a->seen_by ?? []), $user->id]]);
            }
        });
    }

    /** @return array{key: string, group: string, n: int|null} */
    public static function describe(string $key): array
    {
        if (str_starts_with($key, 'first_')) {
            return ['key' => $key, 'group' => 'first', 'n' => null];
        }
        [$group, $n] = explode('_', $key, 2);

        return ['key' => $key, 'group' => $group, 'n' => (int) $n];
    }

    private function daysTogether(Space $space): int
    {
        $paired = $this->prompts->pairedOn($space);

        return $paired ? (int) $paired->diffInDays($space->today(), true) + 1 : 0;
    }
}
