<?php

use App\Http\Controllers\Admin\PromptController as AdminPromptController;
use App\Http\Controllers\AnswerController;
use App\Http\Controllers\DevLoginController;
use App\Http\Controllers\InviteController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\MomentCommentController;
use App\Http\Controllers\MomentController;
use App\Http\Controllers\MomentDateController;
use App\Http\Controllers\MomentMediaController;
use App\Http\Controllers\MomentReactionController;
use App\Http\Controllers\PromptController;
use App\Http\Controllers\SpaceController;
use App\Http\Controllers\SpaceEventController;
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
    // scopeBindings: a {moment}/{dailyPrompt}/{media}/{comment} from another space → 404.
    Route::prefix('s/{space}')->middleware('space.member')->name('spaces.')->scopeBindings()->group(function () {
        Route::get('/', [SpaceController::class, 'show'])->name('show');
        Route::get('daily', [SpaceController::class, 'daily'])->name('daily');
        Route::get('moments', [SpaceController::class, 'moments'])->name('moments');
        Route::post('restore', [SpaceController::class, 'restore'])->name('restore');
        Route::get('moments/{moment}/media/{media}', [MomentMediaController::class, 'show'])->name('media.show');

        // Writes need an active (not frozen) space.
        Route::middleware('space.member:active')->group(function () {
            Route::patch('/', [SpaceController::class, 'update'])->name('update');
            Route::post('freeze', [SpaceController::class, 'freeze'])->name('freeze');
            Route::post('invite', [SpaceController::class, 'regenerateInvite'])->name('invite');

            Route::post('today/{dailyPrompt}/answer', [AnswerController::class, 'store'])->name('answers.store');
            Route::post('prompts', [PromptController::class, 'store'])->name('prompts.store');

            Route::post('events', [SpaceEventController::class, 'store'])->name('events.store');
            Route::patch('events/{event}', [SpaceEventController::class, 'update'])->name('events.update');
            Route::delete('events/{event}', [SpaceEventController::class, 'destroy'])->name('events.destroy');

            Route::post('moments', [MomentController::class, 'store'])
                ->middleware('throttle:30,1')->name('moments.store');
            Route::post('moments/{moment}/publish', [MomentController::class, 'publish'])->name('moments.publish');
            Route::delete('moments/{moment}', [MomentController::class, 'destroy'])->name('moments.destroy');
            Route::put('moments/{moment}/date', [MomentDateController::class, 'update'])->name('moments.date');
            Route::put('moments/{moment}/reaction', [MomentReactionController::class, 'update'])->name('reactions.update');
            Route::post('moments/{moment}/comments', [MomentCommentController::class, 'store'])->name('comments.store');
            Route::delete('moments/{moment}/comments/{comment}', [MomentCommentController::class, 'destroy'])->name('comments.destroy');
        });
    });
});

// Admin: prompt library. Non-admins get 404. / แอดมิน: คลังคำถาม
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('prompts', [AdminPromptController::class, 'index'])->name('prompts.index');
    Route::post('prompts', [AdminPromptController::class, 'store'])->name('prompts.store');
    Route::patch('prompts/{prompt}', [AdminPromptController::class, 'update'])->name('prompts.update');
    Route::delete('prompts/{prompt}', [AdminPromptController::class, 'destroy'])->name('prompts.destroy');
});

require __DIR__.'/settings.php';
