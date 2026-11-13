<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

/** A public link to one card picture. / ลิงก์สาธารณะไปยังรูปการ์ด 1 รูป */
class ShareLink extends Model
{
    public const EXPIRY_DAYS = [7, 30, null];   // null = until turned off / จนกว่าจะปิด

    public const MAX_ACTIVE_PER_USER = 50;

    public const DISK = 'local';

    protected $fillable = ['token', 'user_id', 'space_id', 'item_type', 'item_id', 'path', 'width', 'height', 'expires_at', 'revoked_at', 'views'];

    protected function casts(): array
    {
        return ['expires_at' => 'datetime', 'revoked_at' => 'datetime'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function space(): BelongsTo
    {
        return $this->belongsTo(Space::class);
    }

    /** @param  Builder<ShareLink>  $q */
    public function scopeLive(Builder $q): void
    {
        $q->whereNull('revoked_at')->where(fn ($w) => $w->whereNull('expires_at')->orWhere('expires_at', '>', now()));
    }

    public function isLive(): bool
    {
        return ! $this->revoked_at && (! $this->expires_at || $this->expires_at->isFuture());
    }

    /** Turn off: the picture is deleted at once. / ปิดลิงก์ ลบรูปทันที */
    public function revoke(): void
    {
        Storage::disk(self::DISK)->delete($this->path);
        $this->forceFill(['revoked_at' => $this->revoked_at ?? now()])->save();
    }

    /** Turn off every link of one item (postcard deleted…). / ปิดทุกลิงก์ของชิ้นนี้ */
    public static function revokeFor(string $type, int $id): void
    {
        static::where(['item_type' => $type, 'item_id' => $id])->whereNull('revoked_at')->get()->each->revoke();
    }

    public function url(): string
    {
        return route('share.show', $this->token);
    }
}
