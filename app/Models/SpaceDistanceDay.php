<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** How far apart a couple was on one day (km, rounded to 10). / ระยะห่างของวันนั้น */
class SpaceDistanceDay extends Model
{
    protected $fillable = ['space_id', 'date', 'km'];

    protected function casts(): array
    {
        return ['date' => 'date:Y-m-d', 'km' => 'integer'];
    }
}
