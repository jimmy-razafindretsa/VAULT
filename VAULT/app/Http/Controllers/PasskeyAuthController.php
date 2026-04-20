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

        // The action itself puts it in the session (Spatie's implementation)
        // Session::flash('passkey-authentication-options', $options);

        return response()->json(json_decode($options));
    }

    public function authenticate(Request $request)
    {
        $request->validate([
            'passkey' => ['required', 'json'],
        ]);

        $findPasskeyAction = Config::getAction('find_passkey', FindPasskeyToAuthenticateAction::class);

        $passkey = $findPasskeyAction->execute(
            $request->input('passkey'),
            Session::get('passkey-authentication-options')
        );

        if (! $passkey) {
            return response()->json(['message' => 'Invalid passkey'], 422);
        }

        $user = $passkey->authenticatable;

        if (! $user) {
            return response()->json(['message' => 'User not found'], 422);
        }

        auth()->login($user, $request->boolean('remember'));

        Session::regenerate();

        return response()->json(['message' => 'Authenticated successfully']);
    }
}
