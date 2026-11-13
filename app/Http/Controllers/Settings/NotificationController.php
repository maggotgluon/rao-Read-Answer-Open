<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Push;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Per-person push settings: which types, and morning/evening times. / ตั้งค่าแจ้งเตือนรายคน */
class NotificationController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('settings/notifications', [
            'prefs' => $user->notifyPrefs(),
            'morning_at' => $user->morning_at,
            'evening_at' => $user->evening_at,
            'vapidPublicKey' => config('services.webpush.public_key'),
            'configured' => Push::configured(),
            'devices' => $user->pushSubscriptions()->count(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $time = ['required', 'date_format:H:i'];
        $data = $request->validate([
            'prefs' => ['required', 'array'],
            'prefs.*' => ['boolean'],
            'morning_at' => $time,
            'evening_at' => $time,
        ]);

        $request->user()->update([
            'notify' => collect(User::NOTIFY_TYPES)->mapWithKeys(fn ($t) => [$t => (bool) ($data['prefs'][$t] ?? true)])->all(),
            'morning_at' => $data['morning_at'],
            'evening_at' => $data['evening_at'],
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('notify.saved')]);

        return back();
    }
}
