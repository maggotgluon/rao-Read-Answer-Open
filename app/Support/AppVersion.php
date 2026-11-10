<?php

namespace App\Support;

/**
 * App version = the newest entry in resources/changelog/en.md; build = the commit CI
 * wrote to BUILD in the deploy tree ("dev" locally).
 * เวอร์ชันมาจากบันทึกการเปลี่ยนแปลงล่าสุด build มาจากไฟล์ BUILD ที่ CI เขียนตอน deploy
 */
class AppVersion
{
    private static ?array $cache = null;

    /** @return array{version: string, build: string} */
    public static function info(): array
    {
        if (self::$cache !== null) {
            return self::$cache;
        }

        $log = @file_get_contents(resource_path('changelog/en.md')) ?: '';
        $version = preg_match('/^##\s*\[([^\]]+)\]/m', $log, $m) ? $m[1] : '0.0.0';
        $buildFile = base_path('BUILD');
        $build = is_file($buildFile) ? trim((string) file_get_contents($buildFile)) : 'dev';

        return self::$cache = ['version' => $version, 'build' => preg_replace('/[^a-zA-Z0-9._-]/', '', $build) ?: 'dev'];
    }

    public static function flush(): void
    {
        self::$cache = null;
    }
}
