import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { login, register } from '@/routes';
import docs from '@/routes/docs';


// ─── Particle canvas ──────────────────────────────────────────────────────────
interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    opacity: number;
}

function ParticleCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouse = useRef({ x: -9999, y: -9999 });
    const animId = useRef<number>(0);
    const particles = useRef<Particle[]>([]);

    const PARTICLE_COUNT = 90;
    const MAX_DIST = 160;
    const MOUSE_REPEL = 120;
    const SPEED = 0.28;

    const init = useCallback((w: number, h: number) => {
        particles.current = Array.from({ length: PARTICLE_COUNT }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * SPEED,
            vy: (Math.random() - 0.5) * SPEED,
            radius: Math.random() * 1.5 + 0.5,
            opacity: Math.random() * 0.5 + 0.3,
        }));
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            init(canvas.width, canvas.height);
        };

        resize();
        window.addEventListener('resize', resize);

        const onMouse = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        };
        canvas.addEventListener('mousemove', onMouse);
        canvas.addEventListener('mouseleave', () => { mouse.current = { x: -9999, y: -9999 }; });

        const draw = () => {
            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);

            const ps = particles.current;

            // Move
            for (const p of ps) {
                // Mouse repulsion
                const dx = p.x - mouse.current.x;
                const dy = p.y - mouse.current.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MOUSE_REPEL) {
                    const force = (MOUSE_REPEL - dist) / MOUSE_REPEL;
                    p.vx += (dx / dist) * force * 0.6;
                    p.vy += (dy / dist) * force * 0.6;
                }

                // Damping
                p.vx *= 0.97;
                p.vy *= 0.97;

                // Clamp speed
                const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                if (spd > 2) { p.vx = (p.vx / spd) * 2; p.vy = (p.vy / spd) * 2; }

                p.x += p.vx;
                p.y += p.vy;

                // Wrap
                if (p.x < 0) p.x = w;
                if (p.x > w) p.x = 0;
                if (p.y < 0) p.y = h;
                if (p.y > h) p.y = 0;
            }

            // Draw connections
            for (let i = 0; i < ps.length; i++) {
                for (let j = i + 1; j < ps.length; j++) {
                    const dx = ps[i].x - ps[j].x;
                    const dy = ps[i].y - ps[j].y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < MAX_DIST) {
                        const alpha = (1 - d / MAX_DIST) * 0.18;
                        ctx.beginPath();
                        ctx.moveTo(ps[i].x, ps[i].y);
                        ctx.lineTo(ps[j].x, ps[j].y);
                        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                }
            }

            // Draw dots
            for (const p of ps) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
                ctx.fill();
            }

            // Draw mouse glow
            const mx = mouse.current.x;
            const my = mouse.current.y;
            if (mx > 0 && mx < w) {
                const grd = ctx.createRadialGradient(mx, my, 0, mx, my, MOUSE_REPEL * 1.2);
                grd.addColorStop(0, 'rgba(255,255,255,0.04)');
                grd.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.arc(mx, my, MOUSE_REPEL * 1.2, 0, Math.PI * 2);
                ctx.fill();
            }

            animId.current = requestAnimationFrame(draw);
        };

        draw();
        return () => {
            cancelAnimationFrame(animId.current);
            window.removeEventListener('resize', resize);
            canvas.removeEventListener('mousemove', onMouse);
        };
    }, [init]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ display: 'block' }}
        />
    );
}

// ─── Mouse parallax hook ──────────────────────────────────────────────────────
function useMouseParallax() {
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            setOffset({
                x: (e.clientX - cx) / cx,
                y: (e.clientY - cy) / cy,
            });
        };
        window.addEventListener('mousemove', handler);
        return () => window.removeEventListener('mousemove', handler);
    }, []);

    return offset;
}

// ─── Pre-computed SVG ring ticks (stable across SSR + client) ─────────────────
const RING_TICKS = Array.from({ length: 36 }, (_, i) => {
    const angle = (i * 10 * Math.PI) / 180;
    const r1 = 122;
    const r2 = i % 3 === 0 ? 115 : 119;
    const isMajor = i % 3 === 0;
    return {
        x1: +(150 + r1 * Math.cos(angle)).toFixed(4),
        y1: +(150 + r1 * Math.sin(angle)).toFixed(4),
        x2: +(150 + r2 * Math.cos(angle)).toFixed(4),
        y2: +(150 + r2 * Math.sin(angle)).toFixed(4),
        isMajor,
    };
});

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({
    number,
    title,
    description,
    href,
    accent = false,
}: {
    number: string;
    title: string;
    description: string;
    href: string;
    accent?: boolean;
}) {
    return (
        <Link
            href={href}
            className="group border-t border-white/10 py-10 flex gap-8 hover:border-white/30 transition-colors duration-500 cursor-pointer"
        >
            <span className="text-[10px] tracking-[0.2em] text-white/25 font-mono mt-1 shrink-0 w-8">{number}</span>
            <div className="flex-1 min-w-0">
                <h3
                    className="text-2xl font-light tracking-tight mb-3 transition-colors duration-300"
                    style={{ color: accent ? '#C9A84C' : 'white' }}
                >
                    {title}
                </h3>
                <p className="text-sm text-white/40 leading-relaxed max-w-sm">{description}</p>
            </div>
            <div className="shrink-0 self-start mt-2">
                <span className="text-[10px] tracking-[0.15em] text-white/20 uppercase group-hover:text-white/50 transition-colors duration-300">
                    VIEW →
                </span>
            </div>
        </Link>
    );
}

// ─── Stat item ────────────────────────────────────────────────────────────────
function Stat({ value, label }: { value: string; label: string }) {
    return (
        <div className="border-l border-white/10 pl-8">
            <div className="text-4xl font-thin tracking-tight text-white mb-1">{value}</div>
            <div className="text-[11px] tracking-[0.15em] text-white/30 uppercase">{label}</div>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const parallax = useMouseParallax();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <>
            <Head title="VAULT — Secure your future">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:300,400,500,600"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-[#080808] text-white font-['Instrument_Sans',sans-serif] overflow-x-hidden">

                {/* ── NAV ──────────────────────────────────────────────── */}
                <header
                    className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
                    style={{
                        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
                        background: scrolled ? 'rgba(8,8,8,0.85)' : 'transparent',
                        backdropFilter: scrolled ? 'blur(12px)' : 'none',
                    }}
                >
                    <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <img
                                src="/logo-transparent.png"
                                alt="VAULT"
                                className="w-8 h-8 object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                                
                                draggable={false}
                            />
                            <span className="text-sm tracking-[0.15em] font-bold text-white/80 group-hover:text-white transition-colors uppercase">
                                VAULT
                            </span>
                        </Link>

                        {/* Nav links */}
                        <nav className="hidden md:flex items-center gap-10">
                            {['Security', 'Features', 'Pricing'].map((item) => (
                                <a
                                    key={item}
                                    href={`#${item.toLowerCase()}`}
                                    className="text-[11px] tracking-[0.15em] text-white/40 hover:text-white/80 transition-colors uppercase"
                                >
                                    {item}
                                </a>
                            ))}
                        </nav>

                        {/* Auth */}
                        <div className="flex items-center gap-4">
                            <Link
                                href={login()}
                                className="text-[11px] tracking-[0.12em] text-white/40 hover:text-white/70 transition-colors uppercase"
                            >
                                Log in
                            </Link>
                            {canRegister && (
                                <Link
                                    href={register()}
                                    className="text-[11px] tracking-[0.12em] border border-white/20 hover:border-white/50 px-5 py-2.5 transition-all duration-300 uppercase hover:bg-white/5"
                                >
                                    Get started
                                </Link>
                            )}
                        </div>
                    </div>
                </header>

                {/* ── HERO ─────────────────────────────────────────────── */}
                <section className="relative min-h-screen flex flex-col justify-center overflow-hidden" id="hero">
                    {/* Interactive particle field */}
                    <div className="absolute inset-0">
                        <ParticleCanvas />
                    </div>

                    {/* Vignette */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background:
                                'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 0%, #080808 75%)',
                        }}
                    />

                    {/* Massive Watermark Logo */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 pointer-events-none opacity-[0.03]">
                        <img
                            src="/logo-transparent.png"
                            alt="Watermark"
                            className="w-[80vw] h-[80vw] max-w-[1200px] max-h-[1200px] object-contain"
                            draggable={false}
                        />
                    </div>

                    {/* Content — mouse parallax */}
                    <div
                        className="relative z-10 max-w-7xl mx-auto px-8 pt-32 pb-24"
                        style={{
                            transform: `translate(${parallax.x * -8}px, ${parallax.y * -8}px)`,
                            transition: 'transform 0.12s ease-out',
                        }}
                    >
                        {/* Eyebrow */}
                        <div className="flex items-center gap-4 mb-12">
                            <div className="w-8 h-px bg-white/30" />
                            <span className="text-[10px] tracking-[0.3em] text-white/30 uppercase font-mono">
                                Enterprise Security
                            </span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-[clamp(3rem,8vw,8rem)] font-thin leading-[0.92] tracking-tight mb-8 max-w-5xl">
                            <span className="block text-white">Your digital</span>
                            <span className="block text-white/20">vault.</span>
                        </h1>

                        <p className="text-[13px] text-white/30 leading-relaxed max-w-sm mb-14 tracking-wide">
                            Protecting you from the most hostile place on earth —
                            <span className="text-white/50"> the internet.</span>
                        </p>

                        <div className="flex items-center gap-6">
                            {canRegister && (
                                <Link
                                    href={register()}
                                    className="group flex items-center gap-3 bg-white text-[#080808] px-7 py-3.5 text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-white/90 transition-all duration-300"
                                >
                                    Open an account
                                    <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                                </Link>
                            )}
                            <Link
                                href={login()}
                                className="text-[11px] tracking-[0.15em] text-white/30 hover:text-white/60 transition-colors uppercase"
                            >
                                Sign in
                            </Link>
                        </div>
                    </div>

                    {/* Scroll indicator */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
                        <div
                            className="w-px bg-white/20"
                            style={{
                                height: '48px',
                                animation: 'scrollPulse 2s ease-in-out infinite',
                            }}
                        />
                        <span className="text-[9px] tracking-[0.3em] text-white/20 uppercase">Scroll</span>
                    </div>
                </section>

                {/* ── STATS BAR ────────────────────────────────────────── */}
                <section className="border-y border-white/6 bg-[#0d0d0d]">
                    <div className="max-w-7xl mx-auto px-8 py-14 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0">
                        <Stat value="256-bit" label="Encryption" />
                        <Stat value="99.99%" label="Uptime SLA" />
                        <Stat value="< 80ms" label="Auth latency" />
                        <Stat value="SOC 2" label="Compliance" />
                    </div>
                </section>

                {/* ── FEATURES ─────────────────────────────────────────── */}
                <section className="max-w-7xl mx-auto px-8 py-32" id="features">
                    {/* Section header */}
                    <div className="mb-20">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-4 h-px bg-white/30" />
                            <span className="text-[10px] tracking-[0.3em] text-white/30 uppercase font-mono">/A</span>
                        </div>
                        <h2 className="text-[clamp(2rem,5vw,4rem)] font-thin leading-tight tracking-tight text-white">
                            What we<br />
                            <span className="text-white/20">protect against.</span>
                        </h2>
                    </div>

                    {/* Feature list */}
                    <div>
                        <FeatureCard
                            number="01"
                            title="Passkey Authentication"
                            description="Biometric login. Phishing-resistant, stored on-device."
                            href={docs.passkeys.url()}
                            accent={true}
                        />
                        <FeatureCard
                            number="02"
                            title="Two-Factor Enforcement"
                            description="TOTP with recovery codes. No SMS. No compromises."
                            href={docs.twoFactor.url()}
                        />
                        <FeatureCard
                            number="03"
                            title="Social Login"
                            description="GitHub and Google. One click, zero friction."
                            href={docs.socialLogin.url()}
                        />
                        <FeatureCard
                            number="04"
                            title="Token Management"
                            description="Scoped OAuth2 tokens. Rotate. Revoke. Control."
                            href={docs.tokens.url()}
                        />
                    </div>
                </section>

                {/* ── SECURITY SHOWCASE ─────────────────────────────────── */}
                <section className="border-y border-white/6 bg-[#0d0d0d] py-32" id="security">
                    <div className="max-w-7xl mx-auto px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">

                            {/* Left: abstract SVG visual */}
                            <div className="relative flex items-center justify-center" style={{ minHeight: '380px' }}>
                                {/* Rotating outer ring */}
                                <svg
                                    viewBox="0 0 300 300"
                                    className="absolute w-full max-w-[320px]"
                                    style={{ animation: 'spinSlow 24s linear infinite' }}
                                >
                                    {/* Dashed ring */}
                                    <circle
                                        cx="150" cy="150" r="130"
                                        fill="none"
                                        stroke="rgba(255,255,255,0.07)"
                                        strokeWidth="1"
                                        strokeDasharray="4 8"
                                    />
                                    {/* Tick marks — pre-computed to avoid hydration mismatch */}
                                    {RING_TICKS.map((t, i) => (
                                        <line
                                            key={i}
                                            x1={t.x1}
                                            y1={t.y1}
                                            x2={t.x2}
                                            y2={t.y2}
                                            stroke={t.isMajor ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.15)'}
                                            strokeWidth={t.isMajor ? '1.5' : '0.8'}
                                        />
                                    ))}
                                </svg>

                                {/* Middle ring counter-rotate */}
                                <svg
                                    viewBox="0 0 300 300"
                                    className="absolute w-full max-w-[260px]"
                                    style={{ animation: 'spinSlow 18s linear infinite reverse' }}
                                >
                                    <circle
                                        cx="150" cy="150" r="100"
                                        fill="none"
                                        stroke="rgba(255,255,255,0.05)"
                                        strokeWidth="1"
                                        strokeDasharray="2 12"
                                    />
                                </svg>

                                {/* Static center hexagon */}
                                <svg viewBox="0 0 120 120" className="relative w-28 h-28">
                                    <polygon
                                        points="60,8 104,34 104,86 60,112 16,86 16,34"
                                        fill="none"
                                        stroke="rgba(255,255,255,0.15)"
                                        strokeWidth="1"
                                    />
                                    <polygon
                                        points="60,22 92,40 92,80 60,98 28,80 28,40"
                                        fill="none"
                                        stroke="rgba(201,168,76,0.3)"
                                        strokeWidth="0.8"
                                    />
                                    {/* Shield icon center */}
                                    <path
                                        d="M60 35 L75 42 L75 58 C75 68 60 76 60 76 C60 76 45 68 45 58 L45 42 Z"
                                        fill="none"
                                        stroke="rgba(255,255,255,0.6)"
                                        strokeWidth="1.2"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M54 56 L58 60 L67 51"
                                        fill="none"
                                        stroke="rgba(201,168,76,0.9)"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>

                                {/* Corner labels */}
                                {[
                                    { label: 'AES-256', x: '5%', y: '8%' },
                                    { label: 'WebAuthn', x: '68%', y: '8%' },
                                    { label: 'OAuth2', x: '5%', y: '88%' },
                                    { label: 'TOTP', x: '72%', y: '88%' },
                                ].map(({ label, x, y }) => (
                                    <span
                                        key={label}
                                        className="absolute text-[9px] tracking-[0.2em] text-white/20 font-mono uppercase"
                                        style={{ left: x, top: y }}
                                    >
                                        {label}
                                    </span>
                                ))}
                            </div>

                            {/* Right: copy */}
                            <div>
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-4 h-px bg-white/30" />
                                    <span className="text-[10px] tracking-[0.3em] text-white/30 uppercase font-mono">/B</span>
                                </div>
                                <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-thin leading-tight tracking-tight text-white mb-8">
                                    Zero-trust<br />
                                    <span style={{ color: '#C9A84C' }}>by design.</span>
                                </h2>
                                <p className="text-sm text-white/30 leading-relaxed mb-10 max-w-xs">
                                    Every threat neutralized before it reaches you.
                                </p>

                                <div className="space-y-4">
                                    {[
                                        'Encrypted sessions',
                                        'Hardware-backed passkeys',
                                        'Token rotation',
                                        'Rate limiting',
                                    ].map((item) => (
                                        <div key={item} className="flex items-center gap-4">
                                            <div className="w-1 h-1 rounded-full bg-white/20" />
                                            <span className="text-[11px] text-white/35 tracking-[0.08em]">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── CTA ──────────────────────────────────────────────── */}
                <section className="max-w-7xl mx-auto px-8 py-40 text-center" id="pricing">
                    <h2 className="text-[clamp(2.5rem,7vw,7rem)] font-thin leading-[0.9] tracking-tight text-white mb-14">
                        Secure everything.
                    </h2>

                    {canRegister && (
                        <Link
                            href={register()}
                            className="group inline-flex items-center gap-3 bg-white text-[#080808] px-10 py-4 text-[11px] tracking-[0.2em] uppercase font-medium hover:bg-white/90 transition-all duration-300"
                        >
                            Create your vault
                            <span className="group-hover:translate-x-1.5 transition-transform duration-300">→</span>
                        </Link>
                    )}

                    <p className="mt-8 text-[11px] tracking-[0.15em] text-white/20 uppercase">
                        Free forever — this one's on me.
                    </p>
                </section>

                {/* ── FOOTER ───────────────────────────────────────────── */}
                <footer className="border-t border-white/6 py-10">
                    <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <img
                                src="/logo-transparent.png"
                                alt="VAULT"
                                className="w-5 h-5 object-contain opacity-30"
                                
                                draggable={false}
                            />
                            <span className="text-[10px] tracking-[0.2em] text-white/20 uppercase font-bold">VAULT</span>
                        </div>
                        <span className="text-[10px] tracking-[0.1em] text-white/15">
                            © {new Date().getFullYear()} — All rights reserved
                        </span>
                        <div className="flex items-center gap-6">
                            {['Privacy', 'Terms', 'Security'].map((item) => (
                                <a
                                    key={item}
                                    href="#"
                                    className="text-[10px] tracking-[0.15em] text-white/20 hover:text-white/50 transition-colors uppercase"
                                >
                                    {item}
                                </a>
                            ))}
                        </div>
                    </div>
                </footer>

                {/* ── Global keyframes ──────────────────────────────────── */}
                <style>{`
                    @keyframes scrollPulse {
                        0%, 100% { opacity: 0.15; transform: scaleY(1); }
                        50% { opacity: 0.5; transform: scaleY(1.3); transform-origin: top; }
                    }
                    @keyframes spinSlow {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </>
    );
}
