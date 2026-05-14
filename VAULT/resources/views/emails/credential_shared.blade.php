<x-mail::message>
# You've received a service!

**{{ $share->sender->name }}** has securely shared their **{{ $share->name }}** credentials with you.

To accept this credential and add it to your personal vault, click the secure link below:

<x-mail::button :url="route('shares.accept', ['token' => $share->token])">
Accept Service
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
