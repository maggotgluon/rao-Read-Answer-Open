<?php

namespace App\Console\Commands;

use App\Models\Space;
use Illuminate\Console\Command;

class PurgeFrozenSpaces extends Command
{
    protected $signature = 'spaces:purge';

    protected $description = 'Permanently delete spaces frozen for 30+ days / ลบ space ที่แช่แข็งครบ 30 วัน';

    public function handle(): int
    {
        $count = 0;

        Space::dueForPurge()->each(function (Space $space) use (&$count) {
            // TODO(weekend 2): delete the space's media files from disk too.
            $space->delete();
            $count++;
        });

        $this->info("Purged {$count} space(s).");

        return self::SUCCESS;
    }
}
