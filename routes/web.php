<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\FeatureController as AdminFeatureController;
use App\Http\Controllers\Admin\InsightsController as AdminInsightsController;
use App\Http\Controllers\Admin\PromptController as AdminPromptController;
use App\Http\Controllers\Admin\ScheduleController as AdminScheduleController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\AnswerController;
use App\Http\Controllers\ChangelogController;
use App\Http\Controllers\ConsentController;
use App\Http\Controllers\DevLoginController;
use App\Http\Controllers\InviteController;
use App\Http\Controllers\LegalController;
use App\Http\Controllers\LetterReplyController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\MomentCommentController;
use App\Http\Controllers\MomentController;
use App\Http\Controllers\PlaceController;
use App\Http\Controllers\ShareController;
use App\Http\Controllers\MomentDateController;
use App\Http\Controllers\MomentMediaController;
use App\Http\Controllers\MomentReactionController;
use App\Http\Controllers\MoodController;
use App\Http\Controllers\NudgeController;
use App\Http\Controllers\PromptController;
use App\Http\Controllers\RatingController;
use App\Http\Controllers\SpaceController;
use App\Http\Controllers\SpaceEventController;
use App\Http\Controllers\SurveyController;
use App\Support\DevTools;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return auth()->check() ? redirect()->route('dashboard') : inertia('welcome');
})->name('home');

Route::post('locale', [LocaleController::class, 'update'])->name('locale.update');

Route::get('offline', fn () => inertia('offline'))->name('offline');

// Legal pages (privacy, terms, cookies, data rights). / หน้าเอกสารกฎหมาย
Route::get('changelog', ChangelogController::class)->name('changelog');
Route::get('legal/{doc}', [LegalController::class, 'show'])
    ->whereIn('doc', LegalController::DOCS)->name('legal.show');

// Dev only: one-click demo login (controller also refuses outside local).
if (DevTools::enabled()) {
    Route::post('dev/login', DevLoginController::class)->middleware('guest')->name('dev.login');
}

// Public card links: the picture only, anyone with the link. / ลิงก์การ์ดสาธารณะ เห็นแค่รูป
Route::get('p/{token}', [ShareController::class, 'show'])->where('token', '[a-z0-9]{32}')->middleware('throttle:60,1')->name('share.show');
Route::get('p/{token}/card.png', [ShareController::class, 'image'])->where('token', '[a-z0-9]{32}')->middleware('throttle:120,1')->name('share.image');

// Invite links work for guests too (they sign up, then come back).
Route::get('join/{code}', [InviteController::class, 'show'])->name('invites.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('consent', [ConsentController::class, 'show'])->name('consent.show');
    Route::post('consent', [ConsentController::class, 'store'])->name('consent.store');
    Route::delete('consent', [ConsentController::class, 'withdraw'])->name('consent.withdraw');
});

// Everything with letters needs the sensitive-topics consent. / ทุกอย่างที่มีจดหมายต้องได้รับความยินยอมก่อน
Route::middleware(['auth', 'verified', 'consent'])->group(function () {
    Route::get('dashboard', [SpaceController::class, 'index'])->name('dashboard');

    Route::post('join', [InviteController::class, 'lookup'])->name('invites.lookup');
    Route::post('join/{code}', [InviteController::class, 'accept'])
        ->middleware('throttle:10,1')->name('invites.accept');

    Route::post('spaces', [SpaceController::class, 'store'])->name('spaces.store');
    Route::post('a/open', [AnalyticsController::class, 'open'])->middleware('throttle:30,1')->name('analytics.open');
    Route::post('survey', [SurveyController::class, 'store'])->middleware('throttle:10,1')->name('survey.store');

    // Everything below is behind the wall: members only (others get 404).
    // scopeBindings: a {moment}/{dailyPrompt}/{media}/{comment} from another space → 404.
    Route::prefix('s/{space}')->middleware('space.member')->name('spaces.')->scopeBindings()->group(function () {
        Route::get('/', [SpaceController::class, 'show'])->name('show');
        Route::get('daily', [SpaceController::class, 'daily'])->name('daily');
        Route::get('moments', [SpaceController::class, 'moments'])->name('moments');
        Route::post('restore', [SpaceController::class, 'restore'])->name('restore');
        Route::post('achievements/seen', [SpaceController::class, 'seenAchievements'])->name('achievements.seen');
        Route::get('moments/{moment}/media/{media}', [MomentMediaController::class, 'show'])->name('media.show');

        // Writes need an active (not frozen) space.
        Route::middleware('space.member:active')->group(function () {
            Route::patch('/', [SpaceController::class, 'update'])->name('update');
            Route::post('freeze', [SpaceController::class, 'freeze'])->name('freeze');
            Route::post('invite', [SpaceController::class, 'regenerateInvite'])->name('invite');

            Route::post('today/{dailyPrompt}/answer', [AnswerController::class, 'store'])->name('answers.store');
            Route::put('today/{dailyPrompt}/rating', [RatingController::class, 'update'])->name('ratings.update');
            Route::post('today/{dailyPrompt}/nudge', [NudgeController::class, 'store'])->middleware('throttle:10,1')->name('nudge');
            Route::post('today/{dailyPrompt}/replies', [LetterReplyController::class, 'store'])->middleware('throttle:30,1')->name('replies.store');
            Route::delete('today/{dailyPrompt}/replies/{reply}', [LetterReplyController::class, 'destroy'])->name('replies.destroy');
            Route::put('mood', [MoodController::class, 'update'])->middleware('throttle:30,1')->name('mood');
            Route::put('long-distance', [SpaceController::class, 'longDistance'])->name('long-distance');
            Route::delete('distance', [SpaceController::class, 'forgetDistance'])->name('distance.forget');
            Route::post('places', [PlaceController::class, 'store'])->name('places.store');
            Route::patch('places/{place}', [PlaceController::class, 'update'])->name('places.update');
            Route::delete('places/{place}', [PlaceController::class, 'destroy'])->name('places.destroy');
            Route::post('places/here', [PlaceController::class, 'here'])->middleware('throttle:10,1')->name('places.here');
            Route::put('moments/{moment}/place', [PlaceController::class, 'moment'])->name('moments.place');
            Route::post('prompts', [PromptController::class, 'store'])->name('prompts.store');
            Route::post('share/ask', [ShareController::class, 'ask'])->middleware('throttle:20,1')->name('share.ask');
            Route::put('share/requests/{shareRequest}', [ShareController::class, 'decide'])->name('share.decide');
            Route::post('share/links', [ShareController::class, 'store'])->middleware('throttle:10,1')->name('share.links.store');

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

// Admin. Non-admins get 404. / แอดมิน (คนอื่นได้ 404)
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', AdminDashboardController::class)->name('dashboard');
    Route::get('insights', AdminInsightsController::class)->name('insights');
    Route::get('users', [AdminUserController::class, 'index'])->name('users.index');
    Route::put('spaces/{space}/premium', [AdminUserController::class, 'premium'])->name('spaces.premium');
    Route::get('features', [AdminFeatureController::class, 'index'])->name('features.index');
    Route::put('features/{key}', [AdminFeatureController::class, 'update'])->name('features.update');
    Route::put('themes/{theme}', [AdminFeatureController::class, 'updateTheme'])->name('themes.update');
    Route::get('schedule', [AdminScheduleController::class, 'index'])->name('schedule.index');
    Route::post('schedule', [AdminScheduleController::class, 'store'])->name('schedule.store');
    Route::delete('schedule/{scheduled}', [AdminScheduleController::class, 'destroy'])->name('schedule.destroy');
    Route::post('special-days', [AdminScheduleController::class, 'storeDay'])->name('days.store');
    Route::patch('special-days/{day}', [AdminScheduleController::class, 'updateDay'])->name('days.update');
    Route::delete('special-days/{day}', [AdminScheduleController::class, 'destroyDay'])->name('days.destroy');

    Route::get('prompts', [AdminPromptController::class, 'index'])->name('prompts.index');
    Route::post('prompts', [AdminPromptController::class, 'store'])->name('prompts.store');
    Route::patch('prompts/{prompt}', [AdminPromptController::class, 'update'])->name('prompts.update');
    Route::delete('prompts/{prompt}', [AdminPromptController::class, 'destroy'])->name('prompts.destroy');
});

require __DIR__.'/settings.php';
