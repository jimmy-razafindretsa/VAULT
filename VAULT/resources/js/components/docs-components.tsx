import type { ReactNode } from 'react';

// ─── Section with anchor ───────────────────────────────────────────────────────
export function DocSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
    return (
        <section id={id} className="mb-16 scroll-mt-24">
            <h2 className="text-xl font-light tracking-tight text-white/90 mb-5 border-b border-white/6 pb-4">
                {title}
            </h2>
            <div className="space-y-4">{children}</div>
        </section>
    );
}

// ─── Body text ────────────────────────────────────────────────────────────────
export function DocParagraph({ children }: { children: ReactNode }) {
    return (
        <p className="text-[13px] text-white/45 leading-[1.85] tracking-wide">
            {children}
        </p>
    );
}

// ─── Highlight callout ────────────────────────────────────────────────────────
export function DocCallout({
    label,
    children,
    accent = false,
}: {
    label?: string;
    children: ReactNode;
    accent?: boolean;
}) {
    return (
        <div
            className="border-l-2 pl-5 py-1"
            style={{ borderColor: accent ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.1)' }}
        >
            {label && (
                <span
                    className="block text-[9px] tracking-[0.25em] uppercase mb-2"
                    style={{ color: accent ? 'rgba(201,168,76,0.7)' : 'rgba(255,255,255,0.3)' }}
                >
                    {label}
                </span>
            )}
            <p className="text-[13px] leading-[1.8] text-white/50">{children}</p>
        </div>
    );
}

// ─── Simple bullet list ───────────────────────────────────────────────────────
export function DocList({ items }: { items: string[] }) {
    return (
        <ul className="space-y-2.5">
            {items.map((item) => (
                <li key={item} className="flex items-start gap-3">
                    <div className="mt-[7px] w-1 h-1 rounded-full bg-white/20 shrink-0" />
                    <span className="text-[13px] text-white/45 leading-relaxed">{item}</span>
                </li>
            ))}
        </ul>
    );
}

// ─── Threat badge row ─────────────────────────────────────────────────────────
export function ThreatBadge({ threats }: { threats: string[] }) {
    return (
        <div className="flex flex-wrap gap-2 mt-4">
            {threats.map((t) => (
                <span
                    key={t}
                    className="text-[10px] tracking-[0.1em] border border-white/10 text-white/30 px-3 py-1"
                >
                    {t}
                </span>
            ))}
        </div>
    );
}

// ─── Section divider ──────────────────────────────────────────────────────────
export function DocDivider() {
    return <div className="border-t border-white/5 my-8" />;
}
