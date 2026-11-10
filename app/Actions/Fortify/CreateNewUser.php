<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use App\Services\Analytics;
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
            'analytics' => ['nullable', 'boolean'],
        ])->validate();

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => $input['password'],
            'locale' => app()->getLocale(),
        ]);

        // Optional analytics: off unless ticked at sign-up. / analytics เปิดเมื่อติ๊กยินยอมเท่านั้น
        if (filter_var($input['analytics'] ?? false, FILTER_VALIDATE_BOOLEAN)) {
            $user->forceFill(['analytics_consent_at' => now()])->save();
            Analytics::track($user, 'signed_up', ['locale' => $user->locale]);
        }

        // Dev only: mark verified so no email is needed (the verification
        // listener skips users who are already verified).
        // เฉพาะ dev: ถือว่ายืนยันอีเมลแล้ว จึงไม่ส่งอีเมลยืนยัน
        if (DevTools::enabled()) {
            $user->forceFill(['email_verified_at' => now()])->save();
        }

        return $user;
    }
}
