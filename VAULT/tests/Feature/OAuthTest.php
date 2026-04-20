<?php

use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('oauth redirect works', function () {
    $response = $this->get(route('oauth.redirect', ['provider' => 'github']));

    $response->assertRedirect();
    $this->assertStringContainsString('github.com/login/oauth/authorize', $response->getTargetUrl());
});

test('oauth callback creates user and logs in', function () {
    $abstractUser = Mockery::mock(SocialiteUser::class);
    $abstractUser->shouldReceive('getId')->andReturn('12345');
    $abstractUser->shouldReceive('getEmail')->andReturn('oauth-user@example.com');
    $abstractUser->shouldReceive('getName')->andReturn('OAuth User');
    $abstractUser->shouldReceive('getNickname')->andReturn('oauthuser');
    $abstractUser->shouldReceive('getAvatar')->andReturn('https://example.com/avatar.jpg');

    $provider = Mockery::mock(\Laravel\Socialite\Contracts\Provider::class);
    $provider->shouldReceive('user')->andReturn($abstractUser);

    Socialite::shouldReceive('driver')->with('github')->andReturn($provider);

    $response = $this->get(route('oauth.callback', ['provider' => 'github']));

    $response->assertRedirect('/dashboard');
    $this->assertAuthenticated();

    $user = User::where('email', 'oauth-user@example.com')->first();
    $this->assertNotNull($user);
    $this->assertEquals('OAuth User', $user->name);
    $this->assertEquals('12345', $user->github_id);
    $this->assertEquals('https://example.com/avatar.jpg', $user->avatar_url);
    $this->assertNull($user->password);
});
