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

        try {
            $storePasskeyAction = Config::getAction('store_passkey', StorePasskeyAction::class);

            $options = session()->pull('passkey-registration-options');

            if (! $options) {
                \Log::error('Passkey registration failed: Missing options in session');
                return response()->json(['message' => 'Registration session expired. Please try again.'], 422);
            }

            $storePasskeyAction->execute(
                auth()->user(),
                $request->passkey,
                $options,
                parse_url(config('app.url'), PHP_URL_HOST),
                ['name' => $request->name]
            );

            return response()->json(['message' => 'Passkey registered successfully']);
        } catch (\Exception $e) {
            \Log::error('Passkey registration failed: ' . $e->getMessage(), [
                'exception' => $e,
                'user_id' => auth()->id(),
            ]);
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        auth()->user()->passkeys()->where('id', $id)->delete();

        return response()->json(['message' => 'Passkey deleted successfully']);
    }
}
