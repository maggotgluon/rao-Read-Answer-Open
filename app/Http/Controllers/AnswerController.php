<?php

namespace App\Http\Controllers;

use App\Models\DailyPrompt;
use App\Models\Space;
use App\Services\Achievements;
use App\Services\Analytics;
use App\Services\DailyPrompts;
use App\Services\Push;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/** Save my answer for a day (create, or edit until my partner has answered). */
class AnswerController extends Controller
{
    public function store(Request $request, Space $space, DailyPrompt $dailyPrompt, DailyPrompts $prompts, Push $push): RedirectResponse
    {
        $data = $request->validate(['body' => ['required', 'string', 'max:2000']]);
        $user = $request->user();
        $dailyPrompt->setRelation('space', $space);

        // Only days from the current window (pairing → today, max 7 days) can be answered.
        abort_unless($prompts->pairedOn($space) && $dailyPrompt->isOpen(), 422, __('today.closed'));

        $isNew = DB::transaction(function () use ($dailyPrompt, $user, $data) {
            $answers = $dailyPrompt->answers()->lockForUpdate()->get();
            $mine = $answers->firstWhere('user_id', $user->id);
            $partnerAnswered = $answers->contains(fn ($a) => $a->user_id !== $user->id);

            if ($mine && $partnerAnswered) {
                abort(422, __('today.locked'));
            }

            $mine
                ? $mine->update(['body' => $data['body']])
                : $dailyPrompt->answers()->create(['user_id' => $user->id, 'body' => $data['body']]);

            return ! $mine;
        });

        if ($isNew) {
            Analytics::track($user, 'answer_submitted', [
                'kind' => $dailyPrompt->prompt->kind,
                'bonus' => $dailyPrompt->slot === DailyPrompt::BONUS,
                'late' => ! $dailyPrompt->date->isSameDay($space->today()),
                'second' => $dailyPrompt->answers()->count() >= Space::MAX_MEMBERS,   // opened the partner's letter
                'len' => Analytics::lengthBucket($data['body']),
            ], $space);
        }

        // First answer only (not edits). / แจ้งเฉพาะครั้งแรกที่ตอบ
        if ($isNew && $partner = $space->partnerOf($user)) {
            $isQuest = $dailyPrompt->prompt->kind === 'quest';
            $push->notify($partner, 'partner_answered', $isQuest ? 'quest_done' : 'answered',
                ['name' => $user->name], route('spaces.daily', $space), $space);
        }

        if ($isNew) {
            app(Achievements::class)->check($space);
        }

        return back();
    }
}
