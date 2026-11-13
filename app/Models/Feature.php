<?php

namespace App\Models;

use App\Support\Features;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $key
 * @property bool $enabled
 * @property string $tier
 */
class Feature extends Model
{
    protected $primaryKey = 'key';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['key', 'enabled', 'tier'];

    protected static function booted(): void
    {
        static::saved(fn () => Features::flush());
        static::deleted(fn () => Features::flush());
    }

    protected function casts(): array
    {
        return ['enabled' => 'boolean'];
    }
}
