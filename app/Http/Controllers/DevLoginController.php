<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\DevTools;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

/** One-click login as a demo account (local dev only). / ล็อกอินเดโมคลิกเดียว (เฉพาะ local) */
class DevLoginController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        abort_unless(DevTools::enabled(), 404);

        $data = $request->validate([
            'email' => ['required', Rule::in(array_column(DevTools::demoAccounts(), 'email'))],
        ]);

        $user = User::where('email', $data['email'])->first();
        abort_unless($user, 404, 'Demo account missing — run: php artisan migrate:fresh --seed');

        Auth::login($user, remember: true);
        $request->session()->regenerate();

        return redirect()->route('dashboard');
    }
}
