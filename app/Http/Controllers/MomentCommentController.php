<?php

namespace App\Http\Controllers;

use App\Models\Moment;
use App\Models\MomentComment;
use App\Models\Space;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MomentCommentController extends Controller
{
    public function store(Request $request, Space $space, Moment $moment): RedirectResponse
    {
        abort_if($moment->isDraft(), 404);

        $data = $request->validate(['body' => ['required', 'string', 'max:1000']]);
        $moment->comments()->create(['user_id' => $request->user()->id, 'body' => $data['body']]);

        return back();
    }

    public function destroy(Request $request, Space $space, Moment $moment, MomentComment $comment): RedirectResponse
    {
        abort_unless($comment->user_id === $request->user()->id, 403);

        $comment->delete();

        return back();
    }
}
