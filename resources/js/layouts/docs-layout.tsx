import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';

export interface DocSection {
    id: string;
    title: string;
}

export interface DocsLayoutProps {
    title: string;
    description: string;
    sections: DocSection[];
    children: React.ReactNode;
}

const NAV_ITEMS = [
    { label: 'Passkey Authentication', href: '/docs/passkeys', slug: 'passkeys' },
    { label: 'Two-Factor Enforcement', href: '/docs/two-factor', slug: 'two-factor' },
    { label: 'Social Login', href: '/docs/social-login', slug: 'social-login' },
    { label: 'Token Management', href: '/docs/tokens', slug: 'tokens' },
];

export default function DocsLayout({ title, description, sections, children }: DocsLayoutProps) {
    const [activeSection, setActiveSection] = useState<string>('');
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    // Track which section is in view for sidebar highlight
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                }
            },
            { rootMargin: '-20% 0px -70% 0px' }
        );

        sections.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [sections]);

    const { url } = usePage();
    const currentSlug = url.split('/').pop() ?? '';

    return (
        <>
            <Head title={`${title} — Vault Docs`}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:300,400,500,600"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-[#080808] text-white font-['Instrument_Sans',sans-serif]">

                {/* ── TOP NAV ── */}
                <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/6 bg-[#080808]/95 backdrop-blur-sm">
                    <div className="flex h-14 items-center px-6 gap-6">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
                            <AppLogoIcon className="w-5 h-5 fill-white/70 group-hover:fill-white transition-colors" />
                            <span className="text-[11px] tracking-[0.15em] text-white/50 group-hover:text-white/80 transition-colors uppercase">
                                Vault
                            </span>
                        </Link>

                        <div className="w-px h-4 bg-white/10" />

                        <span className="text-[11px] tracking-[0.1em] text-white/30 uppercase">
                            Documentation
                        </span>

                        {/* Mobile menu button */}
                        <button
                            className="ml-auto md:hidden text-white/40 hover:text-white/70 transition-colors"
                            onClick={() => setMobileNavOpen(!mobileNavOpen)}
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M2 4h12v1H2V4zm0 4h12v1H2V8zm0 4h12v1H2v-1z" />
                            </svg>
                        </button>

                        {/* Desktop right nav */}
                        <div className="hidden md:flex items-center gap-6 ml-auto">
                            <Link
                                href="/"
                                className="text-[11px] tracking-[0.1em] text-white/30 hover:text-white/60 transition-colors uppercase"
                            >
                                ← Back to Vault
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="flex pt-14">
                    {/* ── LEFT SIDEBAR ── */}
                    <aside
                        className={`
                            fixed top-14 left-0 bottom-0 w-64 border-r border-white/6
                            bg-[#080808] overflow-y-auto z-40 transition-transform duration-300
                            ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                        `}
                    >
                        <nav className="py-8 px-6">
                            {/* Section label */}
                            <div className="mb-6">
                                <span className="text-[9px] tracking-[0.3em] text-white/20 uppercase font-mono">
                                    Security Features
                                </span>
                            </div>

                            {/* Feature nav */}
                            <ul className="space-y-1 mb-10">
                                {NAV_ITEMS.map((item) => {
                                    const isActive = currentSlug === item.slug;
                                    return (
                                        <li key={item.slug}>
                                            <Link
                                                href={item.href}
                                                className={`
                                                    block text-[12px] tracking-wide py-2 px-3 transition-all duration-200
                                                    border-l-2 hover:text-white/80
                                                    ${isActive
                                                        ? 'border-white/60 text-white/80 bg-white/4'
                                                        : 'border-transparent text-white/35 hover:border-white/20'
                                                    }
                                                `}
                                                onClick={() => setMobileNavOpen(false)}
                                            >
                                                {item.label}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>

                            {/* On this page */}
                            {sections.length > 0 && (
                                <>
                                    <div className="mb-4">
                                        <span className="text-[9px] tracking-[0.3em] text-white/20 uppercase font-mono">
                                            On this page
                                        </span>
                                    </div>
                                    <ul className="space-y-1">
                                        {sections.map((section) => (
                                            <li key={section.id}>
                                                <a
                                                    href={`#${section.id}`}
                                                    className={`
                                                        block text-[11px] tracking-wide py-1.5 px-3 transition-all duration-200
                                                        border-l-2
                                                        ${activeSection === section.id
                                                            ? 'border-[#C9A84C]/60 text-[#C9A84C]/80'
                                                            : 'border-transparent text-white/25 hover:text-white/50 hover:border-white/15'
                                                        }
                                                    `}
                                                    onClick={() => setMobileNavOpen(false)}
                                                >
                                                    {section.title}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </nav>
                    </aside>

                    {/* Mobile overlay */}
                    {mobileNavOpen && (
                        <div
                            className="fixed inset-0 z-30 bg-black/60 md:hidden"
                            onClick={() => setMobileNavOpen(false)}
                        />
                    )}

                    {/* ── MAIN CONTENT ── */}
                    <main className="flex-1 min-w-0 md:ml-64">
                        {/* Page header */}
                        <div className="border-b border-white/6 px-10 py-14">
                            <div className="max-w-2xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-4 h-px bg-white/25" />
                                    <span className="text-[9px] tracking-[0.3em] text-white/25 uppercase font-mono">
                                        Vault Docs
                                    </span>
                                </div>
                                <h1 className="text-4xl font-thin tracking-tight text-white mb-4">
                                    {title}
                                </h1>
                                <p className="text-[13px] text-white/40 leading-relaxed">
                                    {description}
                                </p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-10 py-12 max-w-2xl">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
