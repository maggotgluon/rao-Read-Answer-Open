<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Support\Features;
use App\Support\Themes;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/** Pick a theme folder. Hidden entirely when the "themes" feature is off. / เลือกธีม */
class ThemeController extends Controller
{
    public function edit(Request $request): Response
    {
        abort_unless(Features::on('themes', $request->user()), 404);
        $locale = app()->getLocale();

        return Inertia::render('settings/appearance', [
            'themes' => collect(Themes::availableFor($request->user()))
                ->map(fn ($id) => Themes::forClient($id, $locale))->values(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        abort_unless(Features::on('themes', $request->user()), 403);
        $data = $request->validate(['theme' => ['required', Rule::in(Themes::availableFor($request->user()))]]);

        $request->user()?->update(['theme' => $data['theme']]);

        return back()->withCookie(cookie()->forever('theme', $data['theme']));
    }
}
