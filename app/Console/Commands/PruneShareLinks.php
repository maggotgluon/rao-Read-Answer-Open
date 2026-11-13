<?php

namespace App\Console\Commands;

use App\Models\ShareLink;
use App\Services\Shareables;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

/**
 * Daily: delete pictures of expired links and of links whose postcard/letter/space is gone,
 * pictures left without a row (deleted account), and old turned-off rows.
 * ลบรูปของลิงก์ที่หมดอายุ/ถูกลบ และแถวเก่าที่ปิดแล้ว
 */
class PruneShareLinks extends Command
{
    protected $signature = 'share:prune';

    protected $description = 'Delete expired or orphaned share-card pictures';

    public const KEEP_OFF_DAYS = 90;

    public function handle(Shareables $shareables): int
    {
        $disk = Storage::disk(ShareLink::DISK);
        $n = 0;

        ShareLink::whereNull('revoked_at')->with('space')->each(function (ShareLink $l) use ($shareables, &$n) {
            $gone = ! $l->space || ! $shareables->find($l->space, $l->item_type, $l->item_id);
            if ($gone || ! $l->isLive()) {
                $l->revoke();
                $n++;
            }
        });

        $known = ShareLink::whereNull('revoked_at')->pluck('path')->flip();
        foreach ($disk->files('share-cards') as $file) {
            if (! $known->has($file)) {
                $disk->delete($file);
            }
        }

        ShareLink::whereNotNull('revoked_at')->where('revoked_at', '<', now()->subDays(self::KEEP_OFF_DAYS))->delete();
        $this->info("Turned off {$n} link(s).");

        return self::SUCCESS;
    }
}
