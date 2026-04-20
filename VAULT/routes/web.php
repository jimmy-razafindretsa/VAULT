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
});

require __DIR__.'/settings.php';
