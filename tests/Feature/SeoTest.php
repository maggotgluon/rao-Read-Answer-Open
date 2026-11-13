<?php

use App\Models\Space;
use App\Models\User;
use App\Support\Seo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

/** Pull <meta>/<link> values out of the server-rendered head. */
function seoHead(string $html): array
{
    $head = substr($html, 0, (int) strpos($html, '</head>'));
    preg_match_all('/<meta (?:name|property)="([^"]+)" content="([^"]*)"/', $head, $m);
    $meta = [];
    foreach ($m[1] as $i => $k) {
        $meta[$k] = html_entity_decode($m[2][$i], ENT_QUOTES);
    }
    preg_match_all('/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/', $head, $alt);
    preg_match('/<link rel="canonical" href="([^"]+)"/', $head, $can);
    preg_match('#<script type="application/ld\+json">(.*?)</script>#s', $head, $ld);

    return [
        'meta' => $meta,
        'alternates' => array_combine($alt[1], $alt[2]),
        'canonical' => $can[1] ?? null,
        'ld' => isset($ld[1]) ? json_decode($ld[1], true) : null,
        'head' => $head,
    ];
}

test('share images exist at 1200x630', function () {
    foreach (Seo::IMAGES as $file) {
        [$w, $h] = getimagesize(public_path($file));
        expect([$w, $h])->toBe([1200, 630]);
    }
});

test('home page: indexable, canonical + hreflang, share card, answers as structured data', function () {
    $s = seoHead($this->get('/?lang=en')->assertOk()->getContent());

    expect($s['meta']['robots'])->toStartWith('index')
        ->and($s['meta']['description'])->toBe(__('home.meta', [], 'en'))
        ->and($s['meta']['og:title'])->toBe(__('seo.home_og_title', [], 'en'))
        ->and($s['meta']['og:image'])->toStartWith(Seo::abs('og/rao-default.png'))
        ->and($s['meta']['og:image:width'])->toBe('1200')
        ->and($s['meta']['twitter:card'])->toBe('summary_large_image')
        ->and($s['meta']['og:locale'])->toBe('en_US')
        ->and($s['canonical'])->toBe(Seo::abs('/').'?lang=en')
        ->and(array_keys($s['alternates']))->toBe(['th', 'en', 'x-default']);

    $types = array_column($s['ld']['@graph'], '@type');
    expect($types)->toContain('WebSite', 'WebApplication', 'FAQPage', 'HowTo', 'Organization');
    $faq = collect($s['ld']['@graph'])->firstWhere('@type', 'FAQPage');
    expect($faq['mainEntity'])->toHaveCount(6)
        ->and($faq['mainEntity'][0]['name'])->toBe(__('home.faq1_q', [], 'en'));
});

test('?lang= switches the language and a guest keeps it', function () {
    $this->get('/?lang=en')->assertOk();
    $s = seoHead($this->get('/')->getContent());
    expect($s['meta']['og:locale'])->toBe('en_US');

    $th = seoHead($this->get('/?lang=th')->getContent());
    expect($th['meta']['description'])->toBe(__('home.meta', [], 'th'))
        ->and($th['meta']['og:locale'])->toBe('th_TH');
});

test('private pages are noindex and reveal nothing in previews', function () {
    [$a, $b] = User::factory()->count(2)->create(['name' => 'Secretname']);
    $space = Space::factory()->withMembers($a, $b)->create(['name' => 'Our Hidden Nest']);

    $html = $this->actingAs($a)->get(route('spaces.show', $space))->getContent();
    $s = seoHead($html);
    expect($s['meta']['robots'])->toBe('noindex, nofollow')
        ->and($s['canonical'])->toBeNull()
        ->and($s['ld'])->toBeNull()
        ->and($s['meta']['description'])->toBe(__('seo.private'))
        ->and(implode(' ', $s['meta']))->not->toContain('Our Hidden Nest')->not->toContain('Secretname');

    // A stranger (or a link-preview bot) only gets the login page. / คนนอกเห็นแค่หน้าเข้าสู่ระบบ
    auth()->logout();
    $this->get(route('spaces.show', $space))->assertRedirect('/login');
});

test('invite links get the invite card but never the inviter\'s name', function () {
    [$a, $b] = User::factory()->count(2)->create(['name' => 'Inviter Person']);
    $space = Space::factory()->withMembers($a)->create();
    $invite = $space->invites()->create([
        'code' => 'ABCD2345', 'created_by' => $a->id, 'expires_at' => now()->addDays(7),
    ]);

    $s = seoHead($this->get('/join/'.$invite->code.'?lang=en')->assertOk()->getContent());
    expect($s['meta']['robots'])->toBe('noindex, nofollow')
        ->and($s['meta']['og:image'])->toContain('og/rao-invite.png')
        ->and($s['meta']['og:title'])->toBe(__('invite.title_generic', [], 'en'))
        ->and(implode(' ', $s['meta']))->not->toContain('Inviter Person');
});

test('legal pages and the changelog have their own description', function () {
    $s = seoHead($this->get('/legal/privacy?lang=en')->getContent());
    expect($s['meta']['description'])->toBe(__('seo.doc_privacy', [], 'en'))
        ->and($s['meta']['og:type'])->toBe('article')
        ->and($s['canonical'])->toBe(Seo::abs('legal/privacy').'?lang=en');

    $c = seoHead($this->get('/changelog?lang=th')->getContent());
    expect($c['meta']['description'])->toBe(__('seo.doc_changelog', [], 'th'));
});

test('robots.txt, sitemap.xml and llms.txt', function () {
    $robots = $this->get('/robots.txt')->assertOk()->getContent();
    expect($robots)->toContain('Disallow: /s/')->toContain('Sitemap: '.Seo::abs('sitemap.xml'))
        ->not->toContain('Disallow: /join');

    $xml = simplexml_load_string($this->get('/sitemap.xml')->assertOk()->getContent());
    expect($xml)->not->toBeFalse()->and(count($xml->url))->toBe(count(Seo::publicPaths()));

    $llms = $this->get('/llms.txt')->assertOk()->assertHeader('Content-Type', 'text/markdown; charset=utf-8')->getContent();
    expect($llms)->toStartWith('# Rao (เรา)')
        ->toContain(__('home.faq3_q', [], 'en'))
        ->toContain(__('home.faq3_q', [], 'th'));
});
