'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Waves } from 'lucide-react';
import { useLandingStore } from '@/lib/landing-store';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const { currentRole } = useLandingStore();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 inset-x-0 z-[100] transition-all duration-500 ${scrolled
                    ? 'bg-[#080c18]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-lg shadow-black/40'
                    : 'bg-transparent'
                }`}
        >
            <div className="mx-auto max-w-[1280px] px-6 lg:px-8 h-[72px] flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Shield className="h-8 w-8 text-[#006DC4] fill-[#006DC4]/10" strokeWidth={2} />
                        <Waves className="absolute h-4 w-4 text-[#006DC4]" strokeWidth={2.5} />
                    </div>
                    <span className="text-white font-bold text-xl tracking-tight leading-none">
                        Aqua<span className="text-[#006DC4]">Guardians</span>
                    </span>
                </Link>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    <Link
                        href={`/${currentRole}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#006DC4] hover:bg-[#005aaff] text-white text-sm font-semibold shadow-lg shadow-[#006DC4]/20 hover:shadow-[#006DC4]/40 hover:scale-[1.02] transition-all duration-200"
                    >
                        Access Platform
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
