<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Admin-chosen question/quest for a date. It becomes the day's prompt; if the couple
 * queued their own, both show and the admin one is a bonus (doesn't affect the streak).
 * คำถามที่แอดมินกำหนดให้วันนั้น ถ้าคู่มีคำถามของตัวเอง จะแสดงทั้งคู่ (ของแอดมินเป็นโบนัส)
 *
 * @property int $id
 * @property Carbon $date
 * @property int $prompt_id
 * @property string $audience
 */
class ScheduledPrompt extends Model
{
    public const AUDIENCES = ['all', 'long_distance', 'together'];

    protected $fillable = ['date', 'prompt_id', 'audience', 'created_by'];

    protected function casts(): array
    {
        return ['date' => 'date'];
    }

    /** @return BelongsTo<Prompt, $this> */
    public function prompt(): BelongsTo
    {
        return $this->belongsTo(Prompt::class);
    }

    /** @param Builder<ScheduledPrompt> $query */
    public function scopeFor(Builder $query, Space $space, Carbon $date): void
    {
        $query->whereDate('date', $date->toDateString())
            ->whereIn('audience', ['all', $space->long_distance ? 'long_distance' : 'together']);
    }
}
