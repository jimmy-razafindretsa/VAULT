<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Spatie\LaravelPasskeys\Actions\FindPasskeyToAuthenticateAction;
use Spatie\LaravelPasskeys\Actions\GeneratePasskeyAuthenticationOptionsAction;
use Spatie\LaravelPasskeys\Support\Config;

class PasskeyAuthController extends Controller
{
    public function authenticationOptions()
    {
        $action = Config::getAction('generate_passkey_authentication_options', GeneratePasskeyAuthenticationOptionsAction::class);

        $options = $action->execute();

        // Ensure it's in the session with a longer-lived key if flash fails us
        session()->put('passkey-authentication-options', $options);

        return response()->json(json_decode($options));
    }

    public function authenticate(Request $request)
    {
        $request->validate([
            'passkey' => ['required', 'json'],
        ]);

        try {
            $findPasskeyAction = Config::getAction('find_passkey', FindPasskeyToAuthenticateAction::class);

            $options = session()->get('passkey-authentication-options');

            if (! $options) {
                \Log::error('Passkey authentication failed: Missing options in session');
                return response()->json(['message' => 'Authentication session expired. Please try again.'], 422);
            }

            $passkey = $findPasskeyAction->execute(
                $request->input('passkey'),
                $options
            );

            if (! $passkey) {
                return response()->json(['message' => 'Invalid passkey or validation failed'], 422);
            }

            $user = $passkey->authenticatable;

            if (! $user) {
                return response()->json(['message' => 'User not found'], 422);
            }

            auth()->login($user, $request->boolean('remember'));

            Session::regenerate();
            session()->forget('passkey-authentication-options');

            return response()->json(['message' => 'Authenticated successfully']);
        } catch (\Exception $e) {
            \Log::error('Passkey authentication failed: ' . $e->getMessage(), [
                'exception' => $e,
            ]);
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}
