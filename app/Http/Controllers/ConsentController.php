<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Give / withdraw explicit consent for sensitive topics. / ให้-ถอนความยินยอมเรื่องอ่อนไหว */
class ConsentController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        if ($request->user()->sensitive_consent_at) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('consent');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate(['sensitive' => ['accepted']], ['sensitive.accepted' => __('validation.sensitive')]);
        $request->user()->forceFill(['sensitive_consent_at' => now()])->save();

        return redirect()->intended(route('dashboard'));
    }

    public function withdraw(Request $request): RedirectResponse
    {
        $request->user()->forceFill(['sensitive_consent_at' => null])->save();
        Inertia::flash('toast', ['type' => 'success', 'message' => __('consent.withdrawn')]);

        return redirect()->route('privacy.edit');
    }
}
