<?php

namespace App\Models;

use Database\Factories\SpaceFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * A private space shared by (in v1) exactly two people.
 * พื้นที่ส่วนตัวของคนสองคน (v1 จำกัด 2 คน)
 *
 * @property int $id
 * @property string $ulid
 * @property string|null $name
 * @property string $timezone
 * @property string $status
 * @property int|null $frozen_by
 * @property Carbon|null $frozen_at
 * @property Carbon|null $delete_after
 * @property int|null $created_by
 */
class Space extends Model
{
    /** @use HasFactory<SpaceFactory> */
    use HasFactory, HasUlids;

    public const MAX_MEMBERS = 2;

    public const FREEZE_DAYS = 30;

    public const STATUS_ACTIVE = 'active';

    public const STATUS_FROZEN = 'frozen';

    protected $fillable = ['name', 'timezone', 'anniversary_on', 'created_by'];

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
        return [
            'frozen_at' => 'datetime',
            'delete_after' => 'datetime',
            'anniversary_on' => 'date',
        ];
    }

    /** @return BelongsToMany<User, $this> */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'space_members')
            ->withPivot('joined_at')
            ->withTimestamps();
    }

    /** @return HasMany<SpaceInvite, $this> */
    public function invites(): HasMany
    {
        return $this->hasMany(SpaceInvite::class);
    }

    /** @return HasMany<DailyPrompt, $this> */
    public function dailyPrompts(): HasMany
    {
        return $this->hasMany(DailyPrompt::class);
    }

    /** @return HasMany<Moment, $this> */
    public function moments(): HasMany
    {
        return $this->hasMany(Moment::class);
    }

    /** @return HasMany<SpaceEvent, $this> */
    public function events(): HasMany
    {
        return $this->hasMany(SpaceEvent::class);
    }

    /** @return HasMany<Prompt, $this> */
    public function customPrompts(): HasMany
    {
        return $this->hasMany(Prompt::class);
    }

    /** "Today" in this space's timezone. / วันนี้ตามเขตเวลาของ space */
    public function today(): Carbon
    {
        return Carbon::now($this->timezone)->startOfDay();
    }

    /** @return BelongsTo<User, $this> */
    public function freezer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'frozen_by');
    }

    public function hasMember(User $user): bool
    {
        return $this->members()->whereKey($user->id)->exists();
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    public function isFrozen(): bool
    {
        return $this->status === self::STATUS_FROZEN;
    }

    public function isFull(): bool
    {
        return $this->members()->count() >= self::MAX_MEMBERS;
    }

    /** The other member, from the given user's point of view. */
    public function partnerOf(User $user): ?User
    {
        return $this->members->firstWhere('id', '!=', $user->id);
    }

    public function freeze(User $by): void
    {
        $this->forceFill([
            'status' => self::STATUS_FROZEN,
            'frozen_by' => $by->id,
            'frozen_at' => now(),
            'delete_after' => now()->addDays(self::FREEZE_DAYS),
        ])->save();

        // Pending invites must not let anyone in while frozen.
        $this->invites()->whereNull('accepted_at')->delete();
    }

    public function restore(): void
    {
        $this->forceFill([
            'status' => self::STATUS_ACTIVE,
            'frozen_by' => null,
            'frozen_at' => null,
            'delete_after' => null,
        ])->save();
    }

    /** @param Builder<Space> $query */
    public function scopeActive(Builder $query): void
    {
        $query->where('status', self::STATUS_ACTIVE);
    }

    /** @param Builder<Space> $query */
    public function scopeDueForPurge(Builder $query): void
    {
        $query->where('status', self::STATUS_FROZEN)
            ->where('delete_after', '<=', now());
    }
}
