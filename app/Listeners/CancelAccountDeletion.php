<?php

namespace App\Listeners;

use App\Models\User;
use Illuminate\Auth\Events\Login;
use Inertia\Inertia;

/** Signing in during the grace period cancels the deletion. / เข้าสู่ระบบ = ยกเลิกการลบ */
class CancelAccountDeletion
{
    public function handle(Login $event): void
    {
        $user = $event->user;

        if ($user instanceof User && $user->delete_at) {
            $user->forceFill(['delete_at' => null])->save();
            Inertia::flash('toast', ['type' => 'success', 'message' => __('privacy.delete_cancelled')]);
        }
    }
}
