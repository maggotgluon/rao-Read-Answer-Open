<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $ulid
 * @property int $space_id
 * @property int $user_id
 * @property string|null $body
 * @property string $status
 * @property Carbon|null $posted_at
 */
class Moment extends Model
{
    use HasUlids;

    public const MAX_PHOTOS = 4;

    public const STATUS_DRAFT = 'draft';

    public const STATUS_POSTED = 'posted';

    protected $fillable = ['space_id', 'user_id', 'body', 'status', 'posted_at'];

    /** @return array<int, string> */
    public function uniqueIds(): array
    {
        return ['ulid'];
    }

    public function getRouteKeyName(): string
    {
        return 'ulid';
    }

    protected function casts(): array
    {
        return ['posted_at' => 'datetime'];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Space, $this> */
    public function space(): BelongsTo
    {
        return $this->belongsTo(Space::class);
    }

    /** @return HasMany<MomentMedia, $this> */
    public function media(): HasMany
    {
        return $this->hasMany(MomentMedia::class)->orderBy('position');
    }

    /** @return HasMany<MomentReaction, $this> */
    public function reactions(): HasMany
    {
        return $this->hasMany(MomentReaction::class);
    }

    /** @return HasMany<MomentComment, $this> */
    public function comments(): HasMany
    {
        return $this->hasMany(MomentComment::class)->oldest();
    }

    public function isDraft(): bool
    {
        return $this->status === self::STATUS_DRAFT;
    }

    /** Drafts are private to their author. / ร่างเห็นได้เฉพาะเจ้าของ */
    public function isVisibleTo(User $user): bool
    {
        return ! $this->isDraft() || $this->user_id === $user->id;
    }

    /** @param Builder<Moment> $query */
    public function scopePosted(Builder $query): void
    {
        $query->where('status', self::STATUS_POSTED);
    }
}
