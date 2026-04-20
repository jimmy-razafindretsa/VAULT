<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\LaravelPasskeys\Actions\GeneratePasskeyRegisterOptionsAction;
use Spatie\LaravelPasskeys\Actions\StorePasskeyAction;
use Spatie\LaravelPasskeys\Support\Config;

class PasskeyController extends Controller
{
    public function index()
    {
        return response()->json([
            'passkeys' => auth()->user()->passkeys()->select('id', 'name', 'created_at')->get(),
        ]);
    }

    public function registerOptions(Request $request)
    {
        $generatePassKeyOptionsAction = Config::getAction('generate_passkey_register_options', GeneratePasskeyRegisterOptionsAction::class);

        $options = $generatePassKeyOptionsAction->execute(auth()->user());

        session()->put('passkey-registration-options', $options);

        return response()->json(json_decode($options));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'passkey' => 'required',
        ]);

        $storePasskeyAction = Config::getAction('store_passkey', StorePasskeyAction::class);

        $options = session()->pull('passkey-registration-options');

        $storePasskeyAction->execute(
            auth()->user(),
            $request->passkey,
            $options,
            $request->getHost(),
            ['name' => $request->name]
        );

        return response()->json(['message' => 'Passkey registered successfully']);
    }

    public function destroy($id)
    {
        auth()->user()->passkeys()->where('id', $id)->delete();

        return response()->json(['message' => 'Passkey deleted successfully']);
    }
}
