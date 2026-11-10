<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" data-theme="{{ $theme ?? 'blush' }}" @class(['dark' => ($theme ?? 'blush') === 'candle'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            /* Paint the theme ground before CSS loads (no white flash). */
            html[data-theme='blush'] { background-color: #f3e3e7; }
            html[data-theme='paper'] { background-color: #eef2f8; }
            html[data-theme='candle'] { background-color: #121a2c; }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="32x32 48x48">
        <link rel="icon" href="/icons/favicon-48.png" type="image/png" sizes="48x48">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        {{-- PWA --}}
        <link rel="manifest" href="/manifest.webmanifest">
        <meta name="theme-color" content="{{ ['blush' => '#f3e3e7', 'paper' => '#eef2f8', 'candle' => '#121a2c'][$theme ?? 'blush'] }}">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="{{ ($theme ?? 'blush') === 'candle' ? 'black-translucent' : 'default' }}">
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
