<?php

use App\Http\Controllers\OAuthController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::get('/auth/{provider}/redirect', [OAuthController::class, 'redirect'])
    ->name('oauth.redirect');

Route::get('/auth/{provider}/callback', [OAuthController::class, 'callback'])
    ->name('oauth.callback');

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

// Documentation pages
Route::inertia('/docs/passkeys', 'docs/passkeys')->name('docs.passkeys');
Route::inertia('/docs/two-factor', 'docs/two-factor')->name('docs.two-factor');
Route::inertia('/docs/social-login', 'docs/social-login')->name('docs.social-login');
Route::inertia('/docs/tokens', 'docs/tokens')->name('docs.tokens');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [App\Http\Controllers\CredentialController::class, 'index'])->name('dashboard');
    Route::post('credentials', [App\Http\Controllers\CredentialController::class, 'store'])->name('credentials.store');
    Route::put('credentials/{credential}', [App\Http\Controllers\CredentialController::class, 'update'])->name('credentials.update');
    Route::delete('credentials/{credential}', [App\Http\Controllers\CredentialController::class, 'destroy'])->name('credentials.destroy');

    Route::post('credentials/{credential}/share', [App\Http\Controllers\ShareCredentialController::class, 'store'])->name('shares.store');
    Route::get('shares/accept/{token}', [App\Http\Controllers\ShareCredentialController::class, 'accept'])->name('shares.accept');

    Route::get('passkeys', [App\Http\Controllers\PasskeyController::class, 'index'])->name('passkeys.index');
    Route::get('passkeys/register-options', [App\Http\Controllers\PasskeyController::class, 'registerOptions'])->name('passkeys.register_options');
    Route::post('passkeys', [App\Http\Controllers\PasskeyController::class, 'store'])->name('passkeys.store');
    Route::delete('passkeys/{id}', [App\Http\Controllers\PasskeyController::class, 'destroy'])->name('passkeys.destroy');
});

Route::get('passkeys/authentication-options', [App\Http\Controllers\PasskeyAuthController::class, 'authenticationOptions'])->name('passkeys.authentication_options');
Route::post('passkeys/authenticate', [App\Http\Controllers\PasskeyAuthController::class, 'authenticate'])->name('passkeys.login');

Route::post('/login/recovery-code', [App\Http\Controllers\Auth\RecoveryCodeLoginController::class, 'store'])->name('login.recovery_code');

require __DIR__.'/settings.php';
