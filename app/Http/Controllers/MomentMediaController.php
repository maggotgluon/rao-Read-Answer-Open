<?php

namespace App\Http\Controllers;

use App\Models\Moment;
use App\Models\MomentMedia;
use App\Models\Space;
use App\Services\MomentPhotos;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

/**
 * Serves a photo only to members of its space (route walls) and drafts only to their author.
 * ส่งรูปให้เฉพาะสมาชิกของ space และรูปในร่างให้เฉพาะเจ้าของ
 *
 * Caching: "private, no-cache" + ETag. The browser keeps a copy but must ask the server
 * every time, so the membership check always runs (a logged-out or different user on a
 * shared device can't reuse the cached photo). Members get a cheap 304.
 * เบราว์เซอร์ต้องถามเซิร์ฟเวอร์ทุกครั้ง จึงเช็คสิทธิ์ได้เสมอ (สมาชิกได้ 304 ที่เบามาก)
 */
class MomentMediaController extends Controller
{
    public function show(Request $request, Space $space, Moment $moment, MomentMedia $media): Response
    {
        abort_unless($moment->isVisibleTo($request->user()), 404);

        $headers = [
            'Cache-Control' => 'private, no-cache',
            'ETag' => '"'.$media->ulid.'"',   // files never change once stored
            'X-Content-Type-Options' => 'nosniff',
        ];

        if (in_array($headers['ETag'], $request->getETags(), true)) {
            return response('', 304, $headers);
        }

        $disk = Storage::disk(MomentPhotos::DISK);
        abort_unless($disk->exists($media->path), 404);

        return $disk->response($media->path, null, [...$headers, 'Content-Type' => 'image/jpeg']);
    }
}
