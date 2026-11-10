<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $space_id
 * @property int $prompt_id
 * @property Carbon $date
 * @property string $slot
 */
class DailyPrompt extends Model
{
    /** Days you may still answer after the day itself (today + 6 earlier days = 7). */
    public const LATE_DAYS = 6;

    /** main = the day's prompt (streak); bonus = admin's extra when the couple had their own. */
    public const MAIN = 'main';

    public const BONUS = 'bonus';

    protected $fillable = ['space_id', 'prompt_id', 'date', 'slot'];

    protected function casts(): array
    {
        return ['date' => 'date'];
    }

    /** @return BelongsTo<Space, $this> */
    public function space(): BelongsTo
    {
        return $this->belongsTo(Space::class);
    }

    /** @return BelongsTo<Prompt, $this> */
    public function prompt(): BelongsTo
    {
        return $this->belongsTo(Prompt::class);
    }

    /** @return HasMany<Answer, $this> */
    public function answers(): HasMany
    {
        return $this->hasMany(Answer::class);
    }

    /** @return HasMany<PromptRating, $this> */
    public function ratings(): HasMany
    {
        return $this->hasMany(PromptRating::class);
    }

    /** Still inside the 7-day answer window (space's local time)? */
    public function isOpen(): bool
    {
        $today = Carbon::now($this->space->timezone)->startOfDay();
        $day = Carbon::parse($this->date->toDateString(), $this->space->timezone);

        return $day->lte($today) && $day->gte($today->copy()->subDays(self::LATE_DAYS));
    }

    /** @return HasMany<LetterReply, $this> */
    public function replies(): HasMany
    {
        return $this->hasMany(LetterReply::class)->oldest();
    }
}
