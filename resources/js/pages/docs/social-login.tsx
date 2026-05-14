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

export default function SocialLoginDoc() {
    return (
        <DocsLayout
            title="Social Login"
            description="Sign in with GitHub or Google. One click, no new password to forget."
            sections={SECTIONS}
        >
            <DocSection id="what-is-it" title="What is it?">
                <DocParagraph>
                    Social login lets you use an account you already have — like Google or GitHub —
                    to sign into Vault. You don't create a new password. Instead, you're
                    redirected to Google or GitHub, you confirm it's really you there, and they
                    tell Vault "yes, this person is who they say they are." You're in.
                </DocParagraph>
                <DocParagraph>
                    Think of it like a hotel that accepts your national ID instead of asking you
                    to create a new membership card. You trust the ID issuer. The hotel trusts
                    the ID issuer. No new card needed.
                </DocParagraph>
                <DocCallout label="In plain English" accent>
                    You've already proven who you are to Google or GitHub. Vault just asks them
                    to vouch for you. One less password to remember — and one less password to lose.
                </DocCallout>
            </DocSection>

            <DocSection id="how-it-works" title="How it works">
                <DocParagraph>
                    When you click "Continue with Google," Vault redirects you to Google's login page.
                    Google asks for your credentials (or recognizes you're already logged in).
                    Google then sends Vault a secure, signed message saying who you are. Vault
                    creates or links your account. You never share your Google password with Vault.
                </DocParagraph>
                <DocParagraph>
                    This is called OAuth — it's a standard protocol used by thousands of apps.
                    The key insight is that Vault never receives your Google or GitHub password.
                    The providers only share limited information: your email and name.
                    Nothing else crosses over.
                </DocParagraph>
                <DocList
                    items={[
                        'Your Google or GitHub password is never shared with Vault.',
                        'Vault only receives your email and display name — nothing more.',
                        'If you revoke Vault\'s access in Google settings, your account is immediately disconnected.',
                        'You can connect multiple providers to the same Vault account.',
                    ]}
                />
            </DocSection>

            <DocSection id="inside-vault" title="Inside Vault">
                <DocParagraph>
                    On the login and register pages, you'll see buttons for GitHub and Google.
                    Clicking either one will take you through the provider's own login process.
                    If an account with your email already exists in Vault, it's automatically linked.
                    If not, a new account is created on the spot.
                </DocParagraph>
                <DocParagraph>
                    Once linked, you can log in with either social provider or a passkey — whichever
                    is most convenient. If you later want to set a traditional password, you can
                    do that in Security settings without needing a "current password" since you
                    never had one.
                </DocParagraph>
                <DocCallout label="Setting a password later">
                    If you signed up with Google and later want to add a traditional password,
                    go to Settings → Security → Password. Since you don't have an existing password,
                    Vault will first verify it's you via your connected provider before letting you set one.
                </DocCallout>
            </DocSection>

            <DocSection id="what-it-protects" title="What it protects you from">
                <DocParagraph>
                    Social login moves the authentication responsibility to providers who have
                    invested billions in security infrastructure. Google and GitHub have sophisticated
                    fraud detection, anomaly detection, and account recovery systems that would be
                    impossible to replicate independently.
                </DocParagraph>
                <DocList
                    items={[
                        'Password fatigue — no new password means one less weak password in the world.',
                        'Vault-side breaches — because you have no password in Vault\'s database, there\'s nothing to leak.',
                        'Account takeover — your Google account\'s protections (2FA, device history) protect your Vault access.',
                        'Phishing for Vault credentials — there are no Vault credentials to phish.',
                    ]}
                />
                <ThreatBadge threats={['Password reuse', 'Credential stuffing', 'Vault-side breaches', 'Weak passwords']} />
            </DocSection>
        </DocsLayout>
    );
}
