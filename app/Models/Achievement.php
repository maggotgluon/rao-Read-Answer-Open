<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** One earned stamp of a space. / แสตมป์ความสำเร็จของพื้นที่ */
class Achievement extends Model
{
    public $timestamps = false;

    protected $fillable = ['space_id', 'key', 'earned_at', 'seen_by'];

    protected function casts(): array
    {
        return ['earned_at' => 'datetime', 'seen_by' => 'array'];
    }

    public function seenBy(User $user): bool
    {
        return in_array($user->id, $this->seen_by ?? [], true);
    }
}
