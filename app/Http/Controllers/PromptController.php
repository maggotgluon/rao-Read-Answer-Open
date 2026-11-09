<?php

namespace App\Http\Controllers;

use App\Models\Prompt;
use App\Models\Space;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/** Couple-written questions/quests. They jump the queue for future days. */
class PromptController extends Controller
{
    public const MAX_QUEUED = 30;

    public function store(Request $request, Space $space): RedirectResponse
    {
        $data = $request->validate([
            'kind' => ['required', Rule::in(Prompt::KINDS)],
            'text' => ['required', 'string', 'max:300'],
        ]);

        $queued = $space->customPrompts()->whereDoesntHave('dailyUses')->count();
        abort_if($queued >= self::MAX_QUEUED, 422);

        $column = app()->getLocale() === 'en' ? 'text_en' : 'text_th';

        $space->customPrompts()->create([
            'created_by' => $request->user()->id,
            'kind' => $data['kind'],
            $column => $data['text'],
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('today.custom.added')]);

        return back();
    }
}
