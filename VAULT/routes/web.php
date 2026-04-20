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

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::get('passkeys', [App\Http\Controllers\PasskeyController::class, 'index'])->name('passkeys.index');
    Route::get('passkeys/register-options', [App\Http\Controllers\PasskeyController::class, 'registerOptions'])->name('passkeys.register_options');
    Route::post('passkeys', [App\Http\Controllers\PasskeyController::class, 'store'])->name('passkeys.store');
    Route::delete('passkeys/{id}', [App\Http\Controllers\PasskeyController::class, 'destroy'])->name('passkeys.destroy');
});

Route::get('passkeys/authentication-options', [App\Http\Controllers\PasskeyAuthController::class, 'authenticationOptions'])->name('passkeys.authentication_options');
Route::post('passkeys/authenticate', [App\Http\Controllers\PasskeyAuthController::class, 'authenticate'])->name('passkeys.login');


require __DIR__.'/settings.php';
