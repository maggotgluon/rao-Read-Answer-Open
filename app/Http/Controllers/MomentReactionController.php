<?php

namespace App\Http\Controllers;

use App\Models\Moment;
use App\Models\MomentReaction;
use App\Models\Space;
use App\Services\Analytics;
use App\Services\Push;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/** One reaction per person per moment; sending the same one again removes it. ('emoji' column holds the reaction key.) */
class MomentReactionController extends Controller
{
    public function update(Request $request, Space $space, Moment $moment, Push $push): RedirectResponse
    {
        abort_if($moment->isDraft(), 404);

        $data = $request->validate(['emoji' => ['required', Rule::in(array_keys(MomentReaction::REACTIONS))]]);
        $existing = $moment->reactions()->where('user_id', $request->user()->id)->first();

        if ($existing && $existing->emoji === $data['emoji']) {
            $existing->delete();
        } else {
            $moment->reactions()->updateOrCreate(
                ['user_id' => $request->user()->id],
                ['emoji' => $data['emoji']],
            );

            Analytics::track($request->user(), 'reaction', [], $space);

            if (! $existing && $moment->user_id !== $request->user()->id) {
                $push->notify($moment->user, 'moment_activity', 'reaction',
                    ['name' => $request->user()->name, 'emoji' => MomentReaction::REACTIONS[$data['emoji']]], route('spaces.moments', $space), $space);
            }
        }

        return back();
    }
}
