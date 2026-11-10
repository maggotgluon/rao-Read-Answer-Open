<?php

namespace App\Http\Controllers;

use App\Models\DailyPrompt;
use App\Models\LetterReply;
use App\Models\Space;
use App\Services\Analytics;
use App\Services\Push;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/** Short replies under a day's letters, once both are open. / ตอบกลับใต้จดหมายเมื่อเปิดทั้งคู่แล้ว */
class LetterReplyController extends Controller
{
    public function store(Request $request, Space $space, DailyPrompt $dailyPrompt, Push $push): RedirectResponse
    {
        $data = $request->validate(['body' => ['required', 'string', 'max:500']]);
        $user = $request->user();

        // Only after both letters are open. / หลังจากเปิดจดหมายทั้งสองฉบับแล้ว
        abort_unless($dailyPrompt->answers()->count() >= Space::MAX_MEMBERS, 422);

        $dailyPrompt->replies()->create(['user_id' => $user->id, 'body' => $data['body']]);
        Analytics::track($user, 'reply_posted', ['len' => Analytics::lengthBucket($data['body'])], $space);

        if ($partner = $space->partnerOf($user)) {
            $push->notify($partner, 'replies', 'reply', ['name' => $user->name], route('spaces.daily', $space), $space);
        }

        return back();
    }

    public function destroy(Request $request, Space $space, DailyPrompt $dailyPrompt, LetterReply $reply): RedirectResponse
    {
        abort_unless($reply->daily_prompt_id === $dailyPrompt->id && $reply->user_id === $request->user()->id, 404);
        $reply->delete();

        return back();
    }
}
