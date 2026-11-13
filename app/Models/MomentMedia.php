<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string $ulid
 * @property int $moment_id
 * @property string $path
 * @property int $width
 * @property int $height
 * @property int $size
 * @property int $position
 */
class MomentMedia extends Model
{
    use HasUlids;

    protected $table = 'moment_media';

    protected $fillable = ['moment_id', 'path', 'width', 'height', 'size', 'position'];

    /** @return array<int, string> */
    public function uniqueIds(): array
    {
        return ['ulid'];
    }

    public function getRouteKeyName(): string
    {
        return 'ulid';
    }

    /** @return BelongsTo<Moment, $this> */
    public function moment(): BelongsTo
    {
        return $this->belongsTo(Moment::class);
    }
}
