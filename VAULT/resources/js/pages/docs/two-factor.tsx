import DocsLayout from '@/layouts/docs-layout';
import {
    DocSection,
    DocParagraph,
    DocCallout,
    DocList,
    ThreatBadge,
} from '@/components/docs-components';

const SECTIONS = [
    { id: 'what-is-it', title: 'What is it?' },
    { id: 'how-it-works', title: 'How it works' },
    { id: 'inside-vault', title: 'Inside Vault' },
    { id: 'what-it-protects', title: 'What it protects you from' },
];

export default function TwoFactorDoc() {
    return (
        <DocsLayout
            title="Two-Factor Enforcement"
            description="A second lock on your front door. Even if someone steals your password, they still can't get in without the second key."
            sections={SECTIONS}
        >
            <DocSection id="what-is-it" title="What is it?">
                <DocParagraph>
                    Two-factor authentication — often called 2FA — means you need two separate things
                    to prove who you are. The first is something you know (your password). The second
                    is something you physically have (your phone, generating a fresh code every 30 seconds).
                </DocParagraph>
                <DocParagraph>
                    Even if someone gets your password — from a breach at another site, from spying
                    over your shoulder, from any trick at all — they still can't log in without that
                    second code. And that code expires in 30 seconds, on your device only.
                </DocParagraph>
                <DocCallout label="In plain English" accent>
                    Your password is the key to your front door. 2FA is a deadbolt that only opens
                    when your phone is physically in the room. Both are needed. One isn't enough.
                </DocCallout>
            </DocSection>

            <DocSection id="how-it-works" title="How it works">
                <DocParagraph>
                    Vault uses TOTP — Time-based One-Time Passwords. When you enable 2FA, you scan
                    a QR code with an authenticator app (like Google Authenticator, Authy, or 1Password).
                    Your phone and Vault share a secret key at that moment.
                </DocParagraph>
                <DocParagraph>
                    From that point on, your app uses that shared secret and the current time to
                    calculate a 6-digit code. Vault independently calculates the same code.
                    If they match — and the code is less than 30 seconds old — you're authenticated.
                    No internet connection required on your phone. No SMS to intercept.
                </DocParagraph>
                <DocList
                    items={[
                        'The code changes every 30 seconds — an expired code is useless.',
                        'It doesn\'t use SMS, which is vulnerable to SIM-swapping attacks.',
                        'Recovery codes are generated at setup — keep them somewhere safe for emergencies.',
                        'Works offline. Your authenticator app doesn\'t need a signal to generate the code.',
                    ]}
                />
            </DocSection>

            <DocSection id="inside-vault" title="Inside Vault">
                <DocParagraph>
                    You enable 2FA from Settings → Security. Vault will show you a QR code — scan it
                    with any authenticator app. You'll be asked to confirm with one live code before
                    it's activated, so you know your app is synced correctly.
                </DocParagraph>
                <DocParagraph>
                    Once active, every login after your password will ask for a 6-digit code from
                    your app. Vault also gives you a set of single-use recovery codes — download
                    and store them somewhere safe. If you ever lose your phone, a recovery code
                    is your emergency exit.
                </DocParagraph>
                <DocCallout label="Recovery codes">
                    Each recovery code can only be used once. After that it's gone. Vault shows
                    them to you once at setup — treat them like a spare house key hidden somewhere safe.
                </DocCallout>
            </DocSection>

            <DocSection id="what-it-protects" title="What it protects you from">
                <DocParagraph>
                    2FA is the single most effective thing you can add to any account. Even with
                    your password fully compromised, an attacker still cannot access your account
                    without your physical device in hand, in real time.
                </DocParagraph>
                <DocList
                    items={[
                        'Password theft — stolen passwords are useless without the second factor.',
                        'Database breaches — hackers who crack your password hash from a breach still can\'t log in.',
                        'Keyloggers — even if malware captures your password as you type, it can\'t capture a code that expires in seconds.',
                        'Remote attacks — anyone trying to break in from the internet hits a wall they cannot cross remotely.',
                    ]}
                />
                <ThreatBadge threats={['Password theft', 'Keyloggers', 'Database breaches', 'Remote attacks', 'SIM swapping']} />
            </DocSection>
        </DocsLayout>
    );
}
