<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** One stay in a city (to_date null = still there). / ช่วงที่อยู่ในเมืองหนึ่ง */
class CityVisit extends Model
{
    protected $fillable = ['user_id', 'city', 'from_date', 'to_date'];

    protected function casts(): array
    {
        return ['from_date' => 'date:Y-m-d', 'to_date' => 'date:Y-m-d'];
    }
}
