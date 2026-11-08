<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property int $space_id
 * @property string $code
 * @property int $created_by
 * @property int|null $accepted_by
 * @property Carbon|null $accepted_at
 * @property Carbon $expires_at
 */
class SpaceInvite extends Model
{
    public const VALID_DAYS = 7;

    /** No 0/O/1/I/L — easy to read aloud or type. / ตัดตัวที่สับสนออก */
    private const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

    protected $fillable = ['space_id', 'code', 'created_by', 'expires_at'];

    protected function casts(): array
    {
        return [
            'accepted_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Space, $this> */
    public function space(): BelongsTo
    {
        return $this->belongsTo(Space::class);
    }

    /** @return BelongsTo<User, $this> */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function isUsable(): bool
    {
        return $this->accepted_at === null && $this->expires_at->isFuture();
    }

    public static function generateCode(): string
    {
        do {
            $code = '';
            for ($i = 0; $i < 8; $i++) {
                $code .= self::ALPHABET[random_int(0, strlen(self::ALPHABET) - 1)];
            }
        } while (self::where('code', $code)->exists());

        return $code;
    }

    public static function normalizeCode(string $input): string
    {
        return Str::upper(preg_replace('/[^A-Za-z0-9]/', '', $input) ?? '');
    }
}
