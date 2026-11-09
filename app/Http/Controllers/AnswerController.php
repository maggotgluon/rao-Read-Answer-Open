<?php

namespace App\Http\Controllers;

use App\Models\DailyPrompt;
use App\Models\Space;
use App\Services\DailyPrompts;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/** Save my answer for a day (create, or edit until my partner has answered). */
class AnswerController extends Controller
{
    public function store(Request $request, Space $space, DailyPrompt $dailyPrompt, DailyPrompts $prompts): RedirectResponse
    {
        $data = $request->validate(['body' => ['required', 'string', 'max:2000']]);
        $user = $request->user();
        $dailyPrompt->setRelation('space', $space);

        // Only days from the current window (pairing → today, max 7 days) can be answered.
        abort_unless($prompts->pairedOn($space) && $dailyPrompt->isOpen(), 422, __('today.closed'));

        DB::transaction(function () use ($dailyPrompt, $user, $data) {
            $answers = $dailyPrompt->answers()->lockForUpdate()->get();
            $mine = $answers->firstWhere('user_id', $user->id);
            $partnerAnswered = $answers->contains(fn ($a) => $a->user_id !== $user->id);

            if ($mine && $partnerAnswered) {
                abort(422, __('today.locked'));
            }

            $mine
                ? $mine->update(['body' => $data['body']])
                : $dailyPrompt->answers()->create(['user_id' => $user->id, 'body' => $data['body']]);
        });

        return back();
    }
}
