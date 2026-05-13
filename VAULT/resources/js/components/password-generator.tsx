import { useState, useEffect } from 'react';
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
    let pass = [
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
    const [length, setLength]         = useState(20);
    const [previewEntropy, setPreview] = useState(0);

    useEffect(() => {
        // Theoretical entropy for the full charset (~94 chars)
        setPreview(Math.round(length * Math.log2(94)));
    }, [length]);

    const handleGenerate = () => {
        onPasswordGenerated(generatePassword(length));
    };

    // Slider fill percentage for the custom track
    const sliderFill = ((length - 12) / (64 - 12)) * 100;

    return (
        <div className="rounded-lg bg-white/[0.025] border border-white/[0.07] px-4 py-3.5 space-y-3">
            {/* Header row */}
            <div className="flex items-center justify-between">
                <span className="text-[9px] tracking-[0.25em] text-white/30 uppercase">
                    Generate password
                </span>
                <span className="text-[10px] font-mono text-white/20">
                    {length} chars · ~{previewEntropy} bits
                </span>
            </div>

            {/* Slider + button row */}
            <div className="flex items-center gap-4">
                {/* Range slider */}
                <div className="relative flex-1 h-5 flex items-center">
                    {/* Track */}
                    <div className="absolute inset-y-0 flex items-center w-full pointer-events-none">
                        <div className="w-full h-[3px] rounded-full bg-white/[0.08]">
                            <div
                                className="h-full rounded-full bg-white/30 transition-all duration-150"
                                style={{ width: `${sliderFill}%` }}
                            />
                        </div>
                    </div>
                    <input
                        type="range"
                        min="12"
                        max="64"
                        value={length}
                        onChange={e => setLength(parseInt(e.target.value))}
                        className="relative w-full appearance-none bg-transparent cursor-pointer
                            [&::-webkit-slider-thumb]:appearance-none
                            [&::-webkit-slider-thumb]:w-3.5
                            [&::-webkit-slider-thumb]:h-3.5
                            [&::-webkit-slider-thumb]:rounded-full
                            [&::-webkit-slider-thumb]:bg-white
                            [&::-webkit-slider-thumb]:shadow-sm
                            [&::-moz-range-thumb]:w-3.5
                            [&::-moz-range-thumb]:h-3.5
                            [&::-moz-range-thumb]:rounded-full
                            [&::-moz-range-thumb]:bg-white
                            [&::-moz-range-thumb]:border-0"
                    />
                </div>

                {/* Generate button */}
                <button
                    type="button"
                    onClick={handleGenerate}
                    className="group shrink-0 flex items-center gap-1.5 border border-white/15 hover:border-white/40 px-3.5 py-1.5 transition-all duration-200"
                >
                    <RefreshCw className="w-3 h-3 text-white/30 group-hover:text-white/60 transition-colors group-hover:rotate-180 duration-300" />
                    <span className="text-[10px] tracking-[0.15em] uppercase text-white/30 group-hover:text-white/60 transition-colors">
                        Generate
                    </span>
                </button>
            </div>
        </div>
    );
}
