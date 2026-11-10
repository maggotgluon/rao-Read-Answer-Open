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
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
