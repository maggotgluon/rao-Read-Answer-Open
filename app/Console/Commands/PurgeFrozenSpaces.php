<?php

namespace App\Console\Commands;

use App\Models\Space;
use App\Services\MomentPhotos;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class PurgeFrozenSpaces extends Command
{
    protected $signature = 'spaces:purge';

    protected $description = 'Permanently delete spaces frozen for 30+ days / ลบ space ที่แช่แข็งครบ 30 วัน';

    public function handle(): int
    {
        $count = 0;

        Space::dueForPurge()->each(function (Space $space) use (&$count) {
            $space->delete();
            Storage::disk(MomentPhotos::DISK)->deleteDirectory(MomentPhotos::folder($space));
            $count++;
        });

        $this->info("Purged {$count} space(s).");

        return self::SUCCESS;
    }
}
