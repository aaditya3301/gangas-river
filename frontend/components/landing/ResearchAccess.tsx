'use client';

import Link from 'next/link';

export default function ResearchAccess() {
    const benefits = [
        'OpenAPI 3.1 standardized documentation',
        'Historical climate datasets (CSV/JSON/GeoTIFF)',
        'Rate-limited free tier for academic use',
    ];

    return (
        <section className="relative bg-white py-24 lg:py-32 overflow-hidden">
            <div className="mx-auto max-w-[1280px] px-6 lg:px-8">

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                    {/* Left: Content */}
                    <div>
                        <h2 className="text-4xl md:text-5xl font-black text-[#0F172A] tracking-tight leading-[1.15]">
                            Open Data for<br />
                            Climate Innovation
                        </h2>
                        <p className="mt-6 text-lg text-[#475569] leading-relaxed max-w-lg">
                            We believe in open science. Access our clean, structured datasets via RESTful APIs to build your own models, apps, and visualizations for the Ganga region.
                        </p>

                        <div className="mt-8 space-y-5">
                            {benefits.map((benefit, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                        <svg className="h-3 w-3 text-[#006DC4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                    </div>
                                    <span className="text-base font-medium text-slate-700">{benefit}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10">
                            <Link
                                href="/researcher"
                                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-[#006DC4] hover:bg-[#005aaff] text-white font-bold text-base shadow-lg shadow-[#006DC4]/25 hover:shadow-[#006DC4]/40 hover:scale-[1.02] transition-all duration-200"
                            >
                                Get API Key
                            </Link>
                        </div>
                    </div>

                    {/* Right: API UI Preview */}
                    <div className="relative">
                        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-50 rounded-full blur-3xl -z-10" />

                        <div className="bg-[#0F172A] rounded-2xl shadow-xl overflow-hidden min-h-[400px] flex flex-col font-mono text-sm relative border border-slate-800">
                            {/* Window Controls */}
                            <div className="h-10 border-b border-slate-800 bg-[#0F172A] flex items-center px-4 gap-2">
                                <div className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                                <div className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                                <div className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                            </div>

                            <div className="p-6 md:p-8 space-y-8">
                                {/* Key Card */}
                                <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 relative group cursor-pointer hover:border-slate-700 transition-colors">
                                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Public Key</div>
                                    <div className="text-emerald-400 font-bold truncate tracking-widest opacity-80 group-hover:opacity-100">
                                        pk_live_58923...92a1s
                                    </div>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    </div>
                                </div>

                                {/* Code Block */}
                                <div className="space-y-1">
                                    <div className="text-slate-500"># Fetch current water levels</div>
                                    <div className="text-blue-400">curl <span className="text-white">-X GET</span> \</div>
                                    <div className="pl-4 text-emerald-400">"https://api.aquaguardia.ns/v1/levels" \</div>
                                    <div className="pl-4 text-white">-H <span className="text-yellow-200">"Authorization: Bearer <span className="opacity-50">pk_live...</span>"</span></div>
                                </div>

                                {/* Response Block */}
                                <div className="pt-4 border-t border-slate-800/50">
                                    <div className="text-slate-600 text-[10px] mb-2">// 200 OK - 42ms</div>
                                    <div className="text-slate-400 opacity-70">
                                        {"{"}<br />
                                        &nbsp;&nbsp;"location": "Rishikesh",<br />
                                        &nbsp;&nbsp;"status": <span className="text-emerald-400">"NORMAL"</span>,<br />
                                        &nbsp;&nbsp;"level_meters": 340.5<br />
                                        {"}"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
