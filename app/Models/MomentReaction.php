<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $moment_id
 * @property int $user_id
 * @property string $emoji
 */
class MomentReaction extends Model
{
    public const EMOJIS = ['❤️', '😂', '🥹', '😍', '🔥', '🫶'];

    protected $fillable = ['moment_id', 'user_id', 'emoji'];
}
