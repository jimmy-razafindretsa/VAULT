import { useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { calculateEntropy } from './password-entropy-bar';

interface Props { onPasswordGenerated: (password: string) => void; }

const CHARSET_LOWER   = 'abcdefghijklmnopqrstuvwxyz';
const CHARSET_UPPER   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const CHARSET_NUMBERS = '0123456789';
const CHARSET_SPECIAL = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const CHARSET_ALL     = CHARSET_LOWER + CHARSET_UPPER + CHARSET_NUMBERS + CHARSET_SPECIAL;

function generatePassword(len: number): string {
    const pass = [
        CHARSET_LOWER  [Math.floor(Math.random() * CHARSET_LOWER.length)],
        CHARSET_UPPER  [Math.floor(Math.random() * CHARSET_UPPER.length)],
        CHARSET_NUMBERS[Math.floor(Math.random() * CHARSET_NUMBERS.length)],
        CHARSET_SPECIAL[Math.floor(Math.random() * CHARSET_SPECIAL.length)],
    ];
    for (let i = 4; i < len; i++) pass.push(CHARSET_ALL[Math.floor(Math.random() * CHARSET_ALL.length)]);
    for (let i = pass.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pass[i], pass[j]] = [pass[j], pass[i]];
    }
    return pass.join('');
}

export default function PasswordGenerator({ onPasswordGenerated }: Props) {
    const [length, setLength]     = useState(20);
    const [spinning, setSpinning] = useState(false);
    const previewEntropy = Math.round(length * Math.log2(94));
    const sliderFill = ((length - 12) / (64 - 12)) * 100;

    const handleGenerate = useCallback(() => {
        onPasswordGenerated(generatePassword(length));
        setSpinning(true);
        setTimeout(() => setSpinning(false), 420);
    }, [length, onPasswordGenerated]);

    return (
        <div className="rounded-lg bg-accent border border-border px-4 py-3">
            <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">Generate</span>
                <span className="text-[10px] font-mono tabular-nums text-muted-foreground">
                    {length} chars · ~{previewEntropy} bits
                </span>
            </div>
            <div className="flex items-center gap-3">
                <div className="relative flex-1 h-5 flex items-center">
                    <div className="absolute inset-y-0 flex items-center w-full pointer-events-none">
                        <div className="w-full h-[2px] rounded-full bg-border">
                            <div className="h-full rounded-full bg-foreground/30"
                                style={{ width: `${sliderFill}%`, transition: 'width 0.1s ease' }} />
                        </div>
                    </div>
                    <style>{`
                        .vault-slider{-webkit-appearance:none;appearance:none;width:100%;background:transparent;cursor:pointer;position:relative}
                        .vault-slider::-webkit-slider-thumb{-webkit-appearance:none;width:13px;height:13px;border-radius:50%;background:var(--color-foreground);border:none;box-shadow:0 1px 4px rgba(0,0,0,0.3);transition:transform .15s ease}
                        .vault-slider:hover::-webkit-slider-thumb{transform:scale(1.15)}
                        .vault-slider::-moz-range-thumb{width:13px;height:13px;border-radius:50%;background:var(--color-foreground);border:none}
                        .vault-slider::-webkit-slider-runnable-track,.vault-slider::-moz-range-track{background:transparent}
                    `}</style>
                    <input type="range" min="12" max="64" value={length}
                        onChange={e => setLength(parseInt(e.target.value))} className="vault-slider" />
                </div>
                <button type="button" onClick={handleGenerate}
                    className="group shrink-0 flex items-center gap-1.5 border border-border hover:border-foreground/40 px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-background active:scale-95">
                    <RefreshCw className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors"
                        style={{ transform: spinning ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.42s cubic-bezier(0.4,0,0.2,1)' }} />
                    <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground group-hover:text-foreground transition-colors">
                        Generate
                    </span>
                </button>
            </div>
        </div>
    );
}
