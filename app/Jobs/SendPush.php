<?php

namespace App\Jobs;

use App\Models\PushSubscription;
use App\Services\Push;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;

/** Delivers one payload to every device of a user; removes dead subscriptions. */
class SendPush implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    /** @param array<string, string> $payload */
    public function __construct(public int $userId, public array $payload) {}

    public function handle(): void
    {
        if (! Push::configured()) {
            Log::info('push skipped: VAPID keys not configured', ['user' => $this->userId]);

            return;
        }

        $subs = PushSubscription::where('user_id', $this->userId)->get();
        if ($subs->isEmpty()) {
            return;
        }

        $push = new WebPush(['VAPID' => [
            'subject' => config('services.webpush.subject'),
            'publicKey' => config('services.webpush.public_key'),
            'privateKey' => config('services.webpush.private_key'),
        ]], ['TTL' => 60 * 60 * 12, 'urgency' => 'normal']);

        $byEndpoint = [];
        foreach ($subs as $sub) {
            $byEndpoint[$sub->endpoint] = $sub;
            $push->queueNotification(Subscription::create([
                'endpoint' => $sub->endpoint,
                'publicKey' => $sub->public_key,
                'authToken' => $sub->auth_token,
                'contentEncoding' => $sub->content_encoding,
            ]), json_encode($this->payload, JSON_UNESCAPED_UNICODE));
        }

        foreach ($push->flush() as $report) {
            $sub = $byEndpoint[$report->getEndpoint()] ?? null;
            if ($report->isSuccess()) {
                continue;
            }
            if ($report->isSubscriptionExpired()) {
                $sub?->delete();   // phone uninstalled / permission revoked
            } else {
                Log::warning('push failed', ['user' => $this->userId, 'reason' => $report->getReason()]);
            }
        }
    }
}
