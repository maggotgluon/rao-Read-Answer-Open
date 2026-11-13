<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" data-theme="{{ $theme ?? 'dusk' }}" @class(['dark' => $themeDark ?? false]) style="background-color: {{ $themeGround ?? '#f3e3e7' }}; color-scheme: {{ ($themeDark ?? false) ? 'dark' : 'light' }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

        {{-- Theme colours + images from public/themes/<id>/theme.json. / ตัวแปรธีมจากโฟลเดอร์ธีม --}}
        <style id="rao-theme">{!! $themeCss ?? '' !!}</style>

        <link rel="icon" href="/favicon.ico" sizes="32x32 48x48">
        <link rel="icon" href="/icons/favicon-48.png" type="image/png" sizes="48x48">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        {{-- PWA --}}
        <link rel="manifest" href="/manifest.webmanifest">
        <meta name="theme-color" content="{{ $themeStatusBar ?? '#f3e3e7' }}">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="{{ ($themeDark ?? false) ? 'black-translucent' : 'default' }}">
        <meta name="apple-mobile-web-app-title" content="เรา">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        {{-- Search + share previews, server-rendered (chat apps don't run JS). / SEO และตัวอย่างลิงก์ --}}
        @php($seo = \App\Support\Seo::for($page, request()->path()))
        <meta name="description" content="{{ $seo['description'] }}">
        <meta name="robots" content="{{ $seo['robots'] }}">
        <meta name="application-name" content="Rao · เรา">
        @if ($seo['canonical'])
            <link rel="canonical" href="{{ $seo['canonical'] }}">
        @endif
        @foreach ($seo['alternates'] as $lang => $href)
            <link rel="alternate" hreflang="{{ $lang }}" href="{{ $href }}">
        @endforeach
        <meta property="og:type" content="{{ $seo['type'] }}">
        <meta property="og:site_name" content="Rao · เรา">
        <meta property="og:title" content="{{ $seo['og_title'] }}">
        <meta property="og:description" content="{{ $seo['description'] }}">
        <meta property="og:url" content="{{ $seo['url'] }}">
        <meta property="og:locale" content="{{ $seo['locale'] }}">
        <meta property="og:locale:alternate" content="{{ $seo['locale_alt'] }}">
        <meta property="og:image" content="{{ $seo['image'] }}">
        <meta property="og:image:secure_url" content="{{ $seo['image'] }}">
        <meta property="og:image:type" content="image/png">
        <meta property="og:image:width" content="{{ $seo['image_w'] }}">
        <meta property="og:image:height" content="{{ $seo['image_h'] }}">
        <meta property="og:image:alt" content="{{ $seo['image_alt'] }}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $seo['og_title'] }}">
        <meta name="twitter:description" content="{{ $seo['description'] }}">
        <meta name="twitter:image" content="{{ $seo['image'] }}">
        <meta name="twitter:image:alt" content="{{ $seo['image_alt'] }}">
        @if ($seo['schema'])
            <script type="application/ld+json">{!! \App\Support\Seo::jsonLd($seo['schema']) !!}</script>
        @endif
        <x-inertia::head>
            <title>{{ $seo['title'] }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
