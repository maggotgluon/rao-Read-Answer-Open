<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/** Each person picks their own theme (blush = default). Guests keep it in a cookie. */
class ThemeController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate(['theme' => ['required', Rule::in(User::THEMES)]]);

        $request->user()?->update(['theme' => $data['theme']]);

        return back()->withCookie(cookie()->forever('theme', $data['theme']));
    }
}
