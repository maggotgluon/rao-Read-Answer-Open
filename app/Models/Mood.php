<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** One mood stamp per person per day. / แสตมป์อารมณ์ วันละ 1 ดวงต่อคน */
class Mood extends Model
{
    /** Order = how they appear. / ลำดับที่แสดง */
    public const MOODS = [
        'happy' => '😊', 'loved' => '🥰', 'excited' => '🤩', 'calm' => '😌',
        'tired' => '😴', 'stressed' => '😣', 'sad' => '😢', 'sick' => '🤒',
    ];

    protected $fillable = ['user_id', 'date', 'mood'];

    protected function casts(): array
    {
        return ['date' => 'date:Y-m-d'];
    }
}
