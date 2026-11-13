<?php

namespace App\Http\Controllers;

use App\Support\AppVersion;
use App\Support\Seo;
use Illuminate\Http\Response;

/**
 * robots.txt, sitemap.xml and llms.txt (a plain summary for AI answer engines).
 * Generated so the URLs follow APP_URL and the text follows the same lang files as the site.
 * ไฟล์สำหรับเครื่องมือค้นหาและผู้ช่วย AI สร้างจากข้อความชุดเดียวกับหน้าเว็บ
 */
class SeoController extends Controller
{
    public function robots(): Response
    {
        $lines = [
            'User-agent: *',
            'Allow: /',
            // Private or admin areas: nothing to find there. / พื้นที่ส่วนตัว
            'Disallow: /s/',
            'Disallow: /dashboard',
            'Disallow: /settings',
            'Disallow: /admin',
            'Disallow: /consent',
            'Disallow: /_ops/',
            '',
            'Sitemap: '.Seo::abs('sitemap.xml'),
            '',
        ];

        return $this->text(implode("\n", $lines));
    }

    public function sitemap(): Response
    {
        $released = Seo::released();
        $xml = ['<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'];
        foreach (Seo::publicPaths() as $path) {
            $xml[] = '  <url>';
            $xml[] = '    <loc>'.e(Seo::abs($path)).'</loc>';
            if ($released && in_array($path, ['/', '/changelog'], true)) {
                $xml[] = "    <lastmod>{$released}</lastmod>";
            }
            foreach (Seo::alternates($path) as $lang => $url) {
                $xml[] = '    <xhtml:link rel="alternate" hreflang="'.$lang.'" href="'.e($url).'"/>';
            }
            $xml[] = '  </url>';
        }
        $xml[] = '</urlset>';

        return response(implode("\n", $xml)."\n", 200, [
            'Content-Type' => 'application/xml; charset=utf-8',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }

    /** https://llmstxt.org: what Rao is, in both languages. / สรุปสำหรับ AI */
    public function llms(): Response
    {
        $out = ['# Rao (เรา)', '', '> '.__('home.meta', [], 'en'), '', '> '.__('home.meta', [], 'th'), ''];
        $out[] = 'Version '.AppVersion::info()['version'].'. Web app (PWA), Thai and English, free during the beta. Made by magnamm Studio (https://mag.codes).';
        $out[] = '';

        foreach (['en', 'th'] as $l) {
            $t = fn (string $k) => __($k, [], $l);
            $out[] = '## '.($l === 'en' ? 'English' : 'ภาษาไทย');
            $out[] = '';
            $out[] = '### '.$t('home.how_title');
            $out[] = '';
            foreach (range(1, 5) as $n) {
                $out[] = "{$n}. **".$t("home.step{$n}_title").'**: '.$t("home.step{$n}_body");
            }
            $out[] = '';
            $out[] = '### '.$t('home.more_title');
            $out[] = '';
            foreach (['moments', 'dates', 'mood', 'ld', 'nudge', 'themes'] as $k) {
                $out[] = '- **'.$t("home.f_{$k}_title").'**: '.$t("home.f_{$k}_body");
            }
            $out[] = '';
            $out[] = '### '.$t('home.private_title');
            $out[] = '';
            $out[] = $t('home.private_body');
            $out[] = '';
            $out[] = '### '.$t('home.faq_title');
            $out[] = '';
            foreach (range(1, 6) as $n) {
                $out[] = '- **'.$t("home.faq{$n}_q").'** '.$t("home.faq{$n}_a");
            }
            $out[] = '';
        }

        $out[] = '## Links';
        $out[] = '';
        $out[] = '- [Home / หน้าแรก]('.Seo::abs('/').')';
        $out[] = '- [Create an account / สมัคร]('.Seo::abs('register').')';
        $out[] = '- [Changelog / มีอะไรใหม่]('.Seo::abs('changelog').')';
        foreach (['privacy', 'terms', 'cookies', 'data-rights'] as $d) {
            $out[] = "- [{$d}](".Seo::abs("legal/{$d}").')';
        }
        $out[] = '';

        return $this->text(implode("\n", $out), 'text/markdown');
    }

    private function text(string $body, string $type = 'text/plain'): Response
    {
        return response($body, 200, [
            'Content-Type' => "{$type}; charset=utf-8",
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }
}
