<?php

namespace App\Http\Controllers;

use App\Models\DailyPrompt;
use App\Models\Space;
use App\Services\Analytics;
use App\Services\Push;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * "Remind them": after I sealed today's letter and my partner hasn't, at most once a day.
 * เตือนอีกฝ่ายเบา ๆ ได้วันละครั้ง หลังจากเราเขียนแล้ว
 */
class NudgeController extends Controller
{
    public function store(Request $request, Space $space, DailyPrompt $dailyPrompt, Push $push): RedirectResponse
    {
        $user = $request->user();
        $partner = $space->partnerOf($user);
        $dailyPrompt->setRelation('space', $space);
        $answers = $dailyPrompt->answers()->pluck('user_id');

        abort_unless($partner && $dailyPrompt->date->isSameDay($space->today()), 422);
        abort_unless($answers->contains($user->id) && ! $answers->contains($partner->id), 422);

        // Nothing would arrive: say so instead of pretending. / ถ้าอีกฝ่ายปิดแจ้งเตือน บอกตรง ๆ
        if (! $partner->wants('nudges') || ! $partner->pushSubscriptions()->exists()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('nudge.no_push', ['name' => $partner->name])]);

            return back();
        }

        $sent = $push->once($user, $space, 'nudge', $space->today()->toDateString(), function () use ($push, $partner, $user, $space) {
            $push->notify($partner, 'nudges', 'nudge', ['name' => $user->name], route('spaces.daily', $space), $space);
        });

        if ($sent) {
            Analytics::track($user, 'nudge_sent', [], $space);
        }
        Inertia::flash('toast', ['type' => 'success', 'message' => __($sent ? 'nudge.sent' : 'nudge.already', ['name' => $partner->name])]);

        return back();
    }
}
