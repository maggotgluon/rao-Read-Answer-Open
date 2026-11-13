<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $daily_prompt_id
 * @property int $user_id
 * @property string $body
 */
class Answer extends Model
{
    protected $fillable = ['daily_prompt_id', 'user_id', 'body'];

    /** @return BelongsTo<DailyPrompt, $this> */
    public function dailyPrompt(): BelongsTo
    {
        return $this->belongsTo(DailyPrompt::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
