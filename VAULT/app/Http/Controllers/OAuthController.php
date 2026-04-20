<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

class OAuthController extends Controller
{
    /**
     * Redirect the user to the provider authentication page.
     */
    public function redirect(string $provider): RedirectResponse
    {
        return Socialite::driver($provider)->redirect();
    }

    /**
     * Obtain the user information from the provider.
     */
    public function callback(string $provider): RedirectResponse
    {
        try {
            $socialUser = Socialite::driver($provider)->user();
        } catch (\Exception $e) {
            \Log::error('OAuth failed: ' . $e->getMessage());
            return redirect()->route('login')->withErrors(['oauth' => 'Authentication failed.']);
        }

        $user = User::updateOrCreate([
            'email' => $socialUser->getEmail(),
        ], [
            'name' => $socialUser->getName() ?? $socialUser->getNickname(),
            $provider . '_id' => $socialUser->getId(),
            'avatar_url' => $socialUser->getAvatar(),
            'email_verified_at' => now(),
            // Ensure password is not required for OAuth users if it's already set
            // but we need to satisfy the database if it was somehow not nullable (it is now)
        ]);

        Auth::login($user);

        return redirect()->intended(route('dashboard', false));
    }
}
