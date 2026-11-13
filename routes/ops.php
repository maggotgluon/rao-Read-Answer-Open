<?php

use App\Http\Controllers\OpsController;
use Illuminate\Support\Facades\Route;

// No session/cookies/CSRF: called by Plesk tasks and by hand. See OpsController.
// ไม่มี session/คุกกี้ ใช้เรียกจาก Plesk หรือเปิดเอง
Route::get('_ops/{action}', OpsController::class)
    ->whereIn('action', ['status', 'migrate', 'schedule', 'admin'])
    ->name('ops');
