<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Models\User;
use App\Services\AccountData;
use App\Services\Analytics;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/** Privacy settings: analytics consent, export, delete account. / ความเป็นส่วนตัว */
class PrivacyController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/privacy', [
            'analytics' => $request->user()->analyticsOn(),
            'graceDays' => User::DELETE_GRACE_DAYS,
            'sensitiveSince' => $request->user()->sensitive_consent_at?->toIso8601String(),
        ]);
    }

    public function analytics(Request $request): RedirectResponse
    {
        $on = $request->validate(['on' => ['required', 'boolean']])['on'];
        $user = $request->user();

        if ($on && ! $user->analyticsOn()) {
            $user->forceFill(['analytics_consent_at' => now()])->save();
            Analytics::track($user, 'analytics_on');
        } elseif (! $on && $user->analyticsOn()) {
            $user->forceFill(['analytics_consent_at' => null])->save();
            Analytics::forget($user);   // withdrawing also deletes past events
        }
        Inertia::flash('toast', ['type' => 'success', 'message' => __($on ? 'privacy.analytics_on' : 'privacy.analytics_off')]);

        return back();
    }

    public function export(Request $request, AccountData $data): BinaryFileResponse
    {
        Analytics::track($request->user(), 'export');
        $name = 'rao-'.now()->format('Y-m-d').'.zip';

        return response()->download($data->zip($request->user()), $name, ['Content-Type' => 'application/zip'])
            ->deleteFileAfterSend();
    }

    /**
     * Ask to delete: signed out now, deleted after the grace period unless they sign in again.
     * ขอลบบัญชี: ออกจากระบบทันที ลบจริงเมื่อครบกำหนด เว้นแต่จะเข้าสู่ระบบอีกครั้ง
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();
        $user->forceFill(['delete_at' => now()->addDays(User::DELETE_GRACE_DAYS)])->save();
        $user->pushSubscriptions()->delete();   // no notifications while waiting

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        Inertia::flash('toast', ['type' => 'success', 'message' => __('privacy.delete_scheduled', ['days' => User::DELETE_GRACE_DAYS])]);

        return redirect('/');
    }
}
