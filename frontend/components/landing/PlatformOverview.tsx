'use client';

import { useState } from 'react';
import Link from 'next/link';

const features = [
    'Real-time flood alerts & community reporting',
    '3D flood simulation & evacuation routing',
    'Access to 1.7GB of high-res LiDAR data',
];

export default function PlatformOverview() {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <section id="platform" className="relative bg-white py-24 lg:py-32 overflow-hidden">
            <div className="mx-auto max-w-[1280px] px-6 lg:px-8">

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Left: Content */}
                    <div>
                        <h2 className="text-4xl md:text-5xl font-black text-[#0F172A] tracking-tight leading-[1.15]">
                            Three Portals.<br />
                            One Mission.
                        </h2>
                        <p className="mt-6 text-lg text-[#475569] leading-relaxed max-w-lg">
                            Purpose-built experiences for every stakeholder in the Ganga River ecosystem. Whether you are a citizen, an official, or a researcher, we have a dedicated portal for you.
                        </p>

                        <div className="mt-10">
                            <Link
                                href="/citizen"
                                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-[#006DC4] hover:bg-[#005aaff] text-white font-bold text-base shadow-lg shadow-[#006DC4]/25 hover:shadow-[#006DC4]/40 hover:scale-[1.02] transition-all duration-200"
                            >
                                Launch Platform
                            </Link>
                        </div>
                    </div>

                    {/* Right: UI Preview Card */}
                    <div className="relative">
                        {/* Background Blob */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-50/50 rounded-full blur-3xl -z-10" />

                        <div className="bg-white rounded-2xl shadow-[0_24px_60px_-12px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden min-h-[400px] flex flex-col">
                            {/* Tab Header */}
                            <div className="flex border-b border-slate-100">
                                {['Citizen', 'Official', 'Researcher'].map((tab, i) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(i)}
                                        className={`flex-1 py-4 text-sm font-bold transition-all ${activeTab === i
                                            ? 'text-[#006DC4] bg-blue-50/30 border-b-2 border-[#006DC4]'
                                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 border-b-2 border-transparent'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Window Content Mockup */}
                            <div className="p-6 md:p-8 flex-1 flex flex-col bg-slate-50/50">
                                {/* Header Mockup */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="h-2 w-24 bg-slate-200 rounded-full" />
                                    <div className="flex gap-2">
                                        <div className="h-8 w-8 bg-white border border-slate-100 rounded-full shadow-sm" />
                                        <div className="h-8 w-8 bg-[#006DC4] rounded-full shadow-sm flex items-center justify-center">
                                            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Body Content based on Tab */}
                                <div className="flex-1">
                                    {activeTab === 0 && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            {/* Alert Card */}
                                            <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                                    <span className="text-xs font-bold text-slate-700">Flood Alert: Varanasi</span>
                                                    <span className="ml-auto text-[10px] text-slate-400">Now</span>
                                                </div>
                                                <div className="h-2 w-3/4 bg-slate-100 rounded mb-2" />
                                                <div className="h-2 w-1/2 bg-slate-100 rounded" />
                                            </div>

                                            {/* Safe Route Card */}
                                            <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                </div>
                                                <div>
                                                    <div className="h-2.5 w-24 bg-slate-800 rounded mb-1.5" />
                                                    <div className="h-2 w-16 bg-slate-200 rounded" />
                                                </div>
                                                <button className="ml-auto px-3 py-1.5 rounded-md bg-[#006DC4] text-white text-[10px] font-bold">
                                                    Navigate
                                                </button>
                                            </div>

                                            {/* Community Report */}
                                            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100/50 shadow-sm">
                                                <div className="flex mb-2">
                                                    <span className="text-[10px] font-bold text-[#006DC4] uppercase">Community Report</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-white border border-blue-100" />
                                                    <div className="flex-1 space-y-1">
                                                        <div className="h-2 w-full bg-blue-200/50 rounded" />
                                                        <div className="h-2 w-2/3 bg-blue-200/50 rounded" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 1 && (
                                        <div className="grid grid-cols-2 gap-4 h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            {/* Map View */}
                                            <div className="rounded-xl bg-slate-200 overflow-hidden relative border border-slate-300">
                                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:8px_8px]" />
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                                    <div className="h-16 w-16 rounded-full border-2 border-red-500/30 flex items-center justify-center">
                                                        <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center">
                                                            <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Stats Column */}
                                            <div className="space-y-3">
                                                <div className="p-3 rounded-lg bg-white border border-slate-100 shadow-sm">
                                                    <div className="text-[10px] text-slate-400 font-medium mb-1">Evacuation Compliance</div>
                                                    <div className="text-xl font-bold text-slate-800">84%</div>
                                                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2">
                                                        <div className="bg-emerald-500 h-1.5 rounded-full w-[84%]" />
                                                    </div>
                                                </div>
                                                <div className="p-3 rounded-lg bg-white border border-slate-100 shadow-sm">
                                                    <div className="text-[10px] text-slate-400 font-medium mb-1">Rescue Teams</div>
                                                    <div className="text-xl font-bold text-[#006DC4]">12/15</div>
                                                    <div className="text-[9px] text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap"> deployed in Sector 4</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 2 && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            {/* Code/Data View */}
                                            <div className="h-32 rounded-xl bg-slate-900 border border-slate-800 p-4 font-mono text-[10px] text-slate-300 overflow-hidden relative">
                                                <div className="absolute top-2 right-2 text-[8px] text-slate-600">JSON</div>
                                                <div className="mb-1"><span className="text-blue-400">GET</span> /api/v1/flood-risk</div>
                                                <div className="pl-2 border-l border-slate-800 space-y-1 opacity-80">
                                                    <div>{"{"}</div>
                                                    <div className="pl-4">"location": "Varanasi",</div>
                                                    <div className="pl-4">"risk_score": <span className="text-emerald-400">0.82</span>,</div>
                                                    <div className="pl-4">"water_level": <span className="text-blue-400">84.5</span></div>
                                                    <div>{"}"}</div>
                                                </div>
                                            </div>

                                            {/* Graph */}
                                            <div className="flex gap-3 h-16">
                                                <div className="flex-1 bg-white border border-slate-100 rounded-lg shadow-sm p-3 relative overflow-hidden">
                                                    <div className="flex items-end justify-between h-full gap-1 pt-2">
                                                        {[5, 8, 6, 9, 7, 10, 8, 6, 7, 9, 8, 10, 7, 5, 8, 7, 9, 6, 8, 7].map((h, k) => (
                                                            <div key={k} className="flex-1 bg-cyan-100 rounded-t-sm" style={{ height: `${h * 10}%` }} />
                                                        ))}
                                                    </div>
                                                    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent" />
                                                </div>
                                                <div className="w-20 bg-[#006DC4] rounded-lg shadow-sm flex flex-col items-center justify-center text-white">
                                                    <span className="text-[10px] opacity-70">Download</span>
                                                    <span className="text-lg font-bold">CSV</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Features (Horizontal) */}
            </div>
        </section>
    );
}
