'use client';

import Link from 'next/link';

export default function Zoning() {
    const features = [
        'Dynamic risk categorization (Red/Orange/Green)',
        'Automated safe route generation',
        'Infrastructure vulnerability assessment',
    ];

    return (
        <section id="technology" className="relative bg-white py-24 lg:py-32 overflow-hidden">
            <div className="mx-auto max-w-[1280px] px-6 lg:px-8">

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                    {/* Left: Content */}
                    <div>
                        <h2 className="text-4xl md:text-5xl font-black text-[#0F172A] tracking-tight leading-[1.15]">
                            Smart Zoning &<br />
                            Evacuation Intelligence
                        </h2>
                        <p className="mt-6 text-lg text-[#475569] leading-relaxed max-w-lg">
                            Our system dynamically categorizes regions into high-risk zones based on real-time water levels and topography, instantly generating safe evacuation corridors for local authorities.
                        </p>

                        <div className="mt-8 space-y-5">
                            {features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                        <svg className="h-3 w-3 text-[#006DC4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                    </div>
                                    <span className="text-base font-medium text-slate-700">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10">
                            <Link
                                href="/official"
                                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-[#006DC4] hover:bg-[#005aaff] text-white font-bold text-base shadow-lg shadow-[#006DC4]/25 hover:shadow-[#006DC4]/40 hover:scale-[1.02] transition-all duration-200"
                            >
                                View Live Map
                            </Link>
                        </div>
                    </div>

                    {/* Right: Map UI Preview */}
                    <div className="relative">
                        {/* Background Blob */}
                        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[120%] h-[120%] bg-slate-50 rounded-full blur-3xl -z-10" />

                        <div className="bg-white rounded-2xl shadow-[0_24px_60px_-12px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden min-h-[400px] relative">
                            {/* Map Mockup */}
                            <div className="absolute inset-0 bg-[#eef2f6]">
                                {/* Grid Lines */}
                                <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                                {/* River Path */}
                                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                                    <path d="M-10,100 Q150,50 300,150 T600,100 T900,200" fill="none" stroke="#94a3b8" strokeWidth="40" strokeOpacity="0.1" />
                                    <path d="M-10,100 Q150,50 300,150 T600,100 T900,200" fill="none" stroke="#3b82f6" strokeWidth="15" strokeOpacity="0.1" />
                                    <path d="M-10,100 Q150,50 300,150 T600,100 T900,200" fill="none" stroke="#006DC4" strokeWidth="2" strokeDasharray="5 5" />
                                </svg>

                                {/* Zones */}
                                <div className="absolute top-[30%] left-[20%] w-32 h-32 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center animate-pulse">
                                    <div className="w-16 h-16 rounded-full bg-red-500/20" />
                                </div>
                                <div className="absolute top-[30%] left-[20%]">
                                    <div className="bg-white px-3 py-1.5 rounded-lg shadow-lg border border-red-100 flex items-center gap-2 transform -translate-x-1/2 -translate-y-full mb-2">
                                        <div className="h-2 w-2 rounded-full bg-red-500" />
                                        <span className="text-[10px] font-bold text-slate-700">Zone A: Critical</span>
                                    </div>
                                </div>

                                <div className="absolute bottom-[20%] right-[30%] w-40 h-40 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                                    <div className="absolute bottom-[100%] right-0 bg-white px-3 py-1.5 rounded-lg shadow-lg border border-orange-100 flex items-center gap-2 mb-2">
                                        <div className="h-2 w-2 rounded-full bg-orange-500" />
                                        <span className="text-[10px] font-bold text-slate-700">Zone B: Alert</span>
                                    </div>
                                </div>

                                {/* Evacuation Route */}
                                <div className="absolute top-[40%] left-[25%] right-[35%] h-1 bg-white shadow-sm flex items-center justify-between px-1">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                    <div className="h-[2px] flex-1 bg-emerald-500 mx-1 border-t border-dashed border-white" />
                                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                </div>
                                <div className="absolute top-[38%] left-[45%] bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                    SAFE ROUTE
                                </div>
                            </div>

                            {/* Stats Overlay */}
                            <div className="absolute bottom-6 left-6 right-6 grid grid-cols-2 gap-4">
                                <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl border border-slate-100 shadow-sm">
                                    <div className="text-[10px] text-slate-500 font-bold uppercase">Affected Pop.</div>
                                    <div className="text-xl font-black text-slate-800">12,450</div>
                                </div>
                                <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl border border-slate-100 shadow-sm">
                                    <div className="text-[10px] text-slate-500 font-bold uppercase">Shelter Capacity</div>
                                    <div className="text-xl font-black text-[#006DC4]">85%</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
