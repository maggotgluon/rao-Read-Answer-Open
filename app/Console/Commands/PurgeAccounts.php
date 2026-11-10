<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\AccountData;
use App\Services\Analytics;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class PurgeAccounts extends Command
{
    protected $signature = 'accounts:purge';

    protected $description = 'Delete accounts past their grace period + expire old analytics / ลบบัญชีที่ครบกำหนด และข้อมูล analytics เก่า';

    public function handle(AccountData $data): int
    {
        $count = 0;
        User::whereNotNull('delete_at')->where('delete_at', '<=', now())->each(function (User $user) use ($data, &$count) {
            $data->purge($user);
            $count++;
        });

        $old = now()->subMonths(Analytics::KEEP_MONTHS);
        $events = DB::table('analytics_events')->where('created_at', '<', $old)->delete();
        DB::table('activity_days')->where('date', '<', $old->toDateString())->delete();

        $this->info("Deleted {$count} account(s), {$events} old event(s).");

        return self::SUCCESS;
    }
}
