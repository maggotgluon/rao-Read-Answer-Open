<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Admin switch per theme folder: on/off + free/premium. / แอดมินเปิด-ปิดธีม และกำหนดฟรี/พรีเมียม */
class ThemeSetting extends Model
{
    protected $primaryKey = 'theme';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['theme', 'enabled', 'tier'];

    protected function casts(): array
    {
        return ['enabled' => 'boolean'];
    }
}
