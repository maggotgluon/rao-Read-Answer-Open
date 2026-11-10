<?php

namespace App\Http\Controllers;

use App\Support\AppVersion;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/** Public changelog from resources/changelog/{locale}.md. / หน้าบันทึกการเปลี่ยนแปลง */
class ChangelogController extends Controller
{
    public function __invoke(): Response
    {
        $locale = app()->getLocale() === 'en' ? 'en' : 'th';
        $raw = (string) file_get_contents(resource_path("changelog/{$locale}.md"));
        $title = preg_match('/\A\s*#\s([^\n]+)/', $raw, $m) ? trim($m[1]) : 'Changelog';
        $raw = preg_replace('/\A\s*#\s[^\n]*\n/', '', $raw);   // title is shown by the page
        // "## [0.9.0] - 2026-11-10" → "## 0.9.0 · 2026-11-10" / หัวข้อเวอร์ชันอ่านง่ายขึ้น
        $raw = preg_replace('/^##\s*\[([^\]]+)\]\s*-\s*(\S+)/m', '## $1 · $2', $raw);

        return Inertia::render('legal/show', [
            'doc' => 'changelog',
            'title' => $title,
            'version' => AppVersion::info()['version'],
            'effective' => null,
            'html' => Str::markdown($raw, ['html_input' => 'strip', 'allow_unsafe_links' => false]),
            'docs' => LegalController::DOCS,
        ]);
    }
}
