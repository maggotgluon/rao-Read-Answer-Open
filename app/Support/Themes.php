<?php

namespace App\Support;

use App\Models\ThemeSetting;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

/**
 * Theme folders in public/themes/<id>/: theme.json (names, colour tokens, optional images)
 * + asset folders (icons/, moods/, faces/, reactions/, dates/, decor/, logo/, textures/, buttons/).
 * A theme can "extend" another; any missing file falls back to the parent. In one folder a
 * raster file (png/webp/jpg) wins over an svg with the same name, so dropping in a PNG replaces it.
 * ธีมเป็นโฟลเดอร์ แก้ไข/เพิ่มได้โดยไม่ต้อง build ใหม่ ไฟล์ที่ไม่มีจะใช้ของธีมแม่
 */
class Themes
{
    public const DEFAULT = 'dusk';

    /** Old ids stored before themes became folders. / ชื่อเดิมก่อนเป็นโฟลเดอร์ */
    public const LEGACY = ['blush' => 'dusk', 'paper' => 'daytime', 'candle' => 'night'];

    private const RASTER = ['png', 'webp', 'jpg', 'jpeg', 'gif'];

    private const EXT = ['svg', 'png', 'webp', 'jpg', 'jpeg', 'gif'];

    /** @var array<string, array<string, mixed>>|null */
    private static ?array $cache = null;

    public static function root(): string
    {
        return public_path('themes');
    }

    /** @return array<string, array<string, mixed>> every valid theme, resolved, keyed by id */
    public static function all(): array
    {
        if (self::$cache !== null) {
            return self::$cache;
        }

        // Re-scan only when something in public/themes changed. / สแกนใหม่เมื่อไฟล์เปลี่ยน
        $sig = self::signature();

        // The cache holds root-relative paths; the current host is added per request, so
        // www/bare-domain/IP visitors all get same-origin URLs (CSS masks refuse cross-origin).
        // แคชเก็บพาธแบบไม่มีโดเมน แล้วเติมโดเมนของคำขอปัจจุบันทีหลัง
        return self::$cache = self::withHost(Cache::rememberForever("themes:{$sig}", function () {
            $raw = [];
            foreach (glob(self::root().'/*/theme.json') ?: [] as $file) {
                $json = json_decode((string) file_get_contents($file), true);
                $id = basename(dirname($file));
                if (is_array($json) && preg_match('/^[a-z0-9-]+$/', $id)) {
                    $raw[$id] = $json + ['id' => $id];
                }
            }

            $out = [];
            foreach (array_keys($raw) as $id) {
                $out[$id] = self::resolve($id, $raw);
            }
            uksort($out, fn ($a, $b) => ($a === self::DEFAULT ? -1 : 0) - ($b === self::DEFAULT ? -1 : 0) ?: strcmp($a, $b));

            return $out;
        }));
    }

    /**
     * @param  array<string, array<string, mixed>>  $themes
     * @return array<string, array<string, mixed>>
     */
    private static function withHost(array $themes): array
    {
        foreach ($themes as &$t) {
            foreach ($t['assets'] as &$a) {
                $a['url'] = url($a['url']);
            }
            foreach ($t['images'] as &$img) {
                $img = $img ? url($img) : null;
            }
        }

        return $themes;
    }

    public static function flush(): void
    {
        self::$cache = null;
    }

    public static function exists(?string $id): bool
    {
        return $id !== null && isset(self::all()[$id]);
    }

    public static function normalize(?string $id): ?string
    {
        return self::LEGACY[$id] ?? $id;
    }

    /** @return array<string, mixed> */
    public static function get(string $id): array
    {
        return self::all()[$id] ?? self::all()[self::DEFAULT];
    }

    /**
     * Themes this person may pick: switched on by admin, premium ones only with a premium space,
     * and only the default when the "themes" feature is off.
     * ธีมที่ผู้ใช้เลือกได้
     *
     * @return list<string>
     */
    public static function availableFor(?User $user): array
    {
        if (! Features::on('themes', $user)) {
            return [self::DEFAULT];
        }
        $settings = self::settings();
        $premium = (bool) $user?->spaces()->where('premium', true)->exists();

        return array_values(array_filter(array_keys(self::all()), function ($id) use ($settings, $premium) {
            $s = $settings[$id] ?? ['enabled' => true, 'tier' => 'free'];

            return $id === self::DEFAULT || ($s['enabled'] && ($s['tier'] === 'free' || $premium));
        }));
    }

    /** @return array<string, array{enabled: bool, tier: string}> */
    public static function settings(): array
    {
        if (! Schema::hasTable('theme_settings')) {
            return [];
        }

        return ThemeSetting::all()->mapWithKeys(fn ($s) => [$s->theme => ['enabled' => (bool) $s->enabled, 'tier' => $s->tier]])->all();
    }

    /** CSS custom properties for a theme (colours + optional images). / ตัวแปร CSS ของธีม */
    public static function css(string $id): string
    {
        $vars = [];
        foreach (self::cssVars($id) as $k => $v) {
            $vars[] = "--{$k}: {$v};";
        }

        return ':root{'.implode('', $vars).'}';
    }

    /** @return array<string, string> */
    public static function cssVars(string $id): array
    {
        $t = self::get($id);
        $vars = [];
        foreach ($t['tokens'] as $k => $v) {
            $vars[$k] = self::clean((string) $v);
        }
        foreach ($t['images'] as $k => $url) {
            $vars["{$k}-image"] = $url ? 'url("'.self::clean($url).'")' : 'none';
        }

        return $vars;
    }

    /** What the browser needs for one theme. / ข้อมูลธีมที่ส่งให้เบราว์เซอร์ */
    public static function forClient(string $id, string $locale): array
    {
        $t = self::get($id);

        return [
            'id' => $t['id'],
            'name' => $t['name'][$locale] ?? $t['name']['en'] ?? $t['id'],
            'description' => $t['description'][$locale] ?? $t['description']['en'] ?? '',
            // Attribution some picture licences require (e.g. CC BY). / เครดิตที่สัญญาอนุญาตกำหนด
            'credit' => $t['credit'][$locale] ?? $t['credit']['en'] ?? null,
            'dark' => $t['dark'],
            'status_bar' => $t['status_bar'],
            'vars' => self::cssVars($id),
        ];
    }

    /**
     * @param  array<string, array<string, mixed>>  $raw
     * @param  list<string>  $seen
     * @return array<string, mixed>
     */
    private static function resolve(string $id, array $raw, array $seen = []): array
    {
        $own = $raw[$id];
        $parentId = $own['extends'] ?? null;
        $parent = ($parentId && isset($raw[$parentId]) && ! in_array($parentId, $seen, true))
            ? self::resolve($parentId, $raw, [...$seen, $id])
            : ['tokens' => [], 'images' => [], 'assets' => [], 'mono' => [], 'dark' => false, 'status_bar' => null];

        $images = $parent['images'];
        foreach (($own['images'] ?? []) as $k => $path) {
            if (str_starts_with((string) $k, '_')) {
                continue;
            }
            $images[$k] = $path ? self::url($id, (string) $path) : ($images[$k] ?? null);
        }

        $mono = $own['mono'] ?? $parent['mono'];

        return [
            'id' => $id,
            'extends' => $parentId,
            'name' => $own['name'] ?? ['en' => $id],
            'description' => $own['description'] ?? [],
            'credit' => $own['credit'] ?? [],
            'dark' => (bool) ($own['dark'] ?? $parent['dark']),
            'status_bar' => $own['status_bar'] ?? $parent['status_bar'] ?? ($own['tokens']['ground'] ?? null),
            'tokens' => array_merge($parent['tokens'], $own['tokens'] ?? []),
            'images' => $images,
            'mono' => $mono,
            'assets' => array_merge($parent['assets'], self::scan($id, $mono)),
        ];
    }

    /** @return array<string, array{url: string, mono: bool}> */
    private static function scan(string $id, array $mono): array
    {
        $dir = self::root()."/{$id}";
        $found = [];
        foreach (glob("{$dir}/*", GLOB_ONLYDIR) ?: [] as $groupDir) {
            $group = basename($groupDir);
            foreach (glob("{$groupDir}/*.*") ?: [] as $file) {
                $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                if (! in_array($ext, self::EXT, true)) {
                    continue;
                }
                $key = $group.'.'.pathinfo($file, PATHINFO_FILENAME);
                $raster = in_array($ext, self::RASTER, true);
                // Raster beats svg in the same folder. / PNG ชนะ SVG ในโฟลเดอร์เดียวกัน
                if (isset($found[$key]) && ! $raster) {
                    continue;
                }
                $found[$key] = [
                    'url' => self::url($id, "{$group}/".basename($file)),
                    'mono' => ! $raster && in_array($group, $mono, true) && ! str_ends_with($file, '.color.svg'),
                ];
            }
        }

        return $found;
    }

    private static function url(string $id, string $path): string
    {
        $file = self::root()."/{$id}/".ltrim($path, '/');
        $v = is_file($file) ? substr(md5((string) filemtime($file)), 0, 8) : '0';

        // Root-relative here; withHost() makes it absolute for the current request.
        return "/themes/{$id}/".ltrim($path, '/')."?v={$v}";
    }

    private static function signature(): string
    {
        $parts = [];
        foreach (glob(self::root().'/*', GLOB_ONLYDIR) ?: [] as $theme) {
            foreach ([$theme, ...(glob("{$theme}/*", GLOB_ONLYDIR) ?: []), "{$theme}/theme.json"] as $p) {
                $parts[] = $p.'@'.@filemtime($p);
            }
        }

        return md5(implode('|', $parts));
    }

    /** No breaking out of a CSS declaration. / กันไม่ให้หลุดออกจากค่า CSS */
    private static function clean(string $v): string
    {
        return str_replace(['<', '>', '{', '}', ';', '"'], '', $v);
    }
}
