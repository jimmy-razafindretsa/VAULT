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

// Four thresholds: < 40 → Very Weak, 40-59 → Weak, 60-79 → Good, ≥ 80 → Strong
function getStrength(entropy: number): {
    label: string;
    segments: number; // 1-4 lit segments
    color: string;    // tailwind inline colour
} {
    if (entropy >= 80) return { label: 'Strong',    segments: 4, color: '#c9a84c' }; // gold
    if (entropy >= 60) return { label: 'Good',      segments: 3, color: 'rgba(255,255,255,0.55)' };
    if (entropy >= 40) return { label: 'Weak',      segments: 2, color: 'rgba(255,255,255,0.3)' };
    return              { label: 'Very Weak',  segments: 1, color: 'rgba(255,80,80,0.6)' };
}

export default function PasswordEntropyBar({ password = '' }: Props) {
    const entropy  = useMemo(() => calculateEntropy(password), [password]);
    const strength = useMemo(() => getStrength(entropy), [entropy]);

    if (!password) return null;

    return (
        <div className="mt-3 space-y-2">
            {/* Four-segment bar */}
            <div className="flex gap-1">
                {[1, 2, 3, 4].map((seg) => (
                    <div
                        key={seg}
                        className="h-[3px] flex-1 rounded-full transition-all duration-400"
                        style={{
                            background: seg <= strength.segments
                                ? strength.color
                                : 'rgba(255,255,255,0.07)',
                        }}
                    />
                ))}
            </div>

            {/* Label row */}
            <div className="flex items-center justify-between">
                <span
                    className="text-[10px] tracking-[0.15em] uppercase transition-colors duration-300"
                    style={{ color: strength.color }}
                >
                    {strength.label}
                </span>
                <span className="text-[10px] font-mono text-white/20">
                    {Math.round(entropy)} bits
                </span>
            </div>
        </div>
    );
}
