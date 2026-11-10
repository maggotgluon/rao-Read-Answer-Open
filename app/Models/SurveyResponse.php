<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Voluntary in-app survey answer (shown ~14 days after sign-up). / แบบสอบถามในแอป */
class SurveyResponse extends Model
{
    public const DAY14 = 'day14';

    public const UPDATED_AT = null;

    protected $fillable = ['user_id', 'survey', 'score', 'liked', 'change'];
}
