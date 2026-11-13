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

        $raw = $this->fill($raw, $locale);
        $raw = preg_replace('/\A\s*#\s[^\n]*\n/', '', $raw);   // title is shown by the page

        return Inertia::render('legal/show', [
            'doc' => $doc,
            'title' => $meta['title'] ?? $doc,
            'version' => $meta['version'] ?? null,
            'effective' => filled($meta['effective_date'] ?? null) && ! str_contains($meta['effective_date'], '{{')
                ? $meta['effective_date'] : config('legal.effective_date'),
            'html' => Str::markdown($raw, ['html_input' => 'strip', 'allow_unsafe_links' => false]),
            'docs' => self::DOCS,
        ]);
    }

    /**
     * Fill {{tokens}} from .env and hide owner markers ([PLACEHOLDER: …], [OPTIONAL: …]) on the public page.
     * ใส่ค่าจาก .env และซ่อนเครื่องหมายที่ยังไม่ได้กรอกบนหน้าเว็บจริง
     */
    private function fill(string $md, string $locale): string
    {
        $email = config('legal.contact_email');
        $md = str_replace('{{contact_email}}', $email ? "[{$email}](mailto:{$email})" : ($locale === 'th' ? '(จะแจ้งเร็ว ๆ นี้)' : '(coming soon)'), $md);
        $md = str_replace('{{effective_date}}', (string) config('legal.effective_date'), $md);

        // Lines whose only value is an unfilled optional field go away entirely.
        $md = preg_replace('/^.*:\s*\[OPTIONAL:[^\]]*\]\s*$\n?/m', '', $md);
        $md = preg_replace('/\s*\[(PLACEHOLDER|OPTIONAL):[^\]]*\]/', '', $md);
        // "Address: " left empty after removing a marker in a sentence. / ทำความสะอาด
        $md = preg_replace('/ · (?=\n|$)/', '', $md);

        return $md;
    }
}
