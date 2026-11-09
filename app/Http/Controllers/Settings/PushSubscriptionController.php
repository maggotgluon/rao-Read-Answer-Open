<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Jobs\SendPush;
use App\Models\PushSubscription;
use App\Services\Push;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Save / remove this device's push subscription; send a test push. */
class PushSubscriptionController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'endpoint' => ['required', 'url:https', 'max:2000'],
            'keys.p256dh' => ['required', 'string', 'max:255'],
            'keys.auth' => ['required', 'string', 'max:255'],
            'contentEncoding' => ['nullable', 'in:aes128gcm,aesgcm'],
        ]);

        // One row per device; re-subscribing moves it to the current user.
        PushSubscription::updateOrCreate(
            ['endpoint_hash' => hash('sha256', $data['endpoint'])],
            [
                'user_id' => $request->user()->id,
                'endpoint' => $data['endpoint'],
                'public_key' => $data['keys']['p256dh'],
                'auth_token' => $data['keys']['auth'],
                'content_encoding' => $data['contentEncoding'] ?? 'aes128gcm',
                'user_agent' => substr((string) $request->userAgent(), 0, 255),
            ],
        );

        return response()->json(['ok' => true]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $data = $request->validate(['endpoint' => ['required', 'string', 'max:2000']]);

        $request->user()->pushSubscriptions()->where('endpoint_hash', hash('sha256', $data['endpoint']))->delete();

        return response()->json(['ok' => true]);
    }

    public function test(Request $request, Push $push): JsonResponse
    {
        abort_unless(Push::configured(), 503, 'Push is not configured on this server.');

        $user = $request->user();
        // Test ignores the per-type switches.
        $sent = $user->pushSubscriptions()->exists();
        if ($sent) {
            SendPush::dispatch($user->id, [
                'title' => __('push.test.title', [], $user->locale),
                'body' => __('push.test.body', [], $user->locale),
                'url' => route('notifications.edit'),
                'tag' => 'test',
            ]);
        }

        return response()->json(['ok' => $sent]);
    }
}
