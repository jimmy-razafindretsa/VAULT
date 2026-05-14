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

export default function PasskeysDoc() {
    return (
        <DocsLayout
            title="Passkey Authentication"
            description="Log in with your fingerprint, face, or a hardware key. No password to steal, no code to type."
            sections={SECTIONS}
        >
            <DocSection id="what-is-it" title="What is it?">
                <DocParagraph>
                    A passkey is a way to log in without a password. Instead of typing a secret combination
                    of letters and numbers that you need to remember (and that someone else can steal),
                    a passkey uses something that only your device can do — verify it's really you.
                </DocParagraph>
                <DocParagraph>
                    On a phone, that might mean scanning your fingerprint or your face. On a laptop, it
                    might be a fingerprint reader or Windows Hello. On a security key like a YubiKey,
                    you just plug it in and touch a button. That's it. No passwords involved.
                </DocParagraph>
                <DocCallout label="In plain English" accent>
                    Imagine your front door uses a fingerprint scanner instead of a key.
                    No key means nothing to lose, copy, or steal. Passkeys work the same way for your account.
                </DocCallout>
            </DocSection>

            <DocSection id="how-it-works" title="How it works">
                <DocParagraph>
                    When you register a passkey, your device creates two linked codes: one that stays
                    privately on your device (never shared with anyone), and one that Vault stores.
                    Think of them like a lock and key — the private one is your key, the stored one
                    is just the lock.
                </DocParagraph>
                <DocParagraph>
                    When you log in, Vault sends your device a small puzzle. Your device uses your
                    private key to solve it — but only after you verify who you are (fingerprint, face,
                    or PIN). Vault checks the answer. If it's right, you're in. The private key
                    never leaves your device.
                </DocParagraph>
                <DocList
                    items={[
                        'Your private key never leaves your phone or laptop — Vault never sees it.',
                        'The process happens in a fraction of a second.',
                        'It follows the WebAuthn standard, backed by Apple, Google, and Microsoft.',
                        'Each passkey is tied to a specific website — it can\'t be tricked into working on a fake site.',
                    ]}
                />
            </DocSection>

            <DocSection id="inside-vault" title="Inside Vault">
                <DocParagraph>
                    In your Vault security settings, you can register one or more passkeys. Each passkey
                    is labeled with the device that created it, so you always know what's authorized.
                    You can remove any passkey at any time — instantly revoking access from that device.
                </DocParagraph>
                <DocParagraph>
                    On the login page, instead of typing your email and password, you can tap
                    "Log in with Passkey." Vault will prompt your registered device, and you're in
                    with a single gesture. If you have multiple passkeys registered (e.g., your
                    phone and your laptop), either one works.
                </DocParagraph>
                <DocCallout label="How to set it up">
                    Go to Settings → Security → Passkeys, then click "Add passkey." Your device will
                    guide you through a quick one-time setup. Done.
                </DocCallout>
            </DocSection>

            <DocSection id="what-it-protects" title="What it protects you from">
                <DocParagraph>
                    Passkeys solve the most common ways accounts get taken over. Because there's no
                    password, there's nothing to guess, leak, or steal from a database breach.
                    Because they're tied to the exact website, fake login pages are completely useless.
                </DocParagraph>
                <DocList
                    items={[
                        'Phishing — fake login pages get you nothing because the passkey only works on the real Vault site.',
                        'Password breaches — there is no password in Vault\'s database to steal.',
                        'Credential stuffing — attackers reusing leaked passwords from other sites can\'t touch your account.',
                        'Weak passwords — there are none. A passkey is cryptographically stronger than any password you could invent.',
                    ]}
                />
                <ThreatBadge threats={['Phishing', 'Data breaches', 'Credential stuffing', 'Password reuse', 'Brute force']} />
            </DocSection>
        </DocsLayout>
    );
}
