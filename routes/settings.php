<?php

use App\Http\Controllers\Settings\LocationController;
use App\Http\Controllers\Settings\NotificationController;
use App\Http\Controllers\Settings\PrivacyController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\PushSubscriptionController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Controllers\Settings\ThemeController;
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Delete = scheduled after a grace period (see PrivacyController). / ลบแบบมีเวลา 7 วัน
    Route::delete('settings/profile', [PrivacyController::class, 'destroy'])->name('profile.destroy');
    Route::get('settings/privacy', [PrivacyController::class, 'edit'])->name('privacy.edit');
    Route::put('settings/privacy/analytics', [PrivacyController::class, 'analytics'])->name('privacy.analytics');
    Route::get('settings/privacy/export', [PrivacyController::class, 'export'])->middleware('throttle:3,10')->name('privacy.export');

    Route::get('settings/security', [SecurityController::class, 'edit'])
        ->middleware(RequirePassword::class)
        ->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/appearance', [ThemeController::class, 'edit'])->name('appearance.edit');

    Route::get('settings/notifications', [NotificationController::class, 'edit'])->name('notifications.edit');
    Route::put('settings/notifications', [NotificationController::class, 'update'])->name('notifications.update');
    Route::post('settings/push-subscriptions', [PushSubscriptionController::class, 'store'])->name('push.subscribe');
    Route::delete('settings/push-subscriptions', [PushSubscriptionController::class, 'destroy'])->name('push.unsubscribe');
    Route::put('settings/location', [LocationController::class, 'toggle'])->name('location.toggle');
    Route::put('settings/location/history', [LocationController::class, 'history'])->name('location.history');
    Route::post('location', [LocationController::class, 'update'])->middleware('throttle:20,1')->name('location.update');
    Route::post('settings/push-test', [PushSubscriptionController::class, 'test'])->middleware('throttle:5,1')->name('push.test');
});

// Theme works for guests too (cookie). / ธีมใช้ได้แม้ยังไม่ล็อกอิน
Route::put('settings/theme', [ThemeController::class, 'update'])->name('theme.update');

Route::get('.well-known/passkey-endpoints', function () {
    return response()->json([
        'enroll' => route('security.edit'),
        'manage' => route('security.edit'),
    ]);
})->name('well-known.passkeys');
