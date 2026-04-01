'use client';

import Link from 'next/link';

export default function CommunityVerification() {
    const steps = [
        'AI-powered image analysis & geolocation check',
        'Cross-reference with official sensor data',
        'Automatic duplicate filtering & prioritization',
    ];

    return (
        <section className="relative overflow-hidden bg-[#F8FAFC] py-16 sm:py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-24">
                    {/* Left: UI Preview Card (Reversed) */}
                    <div className="relative order-1 mx-auto w-full max-w-xl lg:order-1 lg:max-w-none">
                        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[120%] h-[120%] bg-blue-100/50 rounded-full blur-3xl -z-10" />

                        <div className="flex min-h-0 flex-col gap-4 overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.1)] sm:min-h-105 sm:p-6">
                            {/* Header */}
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-50 pb-4">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Incoming Reports</span>
                                <div className="h-6 px-2 rounded bg-blue-50 text-[#006DC4] text-[10px] font-bold flex items-center">
                                    Live Feed ●
                                </div>
                            </div>

                            {/* Report Cards */}
                            <div className="space-y-3 relative">
                                {/* Card 1: Verified */}
                                <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex gap-4 transition-transform hover:scale-[1.02]">
                                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                                        <div className="absolute inset-0 bg-linear-to-br from-slate-200 to-slate-300" />
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
                                    <div className="h-12 w-12 shrink-0 rounded-lg bg-slate-100" />
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
                                    <div className="h-12 w-12 shrink-0 rounded-lg bg-white" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-sm font-bold text-slate-600 line-through">Outdated photo</h4>
                                            <span className="text-[10px] font-bold text-slate-400">REJECTED</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Vertical Connect Line */}
                                <div className="absolute top-12 bottom-12 left-6 -z-10 w-0.5 bg-slate-100" />
                            </div>
                        </div>
                    </div>

                    {/* Right: Content */}
                    <div className="order-2 mx-auto w-full max-w-xl lg:order-2 lg:max-w-none">
                        <h2 className="text-3xl font-black leading-[1.15] tracking-tight text-[#0F172A] sm:text-4xl md:text-5xl">
                            AI-Verified<br />
                            Community Reports
                        </h2>
                        <p className="mt-5 max-w-lg text-base leading-relaxed text-[#475569] sm:mt-6 sm:text-lg">
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

                        <div className="mt-8 sm:mt-10">
                            <Link
                                href="/citizen"
                                className="inline-flex w-full items-center justify-center rounded-xl border-2 border-slate-200 px-8 py-3.5 text-base font-bold text-slate-700 transition-all duration-200 hover:border-[#006DC4] hover:bg-white hover:text-[#006DC4] sm:w-auto"
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
