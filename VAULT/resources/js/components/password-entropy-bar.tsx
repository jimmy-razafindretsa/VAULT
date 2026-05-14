import { useMemo } from 'react';

interface Props {
    password?: string;
}

export function calculateEntropy(password: string): number {
    if (!password) return 0;
    let poolSize = 0;
    if (/[a-z]/.test(password)) poolSize += 26;
    if (/[A-Z]/.test(password)) poolSize += 26;
    if (/[0-9]/.test(password)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

    if (poolSize === 0) return 0;
    return password.length * Math.log2(poolSize);
}

interface Strength {
    label: string;
    segments: number;
    color: string;
    glow: string;
}

// Four thresholds: < 40 → Very Weak, 40–59 → Weak, 60–79 → Good, ≥ 80 → Strong
function getStrength(entropy: number): Strength {
    if (entropy >= 80) return { label: 'Strong',    segments: 4, color: '#c9a84c', glow: 'rgba(201,168,76,0.35)' };
    if (entropy >= 60) return { label: 'Good',      segments: 3, color: 'rgba(255,255,255,0.60)', glow: 'rgba(255,255,255,0.12)' };
    if (entropy >= 40) return { label: 'Fair',      segments: 2, color: 'rgba(255,255,255,0.35)', glow: 'transparent' };
    return              { label: 'Weak',      segments: 1, color: 'rgba(255,90,90,0.70)',  glow: 'rgba(255,60,60,0.18)' };
}

export default function PasswordEntropyBar({ password = '' }: Props) {
    const entropy  = useMemo(() => calculateEntropy(password), [password]);
    const strength = useMemo(() => getStrength(entropy), [entropy]);

    if (!password) return null;

    return (
        <div
            className="mt-2.5 space-y-2"
            style={{ animation: 'entropyFadeIn 0.18s ease both' }}
        >
            <style>{`
                @keyframes entropyFadeIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* Four-segment bar */}
            <div className="flex gap-[3px]">
                {[1, 2, 3, 4].map((seg) => {
                    const active = seg <= strength.segments;
                    return (
                        <div
                            key={seg}
                            className="h-[2.5px] flex-1 rounded-full"
                            style={{
                                background: active ? strength.color : 'rgba(255,255,255,0.06)',
                                boxShadow: active && strength.glow !== 'transparent'
                                    ? `0 0 6px 0 ${strength.glow}`
                                    : 'none',
                                transition: 'background 0.35s ease, box-shadow 0.35s ease',
                            }}
                        />
                    );
                })}
            </div>

            {/* Label row */}
            <div className="flex items-center justify-between">
                <span
                    className="text-[9.5px] tracking-[0.18em] uppercase font-medium"
                    style={{
                        color: strength.color,
                        transition: 'color 0.35s ease',
                    }}
                >
                    {strength.label}
                </span>
                <span className="text-[9.5px] font-mono tabular-nums text-white/18">
                    {Math.round(entropy)} bits
                </span>
            </div>
        </div>
    );
}
