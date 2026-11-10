<?php

namespace App\Http\Controllers;

use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/** Renders resources/legal/{locale}/{doc}.md (Thai governs). / แสดงเอกสารกฎหมายจากไฟล์ Markdown */
class LegalController extends Controller
{
    public const DOCS = ['privacy', 'terms', 'cookies', 'data-rights'];

    public function show(string $doc): Response
    {
        $locale = app()->getLocale() === 'en' ? 'en' : 'th';
        $path = resource_path("legal/{$locale}/{$doc}.md");
        abort_unless(is_file($path), 404);

        $raw = (string) file_get_contents($path);
        $meta = [];
        if (preg_match('/^---\s*\n(.*?)\n---\s*\n/s', $raw, $m)) {
            foreach (preg_split('/\n/', $m[1]) as $line) {
                if (str_contains($line, ':')) {
                    [$k, $v] = array_map('trim', explode(':', $line, 2));
                    $meta[$k] = trim($v, "\"'");
                }
            }
            $raw = substr($raw, strlen($m[0]));
        }

        return Inertia::render('legal/show', [
            'doc' => $doc,
            'title' => $meta['title'] ?? $doc,
            'version' => $meta['version'] ?? null,
            'effective' => $meta['effective_date'] ?? null,
            'html' => Str::markdown($raw, ['html_input' => 'strip', 'allow_unsafe_links' => false]),
            'docs' => self::DOCS,
        ]);
    }
}
