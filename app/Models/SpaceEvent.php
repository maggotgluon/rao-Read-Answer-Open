<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $space_id
 * @property int|null $created_by
 * @property string $kind
 * @property string $title
 * @property Carbon $date
 * @property bool $repeats_yearly
 */
class SpaceEvent extends Model
{
    /** Kinds partners create by hand. Anniversary is set in space settings; birthdays live on profiles. */
    public const KINDS = ['special', 'other'];

    public const ANNIVERSARY = 'anniversary';

    protected $fillable = ['space_id', 'created_by', 'kind', 'title', 'date', 'repeats_yearly'];

    protected function casts(): array
    {
        return ['date' => 'date', 'repeats_yearly' => 'boolean'];
    }

    /** @return BelongsTo<User, $this> */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** @return HasMany<Moment, $this> */
    public function moments(): HasMany
    {
        return $this->hasMany(Moment::class);
    }

    /** @return BelongsTo<Space, $this> */
    public function space(): BelongsTo
    {
        return $this->belongsTo(Space::class);
    }
}
