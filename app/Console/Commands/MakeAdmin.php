<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

/** php artisan rao:admin mag@example.com [--revoke] */
class MakeAdmin extends Command
{
    protected $signature = 'rao:admin {email} {--revoke}';

    protected $description = 'Give (or remove) admin access to the prompt library / ให้สิทธิ์แอดมิน';

    public function handle(): int
    {
        $user = User::where('email', $this->argument('email'))->first();
        if (! $user) {
            $this->error('No user with that email.');

            return self::FAILURE;
        }

        $user->forceFill(['is_admin' => ! $this->option('revoke')])->save();
        $this->info($user->email.($user->is_admin ? ' is now an admin.' : ' is no longer an admin.'));

        return self::SUCCESS;
    }
}
