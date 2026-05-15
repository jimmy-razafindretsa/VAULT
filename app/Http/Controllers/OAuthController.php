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
    public function callback(string $provider, \Illuminate\Http\Request $request): RedirectResponse
    {
        try {
            $socialUser = Socialite::driver($provider)->user();
        } catch (\Exception $e) {
            \Log::error('OAuth failed: ' . $e->getMessage());
            return redirect()->route('login')->withErrors(['oauth' => 'Authentication failed.']);
        }

        if (Auth::check()) {
            $currentUser = Auth::user();
            
            if ($currentUser->{$provider . '_id'} === $socialUser->getId() || 
                $currentUser->email === $socialUser->getEmail()) {
                
                if (empty($currentUser->{$provider . '_id'})) {
                    $currentUser->update([$provider . '_id' => $socialUser->getId()]);
                }

                $request->session()->put('auth.password_confirmed_at', time());

                return redirect()->intended('/dashboard');
            } else {
                return redirect()->route('password.confirm')->withErrors([
                    'oauth' => 'Please authenticate with the correct ' . ucfirst($provider) . ' account to confirm your identity.'
                ]);
            }
        }

        $user = User::where('email', $socialUser->getEmail())->first();

        if ($user) {
            // If the provider is not linked yet, force the user to log in to verify their identity.
            if (empty($user->{$provider . '_id'})) {
                $request->session()->put('pending_oauth_link', [
                    'email' => $socialUser->getEmail(),
                    'provider' => $provider,
                    'id' => $socialUser->getId(),
                ]);

                return redirect()->route('login')->withErrors([
                    'email' => 'An account with this email already exists. Please log in with your password to verify your identity and link your ' . ucfirst($provider) . ' account.',
                ]);
            }
            
            // If the provider IS linked, check if 2FA is enabled
            if (method_exists($user, 'hasEnabledTwoFactorAuthentication') && $user->hasEnabledTwoFactorAuthentication()) {
                $request->session()->put([
                    'login.id' => $user->getKey(),
                    'login.remember' => false,
                ]);

                return redirect()->route('two-factor.login');
            }
        } else {
            // Create new user
            $user = User::create([
                'email' => $socialUser->getEmail(),
                'name' => $socialUser->getName() ?? $socialUser->getNickname(),
                $provider . '_id' => $socialUser->getId(),
                'avatar_url' => $socialUser->getAvatar(),
                'email_verified_at' => now(),
            ]);
        }

        Auth::login($user);

        return redirect()->intended('/dashboard');
    }
}
