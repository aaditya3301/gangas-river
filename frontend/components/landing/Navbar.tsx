'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const navLinks = [
    { label: 'Platform', href: '#platform' },
    { label: 'Solutions', href: '#solutions' },
    { label: 'Technology', href: '#technology' },
    { label: 'Research', href: '#research' },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);

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
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="h-9 w-9 rounded-xl bg-[#006DC4] grid place-items-center shadow-lg shadow-[#006DC4]/25 group-hover:shadow-[#006DC4]/40 transition-shadow">
                        <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 12c2-4 6-8 10-8s8 4 10 8c-2 4-6 8-10 8s-8-4-10-8z" />
                            <path d="M6 12c1-2 3-4 6-4s5 2 6 4c-1 2-3 4-6 4s-5-2-6-4z" />
                        </svg>
                    </div>
                    <span className="text-white font-bold text-lg tracking-tight">
                        Aqua<span className="text-[#006DC4]">Guardians</span>
                    </span>
                </Link>

                {/* Center Nav */}
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/[0.05]"
                        >
                            {link.label}
                        </a>
                    ))}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-4 mr-4 border-r border-white/10 pr-4">
                        <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Login to Portal:</span>
                        <Link href="/citizen" className="text-xs font-bold text-white/80 hover:text-[#006DC4] transition-colors">Citizen</Link>
                        <Link href="/official" className="text-xs font-bold text-white/80 hover:text-[#006DC4] transition-colors">Official</Link>
                        <Link href="/researcher" className="text-xs font-bold text-white/80 hover:text-[#006DC4] transition-colors">Researcher</Link>
                    </div>

                    <Link
                        href="/citizen"
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
