<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use App\Support\DevTools;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => $input['password'],
            'locale' => app()->getLocale(),
        ]);

        // Dev only: mark verified so no email is needed (the verification
        // listener skips users who are already verified).
        // เฉพาะ dev: ถือว่ายืนยันอีเมลแล้ว จึงไม่ส่งอีเมลยืนยัน
        if (DevTools::enabled()) {
            $user->forceFill(['email_verified_at' => now()])->save();
        }

        return $user;
    }
}
