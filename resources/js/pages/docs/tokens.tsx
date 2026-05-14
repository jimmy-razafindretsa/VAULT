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

export default function TokensDoc() {
    return (
        <DocsLayout
            title="Token Management"
            description="Issue, scope, and revoke access keys for apps and integrations — without sharing your password."
            sections={SECTIONS}
        >
            <DocSection id="what-is-it" title="What is it?">
                <DocParagraph>
                    An API token is a long string of characters that acts like a temporary,
                    limited access pass. Instead of giving an app your username and password,
                    you give it a token that only works for specific things — and that you can
                    cancel at any time.
                </DocParagraph>
                <DocParagraph>
                    Think of it like a valet key for a car. A valet can drive your car
                    to the parking spot, but they can't open the glove compartment or your trunk.
                    Same car, but limited access. And if you don't trust the valet anymore,
                    you take the key back.
                </DocParagraph>
                <DocCallout label="In plain English" accent>
                    Tokens let you give apps permission to do specific things on your behalf —
                    without ever handing over your actual credentials.
                    You can always take that permission back.
                </DocCallout>
            </DocSection>

            <DocSection id="how-it-works" title="How it works">
                <DocParagraph>
                    Vault uses OAuth 2.0 — a secure standard for issuing and managing access tokens.
                    When you create a token, you choose what it's allowed to do (called "scopes").
                    A token with a "read" scope can only read data — it can't change or delete anything.
                    A token with no scope can't do anything useful.
                </DocParagraph>
                <DocParagraph>
                    Each token is cryptographically signed. Vault can verify at any moment that a
                    token is genuine, hasn't expired, and hasn't been revoked. Tokens are never
                    stored in plaintext — only a secure hash is kept, similar to how passwords are stored.
                </DocParagraph>
                <DocList
                    items={[
                        'Scopes limit what each token can do — compromise one token, lose only that access.',
                        'Tokens can have expiry dates — they become useless after a set time automatically.',
                        'Revocation is instant — one click in your dashboard and the token stops working globally.',
                        'Rotation is supported — you can swap to a new token without downtime.',
                        'Vault logs every token action — you can see exactly when and how each token was used.',
                    ]}
                />
            </DocSection>

            <DocSection id="inside-vault" title="Inside Vault">
                <DocParagraph>
                    From your Vault dashboard, you can create personal access tokens — useful for
                    scripts, integrations, or third-party tools that need to act on your behalf.
                    Each token is given a name (so you remember what it's for), a scope, and
                    optionally an expiry date.
                </DocParagraph>
                <DocParagraph>
                    The token value is shown to you exactly once, at creation. Vault doesn't store it
                    in a way that's retrievable — this is by design. Copy it immediately and store
                    it securely. If you lose it, you generate a new one. The old one can be revoked
                    in one click.
                </DocParagraph>
                <DocCallout label="Token security">
                    Vault shows each token's value only once, at creation. This is intentional —
                    not a limitation. It means even if someone gains access to your account later,
                    they can't see tokens that were already created.
                </DocCallout>
            </DocSection>

            <DocSection id="what-it-protects" title="What it protects you from">
                <DocParagraph>
                    The token model is designed so that a breach of any one integration doesn't
                    cascade into a full account compromise. Each token is its own blast radius.
                    Rotate, revoke, limit — you control the exposure at every level.
                </DocParagraph>
                <DocList
                    items={[
                        'Credential sharing — you never have to give an app your actual password.',
                        'Over-permissioned access — scopes ensure integrations can only do exactly what they need.',
                        'Stale access — expiry dates mean forgotten integrations lose access automatically.',
                        'Lateral movement — compromising one token cannot be used to escalate to full account access.',
                        'Supply chain attacks — a compromised third-party tool can only damage what its token allows.',
                    ]}
                />
                <ThreatBadge threats={['Credential sharing', 'Supply chain attacks', 'Stale access', 'Over-permissioned integrations', 'Token leaks']} />
            </DocSection>
        </DocsLayout>
    );
}
