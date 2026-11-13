<?php

namespace App\Support;

/**
 * Single gate for every dev-only shortcut. Requires BOTH APP_ENV=local and
 * RAO_DEV_TOOLS=true, so a copied .env can't switch these on in production.
 * จุดเดียวที่ควบคุมทางลัดสำหรับ dev ต้อง APP_ENV=local และ RAO_DEV_TOOLS=true
 */
class DevTools
{
    public static function enabled(): bool
    {
        return app()->environment('local') && config('rao.dev_tools') === true;
    }

    /** @return list<array{name: string, email: string, locale: string, note: string}> */
    public static function demoAccounts(): array
    {
        return config('rao.demo_accounts', []);
    }
}
