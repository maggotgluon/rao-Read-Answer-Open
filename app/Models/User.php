<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string $locale
 * @property Carbon|null $birthday
 * @property bool $show_age
 * @property string $theme
 * @property array<string, bool>|null $notify
 * @property string $morning_at
 * @property string $evening_at
 * @property bool $is_admin
 * @property bool $share_location
 * @property float|null $loc_lat
 * @property float|null $loc_lng
 * @property string|null $loc_city
 * @property string|null $loc_tz
 * @property Carbon|null $loc_at
 * @property Carbon|null $last_seen_at
 * @property Carbon|null $delete_at
 * @property Carbon|null $analytics_consent_at
 * @property Carbon|null $sensitive_consent_at
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'password', 'locale', 'birthday', 'show_age', 'theme', 'notify', 'morning_at', 'evening_at', 'share_location'])]
// Location stays server-side (only distance/city/time are shown to partners).
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token', 'loc_lat', 'loc_lng', 'loc_at', 'last_seen_at', 'delete_at', 'analytics_consent_at', 'sensitive_consent_at'])]
class User extends Authenticatable implements MustVerifyEmail, PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /** Push types a user can switch off. / ประเภทแจ้งเตือนที่ปิดได้ */
    public const NOTIFY_TYPES = ['morning', 'evening', 'partner_answered', 'nudges', 'replies', 'partner_moment', 'moment_activity', 'dates'];

    /** Days between asking to delete and deleting. / จำนวนวันก่อนลบจริง */
    public const DELETE_GRACE_DAYS = 7;

    public function wants(string $type): bool
    {
        return (bool) ($this->notify[$type] ?? true);
    }

    /** @return array<string, bool> */
    public function notifyPrefs(): array
    {
        return collect(self::NOTIFY_TYPES)->mapWithKeys(fn ($t) => [$t => $this->wants($t)])->all();
    }

    public function analyticsOn(): bool
    {
        return $this->analytics_consent_at !== null;
    }

    /** @return HasMany<PushSubscription, $this> */
    public function pushSubscriptions(): HasMany
    {
        return $this->hasMany(PushSubscription::class);
    }

    /** @return BelongsToMany<Space, $this> */
    public function spaces(): BelongsToMany
    {
        return $this->belongsToMany(Space::class, 'space_members')
            ->withPivot('joined_at')
            ->withTimestamps();
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'birthday' => 'date:Y-m-d',
            'show_age' => 'boolean',
            'notify' => 'array',
            'is_admin' => 'boolean',
            'share_location' => 'boolean',
            'loc_lat' => 'float',
            'loc_lng' => 'float',
            'loc_at' => 'datetime',
            'last_seen_at' => 'datetime',
            'delete_at' => 'datetime',
            'analytics_consent_at' => 'datetime',
            'sensitive_consent_at' => 'datetime',
        ];
    }
}
