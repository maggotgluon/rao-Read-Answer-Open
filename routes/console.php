<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
 * Every minute, either `php artisan schedule:run` (cron) or, on hosts without artisan,
 * a Plesk "Fetch a URL" task on /_ops/schedule (see docs/deploy.md). Tasks are closures
 * so they run inside the same PHP process (no exec / new php binary needed).
 * ทุกนาที: cron เรียก schedule:run หรือโฮสต์ที่รัน artisan ไม่ได้ให้ Plesk เรียก URL /_ops/schedule
 * งานเป็น closure จึงรันใน process เดียวกัน ไม่ต้องเรียก php ใหม่
 */
$task = fn (string $command, array $args = []) => fn () => Artisan::call($command, $args);

Schedule::call($task('spaces:purge'))->name('spaces:purge')->dailyAt('03:00');
Schedule::call($task('accounts:purge'))->name('accounts:purge')->dailyAt('03:15');
Schedule::call($task('prompts:assign'))->name('prompts:assign')->hourly();
Schedule::call($task('push:daily'))->name('push:daily')->everyFiveMinutes()->withoutOverlapping(10);
// Short so a web request finishes within the host's time limit. / สั้นพอให้ไม่เกินเวลาของโฮสต์
Schedule::call($task('queue:work', ['--stop-when-empty' => true, '--max-time' => 20]))
    ->name('queue:work')->everyMinute()->withoutOverlapping(5);
