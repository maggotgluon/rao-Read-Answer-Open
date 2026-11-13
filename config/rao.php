<?php

return [
    /*
     * Token for the /_ops/* maintenance URLs (hosts without artisan). Empty = URLs are off.
     * Make one with: php -r "echo bin2hex(random_bytes(24));"
     * โทเค็นสำหรับลิงก์ /_ops/* ถ้าว่าง ลิงก์จะปิด
     */
    'ops_token' => env('RAO_OPS_TOKEN'),

    /*
     * Dev tools: skip email verification for new sign-ups + one-click demo logins.
     * Only works when APP_ENV=local, even if this flag is set elsewhere.
     * เครื่องมือสำหรับ dev: ข้ามการยืนยันอีเมล + ปุ่มล็อกอินบัญชีเดโม
     * ทำงานเฉพาะ APP_ENV=local เท่านั้น
     */
    'dev_tools' => (bool) env('RAO_DEV_TOOLS', false),

    // Demo accounts created by the seeder (password: "password").
    'demo_accounts' => [
        ['name' => 'Mag', 'email' => 'mag@rao.test', 'locale' => 'th', 'note' => 'paired with Partner + Third (poly)'],
        ['name' => 'Partner', 'email' => 'partner@rao.test', 'locale' => 'th', 'note' => 'paired with Mag'],
        ['name' => 'Third', 'email' => 'third@rao.test', 'locale' => 'en', 'note' => 'paired with Mag — must not see Mag↔Partner'],
        ['name' => 'Solo', 'email' => 'solo@rao.test', 'locale' => 'th', 'note' => 'no space yet (onboarding)'],
    ],
];
