<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * A day the admin adds for everyone (e.g. Valentine's, Songkran). Shown in every space.
 * วันพิเศษที่แอดมินเพิ่ม แสดงในทุก space
 *
 * @property int $id
 * @property Carbon $date
 * @property string|null $title_th
 * @property string|null $title_en
 * @property string|null $emoji
 * @property bool $repeats_yearly
 * @property bool $active
 */
class SpecialDay extends Model
{
    protected $fillable = ['date', 'title_th', 'title_en', 'emoji', 'icon', 'repeats_yearly', 'active'];

    protected function casts(): array
    {
        return ['date' => 'date', 'repeats_yearly' => 'boolean', 'active' => 'boolean'];
    }

    public function titleFor(string $locale): string
    {
        $t = $locale === 'en' ? ($this->title_en ?: $this->title_th) : ($this->title_th ?: $this->title_en);

        // A picture (icon) replaces the old emoji prefix. / ใช้ภาพแทนอีโมจิ
        return trim(($this->emoji && ! $this->icon ? $this->emoji.' ' : '').($t ?? ''));
    }
}
