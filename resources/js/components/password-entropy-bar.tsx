import { useMemo } from 'react';

interface Props { password?: string; }

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

function getStrength(entropy: number): { label: string; segments: number; color: string; glow: string } {
    if (entropy >= 80) return { label: 'Strong', segments: 4, color: '#c9a84c', glow: 'rgba(201,168,76,0.3)' };
    if (entropy >= 60) return { label: 'Good',   segments: 3, color: 'oklch(0.55 0 0)',  glow: 'transparent' };
    if (entropy >= 40) return { label: 'Fair',   segments: 2, color: 'oklch(0.6 0 0)',   glow: 'transparent' };
    return                    { label: 'Weak',   segments: 1, color: 'oklch(0.55 0.2 25)', glow: 'rgba(220,60,60,0.2)' };
}

export default function PasswordEntropyBar({ password = '' }: Props) {
    const entropy  = useMemo(() => calculateEntropy(password), [password]);
    const strength = useMemo(() => getStrength(entropy), [entropy]);
    if (!password) return null;

    return (
        <div className="mt-2.5 space-y-1.5" style={{ animation: 'entropyFadeIn 0.18s ease both' }}>
            <style>{`@keyframes entropyFadeIn{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:translateY(0)}}`}</style>
            <div className="flex gap-[3px]">
                {[1,2,3,4].map(seg => {
                    const active = seg <= strength.segments;
                    return (
                        <div key={seg} className="h-[2.5px] flex-1 rounded-full"
                            style={{
                                background: active ? strength.color : 'var(--color-border)',
                                boxShadow: active && strength.glow !== 'transparent' ? `0 0 5px ${strength.glow}` : 'none',
                                transition: 'background 0.3s ease, box-shadow 0.3s ease',
                            }} />
                    );
                })}
            </div>
            <div className="flex items-center justify-between">
                <span className="text-[10px] tracking-[0.15em] uppercase font-medium"
                    style={{ color: strength.color, transition: 'color 0.3s ease' }}>
                    {strength.label}
                </span>
                <span className="text-[10px] font-mono tabular-nums text-muted-foreground">
                    {Math.round(entropy)} bits
                </span>
            </div>
        </div>
    );
}
