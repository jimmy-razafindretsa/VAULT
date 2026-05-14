import { useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { calculateEntropy } from './password-entropy-bar';

interface Props {
    onPasswordGenerated: (password: string) => void;
}

const CHARSET_LOWER   = 'abcdefghijklmnopqrstuvwxyz';
const CHARSET_UPPER   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const CHARSET_NUMBERS = '0123456789';
const CHARSET_SPECIAL = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const CHARSET_ALL     = CHARSET_LOWER + CHARSET_UPPER + CHARSET_NUMBERS + CHARSET_SPECIAL;

function generatePassword(len: number): string {
    // Guarantee at least one of each character class
    const pass = [
        CHARSET_LOWER  [Math.floor(Math.random() * CHARSET_LOWER.length)],
        CHARSET_UPPER  [Math.floor(Math.random() * CHARSET_UPPER.length)],
        CHARSET_NUMBERS[Math.floor(Math.random() * CHARSET_NUMBERS.length)],
        CHARSET_SPECIAL[Math.floor(Math.random() * CHARSET_SPECIAL.length)],
    ];
    for (let i = 4; i < len; i++) {
        pass.push(CHARSET_ALL[Math.floor(Math.random() * CHARSET_ALL.length)]);
    }
    // Fisher–Yates shuffle
    for (let i = pass.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pass[i], pass[j]] = [pass[j], pass[i]];
    }
    return pass.join('');
}

export default function PasswordGenerator({ onPasswordGenerated }: Props) {
    const [length, setLength]   = useState(20);
    const [spinning, setSpinning] = useState(false);

    // Theoretical entropy for the full charset (~94 chars)
    const previewEntropy = Math.round(length * Math.log2(94));

    // Slider fill percentage
    const sliderFill = ((length - 12) / (64 - 12)) * 100;

    const handleGenerate = useCallback(() => {
        onPasswordGenerated(generatePassword(length));
        // Brief spin animation
        setSpinning(true);
        setTimeout(() => setSpinning(false), 420);
    }, [length, onPasswordGenerated]);

    return (
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] px-4 py-3.5">
            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] tracking-[0.28em] text-white/25 uppercase">
                    Generate
                </span>
                <span
                    className="text-[9.5px] font-mono tabular-nums text-white/20"
                    style={{ transition: 'color 0.2s' }}
                >
                    {length} chars · ~{previewEntropy} bits
                </span>
            </div>

            {/* Slider + button row */}
            <div className="flex items-center gap-3.5">
                {/* Custom range slider */}
                <div className="relative flex-1 h-5 flex items-center">
                    {/* Track background */}
                    <div className="absolute inset-y-0 flex items-center w-full pointer-events-none">
                        <div className="w-full h-[2px] rounded-full bg-white/[0.06]">
                            <div
                                className="h-full rounded-full"
                                style={{
                                    width: `${sliderFill}%`,
                                    background: 'rgba(255,255,255,0.22)',
                                    transition: 'width 0.1s ease',
                                }}
                            />
                        </div>
                    </div>

                    <style>{`
                        .vault-slider {
                            -webkit-appearance: none;
                            appearance: none;
                            width: 100%;
                            background: transparent;
                            cursor: pointer;
                            position: relative;
                        }
                        .vault-slider::-webkit-slider-thumb {
                            -webkit-appearance: none;
                            appearance: none;
                            width: 13px;
                            height: 13px;
                            border-radius: 50%;
                            background: #ffffff;
                            border: none;
                            box-shadow: 0 0 0 2px rgba(255,255,255,0.08), 0 1px 4px rgba(0,0,0,0.5);
                            transition: transform 0.15s ease, box-shadow 0.15s ease;
                        }
                        .vault-slider:hover::-webkit-slider-thumb,
                        .vault-slider:focus::-webkit-slider-thumb {
                            transform: scale(1.15);
                            box-shadow: 0 0 0 3px rgba(255,255,255,0.12), 0 1px 6px rgba(0,0,0,0.6);
                        }
                        .vault-slider::-moz-range-thumb {
                            width: 13px;
                            height: 13px;
                            border-radius: 50%;
                            background: #ffffff;
                            border: none;
                            box-shadow: 0 0 0 2px rgba(255,255,255,0.08), 0 1px 4px rgba(0,0,0,0.5);
                        }
                        .vault-slider::-webkit-slider-runnable-track { background: transparent; }
                        .vault-slider::-moz-range-track { background: transparent; }
                    `}</style>

                    <input
                        type="range"
                        min="12"
                        max="64"
                        value={length}
                        onChange={e => setLength(parseInt(e.target.value))}
                        className="vault-slider"
                    />
                </div>

                {/* Generate button */}
                <button
                    type="button"
                    onClick={handleGenerate}
                    className="group shrink-0 flex items-center gap-1.5 border border-white/[0.12] hover:border-white/35 px-3.5 py-1.5 rounded-lg transition-all duration-200 hover:bg-white/[0.03] active:scale-95"
                >
                    <RefreshCw
                        className="w-3 h-3 text-white/30 group-hover:text-white/60 transition-colors duration-200"
                        style={{
                            transition: 'transform 0.42s cubic-bezier(0.4,0,0.2,1), color 0.2s',
                            transform: spinning ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                    />
                    <span className="text-[9.5px] tracking-[0.18em] uppercase text-white/30 group-hover:text-white/60 transition-colors duration-200">
                        Generate
                    </span>
                </button>
            </div>
        </div>
    );
}
