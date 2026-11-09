<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Private 👍/👎 — only admin stats use it, the partner never sees it. / คะแนนส่วนตัว */
class PromptRating extends Model
{
    protected $fillable = ['daily_prompt_id', 'user_id', 'value'];

    /** @return BelongsTo<DailyPrompt, $this> */
    public function dailyPrompt(): BelongsTo
    {
        return $this->belongsTo(DailyPrompt::class);
    }
}
