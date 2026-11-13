<?php

namespace App\Services;

use App\Models\Space;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Re-encodes every upload on the server: strips EXIF (incl. GPS location), caps size,
 * stores on the PRIVATE disk under the space's folder with a random name.
 * เข้ารหัสรูปใหม่ทุกครั้ง: ลบ EXIF (รวมพิกัด GPS), จำกัดขนาด, เก็บในดิสก์ส่วนตัว
 */
class MomentPhotos
{
    public const DISK = 'local';

    public const MAX_EDGE = 2048;

    public const QUALITY = 82;

    /** @return array{path: string, width: int, height: int, size: int} */
    public function store(UploadedFile $file, Space $space): array
    {
        $raw = file_get_contents($file->getRealPath());
        $image = $raw === false ? false : @imagecreatefromstring($raw);
        if ($image === false) {
            throw new RuntimeException('Unreadable image');
        }

        $image = $this->applyExifOrientation($image, $file->getRealPath());
        $image = $this->fit($image);

        ob_start();
        imagejpeg($image, null, self::QUALITY);
        $jpeg = (string) ob_get_clean();

        $width = imagesx($image);
        $height = imagesy($image);
        imagedestroy($image);

        $path = self::folder($space).'/'.Str::random(40).'.jpg';
        Storage::disk(self::DISK)->put($path, $jpeg);

        return ['path' => $path, 'width' => $width, 'height' => $height, 'size' => strlen($jpeg)];
    }

    public function delete(string $path): void
    {
        Storage::disk(self::DISK)->delete($path);
    }

    public static function folder(Space $space): string
    {
        return 'spaces/'.$space->ulid;
    }

    private function fit(\GdImage $image): \GdImage
    {
        $w = imagesx($image);
        $h = imagesy($image);
        $scale = self::MAX_EDGE / max($w, $h);
        if ($scale >= 1) {
            return $image;
        }

        $resized = imagescale($image, (int) round($w * $scale), (int) round($h * $scale), IMG_BICUBIC);
        imagedestroy($image);

        return $resized ?: throw new RuntimeException('Resize failed');
    }

    /** The app's browser compression already rotates pixels; this covers direct uploads. */
    private function applyExifOrientation(\GdImage $image, string $path): \GdImage
    {
        if (! function_exists('exif_read_data')) {
            return $image;
        }

        $orientation = @exif_read_data($path)['Orientation'] ?? 1;
        $angle = [3 => 180, 6 => -90, 8 => 90][$orientation] ?? 0;

        return $angle ? (imagerotate($image, $angle, 0) ?: $image) : $image;
    }
}
