<?php

// Generates placeholder PWA icons (soft coral + white heart) until the brand is decided.
// สร้างไอคอนชั่วคราว จนกว่าจะเลือกแบรนด์  —  php scripts/make-icons.php
$heart = 'M50 86 C20 64 8 48 8 32 C8 19 18 10 30 10 C39 10 46 15 50 22 C54 15 61 10 70 10 C82 10 92 19 92 32 C92 48 80 64 50 86 Z';
$out = __DIR__.'/../public/icons';
@mkdir($out, 0755, true);

$make = function (int $size, bool $maskable, string $file) use ($heart) {
    $bg = $maskable
        ? "<rect width='100' height='100' fill='#e07a5f'/>"
        : "<rect width='100' height='100' rx='22' fill='#e07a5f'/>";
    $scale = $maskable ? 0.5 : 0.62;  // maskable needs a safe zone
    $offset = (100 - 100 * $scale) / 2;
    $svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='{$size}' height='{$size}'>{$bg}"
        ."<g transform='translate({$offset} ".($offset + 3).") scale({$scale})'><path d='{$heart}' fill='#fff8f3'/></g></svg>";
    $im = new Imagick;
    $im->setBackgroundColor(new ImagickPixel('transparent'));
    $im->setResolution(300, 300);
    $im->readImageBlob($svg);
    $im->resizeImage($size, $size, Imagick::FILTER_LANCZOS, 1);
    $im->setImageFormat('png32');
    $im->writeImage($file);

    return $svg;
};

$make(192, false, "$out/icon-192.png");
$make(512, false, "$out/icon-512.png");
$make(512, true, "$out/icon-maskable-512.png");
$make(180, true, __DIR__.'/../public/apple-touch-icon.png');
file_put_contents(__DIR__.'/../public/favicon.svg', $make(64, false, sys_get_temp_dir().'/rao-fav.png'));
echo "icons written\n";
