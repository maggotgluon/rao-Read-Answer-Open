<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Minishlink\WebPush\VAPID;

/**
 * Creates the VAPID key pair for web push. With --write it appends them to .env
 * (only if missing). Run once per environment; keep the private key secret.
 * สร้างกุญแจ VAPID สำหรับ push (--write = เขียนลง .env ถ้ายังไม่มี)
 */
class GenerateVapidKeys extends Command
{
    protected $signature = 'push:vapid {--write : Append to .env if VAPID keys are not set yet}';

    protected $description = 'Generate VAPID keys for web push';

    public function handle(): int
    {
        $keys = VAPID::createVapidKeys();

        if (! $this->option('write')) {
            $this->line('VAPID_PUBLIC_KEY='.$keys['publicKey']);
            $this->line('VAPID_PRIVATE_KEY='.$keys['privateKey']);

            return self::SUCCESS;
        }

        $env = base_path('.env');
        $content = (string) @file_get_contents($env);
        if (str_contains($content, 'VAPID_PRIVATE_KEY=') && ! preg_match('/^VAPID_PRIVATE_KEY=\s*$/m', $content)) {
            $this->warn('VAPID keys already set in .env — not changed (changing them breaks existing subscriptions).');

            return self::SUCCESS;
        }

        file_put_contents($env, rtrim($content)."\n\nVAPID_PUBLIC_KEY={$keys['publicKey']}\nVAPID_PRIVATE_KEY={$keys['privateKey']}\n");
        $this->info('VAPID keys written to .env (private key not shown).');

        return self::SUCCESS;
    }
}
