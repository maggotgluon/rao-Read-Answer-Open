<?php

namespace App\Http\Controllers;

use App\Models\Mood;
use App\Models\Space;
use App\Services\Analytics;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/** Today's mood stamp (tap again to take it off). / แสตมป์อารมณ์วันนี้ */
class MoodController extends Controller
{
    public function update(Request $request, Space $space): RedirectResponse
    {
        $mood = $request->validate(['mood' => ['nullable', Rule::in(array_keys(Mood::MOODS))]])['mood'] ?? null;
        $user = $request->user();
        $date = $space->today()->toDateString();

        if ($mood) {
            Mood::updateOrCreate(['user_id' => $user->id, 'date' => $date], ['mood' => $mood]);
            Analytics::track($user, 'mood_set', [], $space);   // which mood stays private
        } else {
            Mood::where('user_id', $user->id)->whereDate('date', $date)->delete();
        }

        return back();
    }
}
