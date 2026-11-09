<?php

namespace App\Console\Commands;

use App\Models\Space;
use App\Services\DailyPrompts;
use Illuminate\Console\Command;

/**
 * Pre-assigns today's prompt for every active, paired space (pages also assign lazily).
 * Runs hourly so each timezone gets its prompt soon after local midnight;
 * later this is where the morning push notification hooks in.
 * กำหนดคำถาม/ภารกิจของวันนี้ล่วงหน้าให้ทุก space (ทำทุกชั่วโมง)
 */
class AssignDailyPrompts extends Command
{
    protected $signature = 'prompts:assign';

    protected $description = 'Assign today\'s question/quest to every active paired space';

    public function handle(DailyPrompts $prompts): int
    {
        $count = 0;

        Space::active()->has('members', '>=', Space::MAX_MEMBERS)->each(function (Space $space) use ($prompts, &$count) {
            if ($prompts->forDate($space, $space->today())) {
                $count++;
            }
        });

        $this->info("Assigned/checked {$count} space(s).");

        return self::SUCCESS;
    }
}
