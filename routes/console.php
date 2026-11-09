<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Shared hosting: Plesk runs `php artisan schedule:run` every minute.
// โฮสต์ใช้ cron ของ Plesk เรียก schedule:run ทุกนาที
Schedule::command('spaces:purge')->dailyAt('03:00');
Schedule::command('prompts:assign')->hourly();
Schedule::command('queue:work --stop-when-empty --max-time=50')->everyMinute()->withoutOverlapping();
