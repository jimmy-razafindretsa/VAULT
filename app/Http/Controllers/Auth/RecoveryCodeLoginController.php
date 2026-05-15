<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RecoveryCodeLoginController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'recovery_code' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! $user->two_factor_recovery_codes) {
            return back()->withErrors([
                'recovery_code' => 'The provided recovery code or email was incorrect.',
            ]);
        }

        $validCode = false;
        $codes = json_decode(decrypt($user->two_factor_recovery_codes), true) ?: [];

        foreach ($codes as $code) {
            if (hash_equals($code, $request->recovery_code) || password_verify($request->recovery_code, $code)) {
                $validCode = true;
                break;
            }
        }

        if ($validCode) {
            $user->replaceRecoveryCode($request->recovery_code);

            Auth::login($user);

            $request->session()->regenerate();

            return redirect()->intended('/dashboard');
        }

        return back()->withErrors([
            'recovery_code' => 'The provided recovery code or email was incorrect.',
        ]);
    }
}
