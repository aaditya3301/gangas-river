'use client';

import Link from 'next/link';

export default function CommunityVerification() {
    const steps = [
        'AI-powered image analysis & geolocation check',
        'Cross-reference with official sensor data',
        'Automatic duplicate filtering & prioritization',
    ];

    return (
        <section className="relative bg-[#F8FAFC] py-24 lg:py-32 overflow-hidden">
            <div className="mx-auto max-w-[1280px] px-6 lg:px-8">

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                    {/* Left: UI Preview Card (Reversed) */}
                    <div className="relative order-2 lg:order-1">
                        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[120%] h-[120%] bg-blue-100/50 rounded-full blur-3xl -z-10" />

                        <div className="bg-white rounded-2xl shadow-[0_24px_60px_-12px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden min-h-[420px] flex flex-col p-6 gap-4">
                            {/* Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Incoming Reports</span>
                                <div className="h-6 px-2 rounded bg-blue-50 text-[#006DC4] text-[10px] font-bold flex items-center">
                                    Live Feed ●
                                </div>
                            </div>

                            {/* Report Cards */}
                            <div className="space-y-3 relative">
                                {/* Card 1: Verified */}
                                <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex gap-4 transition-transform hover:scale-[1.02]">
                                    <div className="h-12 w-12 rounded-lg bg-slate-100 flex-shrink-0 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-sm font-bold text-slate-800">Water rising near Ghat 4</h4>
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold">
                                                <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                VERIFIED
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 mt-1 truncate">Image matches Sat-View. Location confirmed.</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="h-1.5 rounded-full bg-emerald-500 w-16" />
                                            <span className="text-[10px] text-slate-400">98% Confidence</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 2: Pending */}
                                <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex gap-4 opacity-80">
                                    <div className="h-12 w-12 rounded-lg bg-slate-100 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-sm font-bold text-slate-800">Blocked drainage</h4>
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-bold">
                                                ANALYZING...
                                            </span>
                                        </div>
                                        <div className="mt-3 flex gap-1">
                                            <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce" />
                                            <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce delay-75" />
                                            <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce delay-150" />
                                        </div>
                                    </div>
                                </div>

                                {/* Card 3: Rejected */}
                                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 opacity-60 flex gap-4 grayscale">
                                    <div className="h-12 w-12 rounded-lg bg-white flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-sm font-bold text-slate-600 line-through">Outdated photo</h4>
                                            <span className="text-[10px] font-bold text-slate-400">REJECTED</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Vertical Connect Line */}
                                <div className="absolute left-6 top-12 bottom-12 w-[2px] bg-slate-100 -z-10" />
                            </div>
                        </div>
                    </div>

                    {/* Right: Content */}
                    <div className="order-1 lg:order-2">
                        <h2 className="text-4xl md:text-5xl font-black text-[#0F172A] tracking-tight leading-[1.15]">
                            AI-Verified<br />
                            Community Reports
                        </h2>
                        <p className="mt-6 text-lg text-[#475569] leading-relaxed max-w-lg">
                            Citizens are the first line of defense. Our multi-modal AI validates crowd-sourced images and reports in milliseconds, filtering noise so officials can act on truth.
                        </p>

                        <div className="mt-8 space-y-5">
                            {steps.map((step, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                        <svg className="h-3 w-3 text-[#006DC4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                    </div>
                                    <span className="text-base font-medium text-slate-700">{step}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10">
                            <Link
                                href="/citizen"
                                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-base hover:border-[#006DC4] hover:text-[#006DC4] hover:bg-white transition-all duration-200"
                            >
                                Join the Network
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
