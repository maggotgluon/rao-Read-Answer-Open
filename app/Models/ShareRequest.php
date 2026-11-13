<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** "May I share this?" from one partner to the other. / ขออนุญาตแชร์ */
class ShareRequest extends Model
{
    public const PENDING = 'pending';

    public const ALLOWED = 'allowed';

    public const DECLINED = 'declined';

    /** An OK covers this one item for this long. / อนุญาตครั้งเดียว ใช้ได้กี่วัน */
    public const ALLOW_DAYS = 7;

    /** After "Not now", asking again waits this long. / หลัง "ยังไม่ตอนนี้" รอก่อนขอใหม่ */
    public const ASK_AGAIN_HOURS = 24;

    protected $fillable = ['space_id', 'requester_id', 'owner_id', 'item_type', 'item_id', 'status', 'decided_at'];

    protected function casts(): array
    {
        return ['decided_at' => 'datetime'];
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }
}
