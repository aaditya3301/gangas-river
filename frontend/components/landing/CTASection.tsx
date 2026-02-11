'use client';

import Link from 'next/link';

export default function CTASection() {
    return (
        <section className="relative bg-teal-50/30 py-24 lg:py-32 overflow-hidden">
            <div className="mx-auto max-w-[1280px] px-6 lg:px-8">

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                    {/* Left: Brand UI Visual */}
                    <div className="relative order-2 lg:order-1">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-cyan-100/50 rounded-full blur-3xl -z-10" />

                        <div className="bg-white rounded-2xl shadow-[0_24px_60px_-12px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden min-h-[400px] flex items-center justify-center p-8 relative">
                            {/* Abstract Shield/River Composition */}
                            <div className="relative w-full max-w-sm aspect-square bg-slate-50 rounded-full border border-slate-100 flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                                {/* Concentric Circles */}
                                <div className="absolute w-[80%] h-[80%] rounded-full border border-blue-100 animate-[spin_10s_linear_infinite]" />
                                <div className="absolute w-[60%] h-[60%] rounded-full border border-blue-200/50 animate-[spin_15s_linear_infinite_reverse]" />

                                {/* Central Logo Mark */}
                                <div className="relative z-10 w-32 h-32 bg-white rounded-2xl shadow-xl flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#006DC4] to-cyan-500 opacity-10 rounded-2xl" />
                                    <svg className="h-16 w-16 text-[#006DC4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                        <path d="M12 8v4" />
                                        <path d="M12 16h.01" />
                                    </svg>
                                </div>

                                {/* Orbiting Elements */}
                                <div className="absolute top-1/4 left-1/4 w-12 h-12 bg-white rounded-lg shadow-lg flex items-center justify-center animate-bounce">
                                    <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Content */}
                    <div className="order-1 lg:order-2">
                        <span className="inline-block py-1 px-3 rounded-md bg-[#006DC4]/10 text-[#006DC4] text-xs font-bold uppercase tracking-widest mb-4">
                            Global Initiative
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-[#0F172A] tracking-tight leading-[1.15]">
                            AquaGuardians
                        </h2>
                        <p className="mt-2 text-2xl font-bold text-[#006DC4]">
                            Intelligent River Protection
                        </p>

                        <p className="mt-6 text-lg text-[#475569] leading-relaxed max-w-lg">
                            Protect Lives. Save Communities. We leverage cutting-edge technology to secure the future of the Ganga river basin and its inhabitants.
                        </p>

                        <div className="mt-10 flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/citizen"
                                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-[#006DC4] hover:bg-[#005aaff] text-white font-bold text-base shadow-lg shadow-[#006DC4]/25 hover:shadow-[#006DC4]/40 hover:scale-[1.02] transition-all duration-200"
                            >
                                Join the Network
                            </Link>
                            <Link
                                href="/official"
                                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-base hover:border-[#006DC4] hover:text-[#006DC4] hover:bg-white transition-all duration-200"
                            >
                                Partnership Inquiry
                            </Link>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-200/60 flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                <span className="text-sm font-semibold text-slate-600">Secure</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                <span className="text-sm font-semibold text-slate-600">Scalable</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-slate-500" />
                                <span className="text-sm font-semibold text-slate-600">Sovereign</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
