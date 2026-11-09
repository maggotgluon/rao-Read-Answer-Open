<?php

use App\Http\Controllers\DevLoginController;
use App\Http\Controllers\InviteController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\SpaceController;
use App\Support\DevTools;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return auth()->check() ? redirect()->route('dashboard') : inertia('welcome');
})->name('home');

Route::post('locale', [LocaleController::class, 'update'])->name('locale.update');

Route::get('offline', fn () => inertia('offline'))->name('offline');

// Dev only: one-click demo login (controller also refuses outside local).
if (DevTools::enabled()) {
    Route::post('dev/login', DevLoginController::class)->middleware('guest')->name('dev.login');
}

// Invite links work for guests too (they sign up, then come back).
Route::get('join/{code}', [InviteController::class, 'show'])->name('invites.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [SpaceController::class, 'index'])->name('dashboard');

    Route::post('join', [InviteController::class, 'lookup'])->name('invites.lookup');
    Route::post('join/{code}', [InviteController::class, 'accept'])
        ->middleware('throttle:10,1')->name('invites.accept');

    Route::post('spaces', [SpaceController::class, 'store'])->name('spaces.store');

    // Everything below is behind the wall: members only (others get 404).
    Route::prefix('s/{space}')->middleware('space.member')->name('spaces.')->group(function () {
        Route::get('/', [SpaceController::class, 'show'])->name('show');
        Route::post('restore', [SpaceController::class, 'restore'])->name('restore');

        // Writes need an active (not frozen) space.
        Route::middleware('space.member:active')->group(function () {
            Route::patch('/', [SpaceController::class, 'update'])->name('update');
            Route::post('freeze', [SpaceController::class, 'freeze'])->name('freeze');
            Route::post('invite', [SpaceController::class, 'regenerateInvite'])->name('invite');
        });
    });
});

require __DIR__.'/settings.php';
