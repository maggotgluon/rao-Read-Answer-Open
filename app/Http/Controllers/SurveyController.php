<?php

namespace App\Http\Controllers;

use App\Models\SurveyResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

/** The voluntary 14-day survey (score null = "not now"). / แบบสอบถาม 14 วัน */
class SurveyController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'score' => ['nullable', 'integer', 'between:1,5'],
            'liked' => ['nullable', 'string', 'max:500'],
            'change' => ['nullable', 'string', 'max:500'],
        ]);

        SurveyResponse::firstOrCreate(
            ['user_id' => $request->user()->id, 'survey' => SurveyResponse::DAY14],
            $data,
        );
        if ($data['score'] ?? null) {
            Inertia::flash('toast', ['type' => 'success', 'message' => __('survey.thanks')]);
        }

        return back();
    }
}
