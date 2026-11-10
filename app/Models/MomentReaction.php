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
    /**
     * Reaction keys → theme picture reactions/<key> (emoji only for push text, which can't show images).
     * ชื่อปฏิกิริยา → ภาพในธีม (อีโมจิใช้เฉพาะข้อความแจ้งเตือน)
     */
    public const REACTIONS = ['love' => '❤️', 'sweet' => '🫶', 'aww' => '🥹', 'crush' => '😍', 'yay' => '😂', 'melting' => '🔥'];

    protected $fillable = ['moment_id', 'user_id', 'emoji'];
}
