<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** A short reply under a day's opened letters. / ตอบกลับใต้จดหมายที่เปิดแล้ว */
class LetterReply extends Model
{
    protected $fillable = ['daily_prompt_id', 'user_id', 'body'];

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<DailyPrompt, $this> */
    public function dailyPrompt(): BelongsTo
    {
        return $this->belongsTo(DailyPrompt::class);
    }
}
