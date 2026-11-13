<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** One switch of long-distance mode. / การเปลี่ยนโหมดไกลกันหนึ่งครั้ง */
class SpaceModeChange extends Model
{
    public $timestamps = false;

    protected $fillable = ['space_id', 'long_distance', 'changed_by', 'changed_at'];

    protected function casts(): array
    {
        return ['long_distance' => 'boolean', 'changed_at' => 'datetime'];
    }

    public function space(): BelongsTo
    {
        return $this->belongsTo(Space::class);
    }
}
