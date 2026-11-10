<?php

namespace App\Http\Controllers;

use App\Models\Moment;
use App\Models\MomentComment;
use App\Models\Space;
use App\Services\Analytics;
use App\Services\Push;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MomentCommentController extends Controller
{
    public function store(Request $request, Space $space, Moment $moment, Push $push): RedirectResponse
    {
        abort_if($moment->isDraft(), 404);

        $data = $request->validate(['body' => ['required', 'string', 'max:1000']]);
        $moment->comments()->create(['user_id' => $request->user()->id, 'body' => $data['body']]);
        Analytics::track($request->user(), 'comment_posted', [], $space);

        if ($moment->user_id !== $request->user()->id) {
            $push->notify($moment->user, 'moment_activity', 'comment',
                ['name' => $request->user()->name], route('spaces.moments', $space), $space);
        }

        return back();
    }

    public function destroy(Request $request, Space $space, Moment $moment, MomentComment $comment): RedirectResponse
    {
        abort_unless($comment->user_id === $request->user()->id, 403);

        $comment->delete();

        return back();
    }
}
