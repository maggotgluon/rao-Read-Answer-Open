<?php

use App\Http\Controllers\SeoController;
use Illuminate\Support\Facades\Route;

// No session/cookies: for search engines and AI crawlers. / สำหรับเครื่องมือค้นหา
Route::get('robots.txt', [SeoController::class, 'robots'])->name('seo.robots');
Route::get('sitemap.xml', [SeoController::class, 'sitemap'])->name('seo.sitemap');
Route::get('llms.txt', [SeoController::class, 'llms'])->name('seo.llms');
