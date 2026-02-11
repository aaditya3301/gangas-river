'use client';

import { useState } from 'react';
import Link from 'next/link';

/* ── tiny reusable sub-components ── */
function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#006DC4]/10 border border-[#006DC4]/20 text-[#006DC4] text-xs font-semibold uppercase tracking-widest backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#006DC4] animate-pulse" />
            {children}
        </span>
    );
}

/* ── ORB DATA ── */
const orbsData = [
    {
        role: 'official',
        title: 'Officials',
        img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=400&fit=crop', // Waves/Clean
        glow: 'rgba(100,116,139,0.3)',
    },
    {
        role: 'citizen',
        title: 'Citizens',
        img: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=400&fit=crop', // Droplets/Nature
        glow: 'rgba(0,109,196,0.35)',
    },
    {
        role: 'researcher',
        title: 'Researchers',
        img: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=400&fit=crop', // Lab/Tech
        glow: 'rgba(16,185,129,0.3)',
    },
] as const;

type Role = 'citizen' | 'official' | 'researcher';

/* ── HERO SECTION ── */
export default function Hero() {
    const [role, setRole] = useState<Role>('citizen');

    const content = {
        citizen: {
            badge: 'For Citizens',
            headline: (<span>Stay Safe with Real-time<br /><span className="bg-gradient-to-r from-[#006DC4] to-cyan-400 bg-clip-text text-transparent">Flood Alerts</span></span>),
            sub: 'Get instant notifications, find safe evacuation routes, and report local incidents to help your community.',
            cta: 'Get Alerts',
            link: '/citizen',
        },
        official: {
            badge: 'For Officials',
            headline: (<span>Command Center for<br /><span className="bg-gradient-to-r from-slate-400 to-slate-200 bg-clip-text text-transparent">Disaster Response</span></span>),
            sub: 'Monitor real-time data, coordinate rescue teams, and broadcast emergency alerts to thousands instantly.',
            cta: 'Open Dashboard',
            link: '/official',
        },
        researcher: {
            badge: 'For Researchers',
            headline: (<span>Advanced LiDAR Data &<br /><span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Predictive Models</span></span>),
            sub: 'Access 1.7GB of high-resolution terrain data and API endpoints for climate modeling and analysis.',
            cta: 'Access Data',
            link: '/researcher',
        }
    };

    const activeContent = content[role];

    // Calculate visual slot for each orb based on active role
    // Slots: 'left' | 'center' | 'right'
    const getSlot = (orbRole: string) => {
        if (role === 'citizen') {
            if (orbRole === 'official') return 'left';
            if (orbRole === 'citizen') return 'center';
            return 'right'; // researcher
        }
        if (role === 'official') {
            if (orbRole === 'researcher') return 'left';
            if (orbRole === 'official') return 'center';
            return 'right'; // citizen
        }
        // researcher active
        if (orbRole === 'citizen') return 'left';
        if (orbRole === 'researcher') return 'center';
        return 'right'; // official
    };

    return (
        <section className="relative min-h-[100dvh] bg-[#080c18] overflow-hidden flex flex-col items-center justify-start pt-28 pb-32">
            {/* ── Background layers ── */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Dynamic gradient based on role */}
                <div className={`absolute inset-0 transition-opacity duration-1000 ${role === 'citizen' ? 'opacity-100' : 'opacity-0'} bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,_rgba(0,109,196,0.15),_transparent)]`} />
                <div className={`absolute inset-0 transition-opacity duration-1000 ${role === 'official' ? 'opacity-100' : 'opacity-0'} bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,_rgba(148,163,184,0.1),_transparent)]`} />
                <div className={`absolute inset-0 transition-opacity duration-1000 ${role === 'researcher' ? 'opacity-100' : 'opacity-0'} bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,_rgba(16,185,129,0.1),_transparent)]`} />

                {/* Ambient glow behind active orb */}
                <div
                    className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] transition-all duration-700"
                    style={{
                        background: role === 'citizen' ? 'radial-gradient(circle, rgba(0,109,196,0.2) 0%, transparent 70%)'
                            : role === 'official' ? 'radial-gradient(circle, rgba(148,163,184,0.15) 0%, transparent 70%)'
                                : 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)'
                    }}
                />

                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
            </div>

            {/* ── Content (Text) ── */}
            <div className="relative z-10 mx-auto max-w-[1280px] px-6 text-center mb-0 md:mb-8">
                <div className="mb-6"><Badge>{activeContent.badge}</Badge></div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] min-h-[160px] md:min-h-[auto]">
                    {activeContent.headline}
                </h1>

                <p className="mt-6 text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed font-medium min-h-[60px] md:min-h-[auto]">
                    {activeContent.sub}
                </p>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href={activeContent.link}
                        className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-[#006DC4] hover:bg-[#005aaff] text-white font-bold text-base shadow-2xl shadow-[#006DC4]/30 hover:shadow-[#006DC4]/50 hover:scale-[1.03] transition-all duration-200"
                    >
                        {activeContent.cta}
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>

            {/* ── THREE ORBS (Positioned container) ── */}
            <div className="relative z-20 w-full max-w-[800px] h-[320px] mx-auto mt-12 md:mt-16 perspective-[1000px]">
                {orbsData.map((orb) => {
                    const slot = getSlot(orb.role);
                    const isCenter = slot === 'center';

                    // Positioning logic
                    let positionStyles = {};
                    if (slot === 'center') {
                        positionStyles = { transform: 'translateX(-50%) scale(1)', left: '50%', zIndex: 30 };
                    } else if (slot === 'left') {
                        positionStyles = { transform: 'translateX(-150%) scale(0.75)', left: '50%', zIndex: 20 };
                    } else {
                        positionStyles = { transform: 'translateX(50%) scale(0.75)', left: '50%', zIndex: 20 };
                    }

                    return (
                        <button
                            key={orb.role}
                            onClick={() => setRole(orb.role as Role)}
                            className="absolute top-0 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] outline-none group"
                            style={positionStyles}
                        >
                            {/* Floating Wrapper (only active on center to prevent double motion issues) */}
                            <div className={isCenter ? 'animate-[float_6s_ease-in-out_infinite]' : ''}>

                                {/* Orb Glow if center */}
                                <div
                                    className={`absolute inset-0 rounded-full blur-xl transition-opacity duration-700 ${isCenter ? 'opacity-60 animate-pulse' : 'opacity-0'}`}
                                    style={{ background: orb.glow }}
                                />

                                {/* Orb Container */}
                                <div
                                    className={`relative rounded-full overflow-hidden shadow-2xl border-4 transition-all duration-500 bg-gray-900 ${isCenter
                                        ? 'w-48 h-48 md:w-64 md:h-64 border-white/20'
                                        : 'w-48 h-48 md:w-64 md:h-64 border-white/5 grayscale-[0.5] hover:grayscale-0 cursor-pointer opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <img
                                        src={orb.img}
                                        alt={orb.title}
                                        className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110"
                                    />

                                    {/* Glass Shine Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/30 pointer-events-none" />
                                    <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] rounded-full pointer-events-none" />
                                </div>

                                {/* Label */}
                                <div className={`mt-6 text-center transition-all duration-300 ${isCenter ? 'opacity-100' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'}`}>
                                    <span className="text-white font-bold uppercase tracking-[0.2em] text-xs md:text-sm text-shadow-sm">
                                        {orb.title}
                                    </span>
                                    <div className={`h-0.5 w-8 bg-[#006DC4] mx-auto mt-2 rounded-full transition-all duration-300 ${isCenter ? 'opacity-100' : 'opacity-0'}`} />
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* ── Terrain SVG Bottom ── */}
            <div className="absolute bottom-0 inset-x-0 z-1 pointer-events-none">
                <svg viewBox="0 0 1440 320" className="w-full h-auto min-h-[120px] object-cover align-bottom" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="tGrad1" x1="0.5" y1="0" x2="0.5" y2="1">
                            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#080c18" stopOpacity="1" />
                        </linearGradient>
                    </defs>
                    <path fill="#1e293b" fillOpacity="0.3" d="M0,160 C320,120 480,240 720,200 C960,160 1120,220 1440,180 L1440,320 L0,320 Z" />
                    <path fill="url(#tGrad1)" d="M0,220 C240,180 480,280 720,240 C960,200 1200,260 1440,200 L1440,320 L0,320 Z" />
                    <path fill="none" stroke="#006DC4" strokeWidth="1" strokeOpacity="0.3" d="M0,220 C240,180 480,280 720,240 C960,200 1200,260 1440,200" />
                </svg>
            </div>

            <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .text-shadow-sm {
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }
      `}</style>
        </section>
    );
}
