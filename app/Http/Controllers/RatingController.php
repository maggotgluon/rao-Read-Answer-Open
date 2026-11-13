<?php

namespace App\Http\Controllers;

use App\Models\DailyPrompt;
use App\Models\Space;
use App\Services\Analytics;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/** Private 👍/👎 on a day's question/quest (0 = clear). The partner never sees it. */
class RatingController extends Controller
{
    public function update(Request $request, Space $space, DailyPrompt $dailyPrompt): RedirectResponse
    {
        $value = (int) $request->validate(['value' => ['required', 'integer', Rule::in([-1, 0, 1])]])['value'];
        $userId = $request->user()->id;

        $value === 0
            ? $dailyPrompt->ratings()->where('user_id', $userId)->delete()
            : $dailyPrompt->ratings()->updateOrCreate(['user_id' => $userId], ['value' => $value]);

        Analytics::track($request->user(), 'prompt_rated', ['value' => $value], $space);

        return back();
    }
}
