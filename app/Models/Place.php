<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** A place that matters to the couple (no coordinates). / สถานที่สำคัญของคู่ (ไม่เก็บพิกัด) */
class Place extends Model
{
    /** Order = how they're grouped. Picture: places.<kind> / ลำดับการแสดง */
    public const KINDS = ['met', 'first_date', 'home', 'trip', 'food', 'other'];

    public const MAX_PER_SPACE = 200;

    protected $fillable = ['space_id', 'created_by', 'name', 'kind', 'city', 'note', 'date'];

    protected function casts(): array
    {
        return ['date' => 'date:Y-m-d'];
    }

    public function space(): BelongsTo
    {
        return $this->belongsTo(Space::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function moments(): HasMany
    {
        return $this->hasMany(Moment::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(SpaceEvent::class);
    }
}
