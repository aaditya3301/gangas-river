'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Waves } from 'lucide-react';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <nav
                className={`fixed top-0 inset-x-0 z-100 transition-all duration-500 ${scrolled
                    ? 'bg-[#080c18]/90 backdrop-blur-xl border-b border-white/8 shadow-lg shadow-black/40'
                    : 'bg-transparent'
                }`}
        >
                <div className="mx-auto h-16 max-w-7xl items-center justify-between px-4 md:h-18 md:px-6 lg:px-8 flex">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Shield className="h-7 w-7 md:h-8 md:w-8 text-[#006DC4] fill-[#006DC4]/10" strokeWidth={2} />
                        <Waves className="absolute h-3.5 w-3.5 md:h-4 md:w-4 text-[#006DC4]" strokeWidth={2.5} />
                    </div>
                    <span className="text-white font-bold text-lg md:text-xl tracking-tight leading-none">
                        Aqua<span className="text-[#006DC4]">Guardians</span>
                    </span>
                </Link>
            </div>
        </nav>
    );
}
