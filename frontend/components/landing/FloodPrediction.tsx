import Link from 'next/link';

export default function FloodPrediction() {
    const predictionFeatures = [
        'LiDAR-based elevation modeling',
        'Real-time satellite integration',
        'Historical pattern learning',
    ];

    return (
        <section id="technology" className="relative bg-slate-50 py-24 lg:py-32 overflow-hidden">
            <div className="mx-auto max-w-[1280px] px-6 lg:px-8">

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Left: UI Preview Card (Reversed Order for Rhythm) */}
                    <div className="relative order-2 lg:order-1">
                        {/* Background Blob */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-100/40 rounded-full blur-3xl -z-10" />

                        <div className="bg-white rounded-2xl shadow-[0_24px_60px_-12px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden min-h-[420px] flex flex-col">
                            {/* Browser Header Mockup */}
                            <div className="h-10 border-b border-slate-100 bg-slate-50/50 flex items-center px-4 gap-2">
                                <div className="flex gap-1.5">
                                    <div className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                                    <div className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                                    <div className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                                </div>
                                <div className="ml-4 h-5 w-40 bg-white rounded-md border border-slate-100 shadow-sm" />
                            </div>

                            <div className="p-6 md:p-8 flex-1 flex flex-col gap-6">
                                {/* Top: Elevation Profile */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">River Bed Elevation Profile</span>
                                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[10px] font-bold">Safe Levels</span>
                                    </div>
                                    <div className="h-32 w-full bg-slate-50 rounded-xl border border-slate-100 relative overflow-hidden flex items-end">
                                        {/* Terrain Shape */}
                                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                                        <svg className="w-full h-full text-[#006DC4]" preserveAspectRatio="none" viewBox="0 0 100 100">
                                            <path fill="currentColor" fillOpacity="0.1" d="M0,100 L0,60 C20,70 40,40 60,50 C80,60 100,20 100,100 Z" />
                                            <path fill="none" stroke="currentColor" strokeWidth="2" d="M0,60 C20,70 40,40 60,50 C80,60 100,20" />
                                        </svg>
                                        {/* Water Level Line */}
                                        <div className="absolute bottom-[30%] left-0 right-0 border-t border-dashed border-blue-400/50 flex justify-end px-2">
                                            <span className="text-[9px] text-blue-400 font-mono -mt-4">Current: 84.5m</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom: Metrics Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-6 w-6 rounded-md bg-blue-50 flex items-center justify-center text-[#006DC4]">
                                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                            </div>
                                            <span className="text-xs font-semibold text-slate-600">Model Accuracy</span>
                                        </div>
                                        <div className="text-2xl font-black text-slate-900 tracking-tight">99.2%</div>
                                        <div className="text-[10px] text-slate-400 mt-1">Validated against 50yr data</div>
                                    </div>

                                    <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-6 w-6 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </div>
                                            <span className="text-xs font-semibold text-slate-600">Confidence</span>
                                        </div>
                                        <div className="text-2xl font-black text-[#006DC4] tracking-tight">High</div>
                                        <div className="text-[10px] text-slate-400 mt-1">Based on LiDAR + Sat view</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Content */}
                    <div className="order-1 lg:order-2">
                        <h2 className="text-4xl md:text-5xl font-black text-[#0F172A] tracking-tight leading-[1.15]">
                            Predict Flood Risk<br />
                            Before It Happens
                        </h2>
                        <p className="mt-6 text-lg text-[#475569] leading-relaxed max-w-lg">
                            Our machine learning pipeline combines LiDAR terrain data from NMCG surveys, real-time satellite imagery, and historical flood patterns to deliver industry-leading predictive accuracy.
                        </p>

                        <div className="mt-8 space-y-5">
                            {predictionFeatures.map((f, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                        <svg className="h-3 w-3 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                    </div>
                                    <span className="text-base font-medium text-slate-700">{f}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10">
                            <Link
                                href="/researcher"
                                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-base hover:border-[#006DC4] hover:text-[#006DC4] hover:bg-white transition-all duration-200"
                            >
                                Explore Methodology
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
