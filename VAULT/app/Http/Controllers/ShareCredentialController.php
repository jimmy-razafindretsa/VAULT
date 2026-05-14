<?php

namespace App\Http\Controllers;

use App\Models\Credential;
use App\Models\CredentialShare;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use App\Mail\CredentialShared;

class ShareCredentialController extends Controller
{
    public function store(Request $request, Credential $credential)
    {
        // Check if the current user owns this credential
        if ($credential->user_id !== $request->user()->id) {
            abort(403);
        }

        $request->validate([
            'name' => ['required', 'string'],
        ]);

        $recipient = User::where('name', $request->name)->first();

        if (!$recipient) {
            return back()->withErrors(['name' => 'This user doesn\'t exist']);
        }

        if ($recipient->id === $request->user()->id) {
            return back()->withErrors(['name' => 'You cannot share a service with yourself']);
        }

        $share = CredentialShare::create([
            'sender_id' => $request->user()->id,
            'recipient_id' => $recipient->id,
            'name' => $credential->name,
            'url' => $credential->url,
            'account_id' => $credential->account_id,
            'password' => $credential->password,
            'notes' => $credential->notes,
            'token' => Str::random(60),
            'status' => 'pending',
        ]);

        Mail::to($recipient->email)->send(new CredentialShared($share));

        // Let the front end show a nice toast/notification. No redirects.
        return back()->with('status', 'A notification has been sent to the user to check their email for the service.');
    }

    public function accept(Request $request, $token)
    {
        $share = CredentialShare::where('token', $token)->where('status', 'pending')->firstOrFail();

        // Check if user is authenticated and is the correct recipient
        if (!$request->user() || $request->user()->id !== $share->recipient_id) {
            // Need to be logged in as the correct user
            // If they are a guest, redirect to login then redirect back here?
            // Laravel Fortify /auth doesn't easily do intended() out of the box unless we configure it.
            // But we can just use the intended middleware if needed.
            // If logged in as someone else, abort.
            if ($request->user()) {
                abort(403, 'This service was not shared with you.');
            }
            // For guests:
            return redirect()->guest(route('login'));
        }

        // Move to credentials
        $request->user()->credentials()->create([
            'name' => $share->name,
            'url' => $share->url,
            'account_id' => $share->account_id,
            'password' => $share->password, // Laravel natively decrypts from share and re-encrypts in credential via model casts
            'notes' => $share->notes,
        ]);

        $share->update(['status' => 'accepted']);

        // Redirect to dashboard where it pops up directly in the service list
        return redirect()->route('dashboard')->with('status', 'Service successfully added to your vault.');
    }
}
