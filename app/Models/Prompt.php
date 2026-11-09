<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A question or quest. Library items have space_id = null; couple-written ones belong to a space.
 * คำถามหรือภารกิจ ของคลังกลาง (space_id = null) หรือที่คู่เขียนเอง
 *
 * @property int $id
 * @property string|null $key
 * @property int|null $space_id
 * @property int|null $created_by
 * @property string $kind
 * @property string|null $tag
 * @property string|null $text_th
 * @property string|null $text_en
 * @property bool $active
 */
class Prompt extends Model
{
    public const KIND_QUESTION = 'question';

    public const KIND_QUEST = 'quest';

    public const KINDS = [self::KIND_QUESTION, self::KIND_QUEST];

    public const TAGS = ['fun', 'deep', 'memory', 'future'];

    protected $fillable = ['key', 'space_id', 'created_by', 'kind', 'tag', 'text_th', 'text_en', 'active'];

    protected function casts(): array
    {
        return ['active' => 'boolean'];
    }

    /** @return BelongsTo<User, $this> */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** @return HasMany<DailyPrompt, $this> */
    public function dailyUses(): HasMany
    {
        return $this->hasMany(DailyPrompt::class);
    }

    /** Text in the wanted locale, falling back to the other language. */
    public function textFor(string $locale): string
    {
        return ($locale === 'en' ? ($this->text_en ?: $this->text_th) : ($this->text_th ?: $this->text_en)) ?? '';
    }

    /** @param Builder<Prompt> $query */
    public function scopeLibrary(Builder $query): void
    {
        $query->whereNull('space_id')->where('active', true);
    }
}
