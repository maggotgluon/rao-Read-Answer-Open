<?php

namespace App\Support;

use App\Http\Controllers\LegalController;
use App\Http\Middleware\SetLocale;

/**
 * Search + share metadata, rendered by the blade layout on every full page load, so it works
 * without JavaScript (link previews in LINE/Facebook/X don't run JS) and without SSR on the host.
 * Public pages are indexable with hreflang alternates (?lang=th|en); everything behind login is
 * noindex and only ever gets generic text, so a shared private link reveals nothing.
 * ข้อมูลสำหรับ Google, ผู้ช่วย AI และตัวอย่างลิงก์ตอนแชร์ หน้าส่วนตัวจะไม่ถูกจัดทำดัชนีและไม่เปิดเผยข้อมูล
 */
class Seo
{
    public const IMAGES = [
        'default' => 'og/rao-default.png',
        'invite' => 'og/rao-invite.png',
    ];

    /** Pages anyone may find in search. / หน้าที่ค้นหาเจอได้ */
    private const PUBLIC = ['welcome', 'legal/show', 'auth/register', 'auth/login'];

    /**
     * @param  array<string, mixed>  $page  the Inertia page object
     * @return array<string, mixed>
     */
    public static function for(array $page, string $path): array
    {
        $component = (string) ($page['component'] ?? '');
        $props = $page['props'] ?? [];
        $locale = app()->getLocale() === 'en' ? 'en' : 'th';
        $app = (string) config('app.name', 'Rao');
        $public = in_array($component, self::PUBLIC, true);
        $path = '/'.ltrim($path, '/');

        $title = $app;
        $description = __('seo.private');
        $image = 'default';
        $type = 'website';
        $schema = [];

        switch ($component) {
            case 'welcome':
                $title = __('welcome.title')." - {$app}";
                $description = __('home.meta');
                $schema = self::homeSchema($locale);
                break;
            case 'legal/show':
                $doc = (string) ($props['doc'] ?? '');
                $title = ((string) ($props['title'] ?? $doc))." - {$app}";
                $description = __("seo.doc_{$doc}");
                $type = 'article';
                $schema = [self::pageSchema($title, $description, $path, $locale)];
                break;
            case 'auth/register':
                $title = __('auth.create')." - {$app}";
                $description = __('seo.register');
                break;
            case 'auth/login':
                $title = __('auth.login')." - {$app}";
                $description = __('seo.login');
                break;
            case 'invites/show':
                // Never the inviter's name: previews are cached by chat apps. / ไม่ใส่ชื่อผู้เชิญ
                $title = __('invite.title_generic');
                $description = __('seo.invite');
                $image = 'invite';
                break;
        }

        $canonical = self::abs($path).'?lang='.$locale;

        return [
            'title' => $title,
            'og_title' => $component === 'welcome' ? __('seo.home_og_title') : $title,
            'description' => $description,
            'robots' => $public ? 'index, follow, max-image-preview:large' : 'noindex, nofollow',
            'canonical' => $public ? $canonical : null,
            'url' => $public ? $canonical : self::abs($path),
            'alternates' => $public ? self::alternates($path) : [],
            'locale' => $locale === 'th' ? 'th_TH' : 'en_US',
            'locale_alt' => $locale === 'th' ? 'en_US' : 'th_TH',
            'type' => $type,
            'site' => $app,
            'image' => self::image($image),
            'image_alt' => __($image === 'invite' ? 'seo.invite_alt' : 'seo.image_alt'),
            'schema' => $schema,
        ];
    }

    /** Absolute URL on the canonical host (APP_URL). / URL เต็มบนโดเมนหลัก */
    public static function abs(string $path = '/'): string
    {
        return rtrim((string) config('app.url'), '/').'/'.ltrim($path, '/');
    }

    public static function image(string $key): string
    {
        $file = self::IMAGES[$key] ?? self::IMAGES['default'];
        $full = public_path($file);
        $v = is_file($full) ? substr(md5((string) filemtime($full).filesize($full)), 0, 8) : '0';

        return self::abs($file)."?v={$v}";
    }

    /** @return array<string, string> hreflang => url */
    public static function alternates(string $path): array
    {
        $out = [];
        foreach (SetLocale::SUPPORTED as $l) {
            $out[$l] = self::abs($path).'?lang='.$l;
        }
        $out['x-default'] = self::abs($path);

        return $out;
    }

    /**
     * Public pages for the sitemap. / หน้าสาธารณะสำหรับ sitemap
     *
     * @return list<string>
     */
    public static function publicPaths(): array
    {
        return ['/', '/register', '/login', '/changelog', ...array_map(fn ($d) => "/legal/{$d}", LegalController::DOCS)];
    }

    /** Date of the newest changelog entry (YYYY-MM-DD) or null. */
    public static function released(): ?string
    {
        $log = @file_get_contents(resource_path('changelog/en.md')) ?: '';

        return preg_match('/^##\s*\[[^\]]+\]\s*-\s*(\d{4}-\d{2}-\d{2})/m', $log, $m) ? $m[1] : null;
    }

    /**
     * Structured data for the home page: who runs it, what the app is, how to use it, FAQ.
     * Built from the same lang strings as the visible page, so the answers always match.
     * ข้อมูลโครงสร้างของหน้าแรก ใช้ข้อความชุดเดียวกับที่แสดงบนหน้า
     *
     * @return list<array<string, mixed>>
     */
    private static function homeSchema(string $locale): array
    {
        $home = self::abs('/');
        $org = ['@type' => 'Organization', '@id' => $home.'#publisher', 'name' => 'magnamm Studio', 'url' => 'https://mag.codes'];

        $steps = [];
        foreach (range(1, 5) as $n) {
            $steps[] = ['@type' => 'HowToStep', 'position' => $n, 'name' => __("home.step{$n}_title"), 'text' => __("home.step{$n}_body")];
        }
        $faq = [];
        foreach (range(1, 6) as $n) {
            $faq[] = [
                '@type' => 'Question',
                'name' => __("home.faq{$n}_q"),
                'acceptedAnswer' => ['@type' => 'Answer', 'text' => __("home.faq{$n}_a")],
            ];
        }
        $features = array_map(fn ($k) => __("home.f_{$k}_title").': '.__("home.f_{$k}_body"), ['moments', 'dates', 'mood', 'ld', 'nudge', 'themes']);

        return [
            $org,
            [
                '@type' => 'WebSite', '@id' => $home.'#website', 'url' => $home,
                'name' => 'Rao', 'alternateName' => ['เรา', 'Rao (เรา)'],
                'description' => __('home.meta'), 'inLanguage' => ['th', 'en'], 'publisher' => ['@id' => $org['@id']],
            ],
            [
                '@type' => 'WebApplication', '@id' => $home.'#app', 'name' => 'Rao (เรา)', 'url' => $home,
                'description' => __('home.meta'), 'applicationCategory' => 'LifestyleApplication',
                'operatingSystem' => 'Web, iOS, Android', 'browserRequirements' => 'Requires a modern browser',
                'inLanguage' => ['th', 'en'], 'isAccessibleForFree' => true,
                'offers' => ['@type' => 'Offer', 'price' => '0', 'priceCurrency' => 'THB'],
                'featureList' => $features, 'image' => self::image('default'),
                'softwareVersion' => AppVersion::info()['version'], 'publisher' => ['@id' => $org['@id']],
            ],
            [
                '@type' => 'HowTo', 'name' => __('home.how_title').' · Rao', 'description' => __('home.how_sub'),
                'inLanguage' => $locale, 'step' => $steps,
            ],
            ['@type' => 'FAQPage', 'inLanguage' => $locale, 'mainEntity' => $faq],
        ];
    }

    /** @return array<string, mixed> */
    private static function pageSchema(string $title, string $description, string $path, string $locale): array
    {
        return [
            '@type' => 'WebPage', 'name' => $title, 'description' => $description,
            'url' => self::abs($path), 'inLanguage' => $locale,
            'isPartOf' => ['@id' => self::abs('/').'#website'],
            'breadcrumb' => ['@type' => 'BreadcrumbList', 'itemListElement' => [
                ['@type' => 'ListItem', 'position' => 1, 'name' => 'Rao', 'item' => self::abs('/')],
                ['@type' => 'ListItem', 'position' => 2, 'name' => $title, 'item' => self::abs($path)],
            ]],
        ];
    }

    /** @param  list<array<string, mixed>>  $schema */
    public static function jsonLd(array $schema): string
    {
        $json = json_encode(['@context' => 'https://schema.org', '@graph' => $schema],
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP);

        return (string) $json;
    }
}
