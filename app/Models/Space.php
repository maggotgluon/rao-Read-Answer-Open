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
 * @property bool $premium
 * @property bool $long_distance
 */
class Space extends Model
{
    /** @use HasFactory<SpaceFactory> */
    use HasFactory, HasUlids;

    public const MAX_MEMBERS = 2;

    public const FREEZE_DAYS = 30;

    public const STATUS_ACTIVE = 'active';

    public const STATUS_FROZEN = 'frozen';

    protected $fillable = ['name', 'timezone', 'created_by'];

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
            'premium' => 'boolean',
            'long_distance' => 'boolean',
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
    protected static function booted(): void
    {
        // Every timeline starts with the mode the space was created in. / เริ่มบันทึกโหมดตั้งแต่สร้าง
        static::created(fn (Space $s) => $s->modeChanges()->create([
            'long_distance' => (bool) $s->long_distance, 'changed_at' => now(),
        ]));
    }

    /** @return HasMany<Place, $this> */
    public function places(): HasMany
    {
        return $this->hasMany(Place::class);
    }

    /** @return HasMany<SpaceModeChange, $this> */
    public function modeChanges(): HasMany
    {
        return $this->hasMany(SpaceModeChange::class);
    }

    /** @return HasMany<SpaceDistanceDay, $this> */
    public function distanceDays(): HasMany
    {
        return $this->hasMany(SpaceDistanceDay::class);
    }

    /**
     * Switch long-distance mode and log it (no row when nothing changes).
     * เปลี่ยนโหมดไกลกันและบันทึกไว้
     */
    public function setLongDistance(bool $on, ?User $by = null): void
    {
        if ((bool) $this->long_distance === $on && $this->modeChanges()->exists()) {
            return;
        }
        $this->forceFill(['long_distance' => $on])->save();
        $this->modeChanges()->create(['long_distance' => $on, 'changed_by' => $by?->id, 'changed_at' => now()]);
    }

    public function moments(): HasMany
    {
        return $this->hasMany(Moment::class);
    }

    /** @return HasMany<SpaceEvent, $this> */
    public function events(): HasMany
    {
        return $this->hasMany(SpaceEvent::class);
    }

    public function anniversary(): ?SpaceEvent
    {
        return $this->events()->where('kind', SpaceEvent::ANNIVERSARY)->first();
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
