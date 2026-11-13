<?php

/*
 * Dev only: add the location/admin demo bits to an existing local DB without a reset.
 * php artisan tinker scripts/dev-demo-extras.php
 */

use App\Models\Prompt;
use App\Models\ScheduledPrompt;
use App\Models\SpecialDay;
use App\Models\User;

$mag = User::where('email', 'mag@rao.test')->firstOrFail();
User::where('email', 'partner@rao.test')->firstOrFail()->forceFill([
    'share_location' => true, 'loc_lat' => 18.8, 'loc_lng' => 99.0,
    'loc_city' => 'เชียงใหม่', 'loc_tz' => 'Asia/Bangkok', 'loc_at' => now(),
])->save();

SpecialDay::firstOrCreate(['title_en' => "Valentine's Day"], ['date' => '2026-02-14', 'emoji' => '💘', 'title_th' => 'วันวาเลนไทน์', 'repeats_yearly' => true]);

$today = now('Asia/Bangkok')->toDateString();
if (! ScheduledPrompt::whereDate('date', $today)->exists()) {
    $bonus = Prompt::create([
        'kind' => 'question', 'fit' => 'any', 'created_by' => $mag->id,
        'text_th' => 'ถ้าวันนี้เป็นวันพิเศษของเรา อยากฉลองแบบไหน?',
        'text_en' => 'If today were our special day, how would you celebrate?',
    ]);
    ScheduledPrompt::create(['date' => $today, 'prompt_id' => $bonus->id, 'audience' => 'all', 'created_by' => $mag->id]);
}
echo "demo extras ok\n";
