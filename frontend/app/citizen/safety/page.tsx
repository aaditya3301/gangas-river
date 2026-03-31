'use client';

import Link from 'next/link';
import { Shield, Navigation, Home, Phone, ArrowLeft } from 'lucide-react';

export default function AmISafePage() {
  return (
    <div className="bg-slate-50 pb-20 md:pb-8">

      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center gap-3">
          <Link href="/citizen" className="p-2 -ml-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg md:text-xl font-bold text-slate-900">Safety Check</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 md:py-8 space-y-4 md:space-y-6">

        {/* Risk Status Card */}
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
          <div className="bg-emerald-50/50 p-8 flex flex-col items-center justify-center text-center">
            <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center mb-4 animate-[bounce_2s_infinite]">
              <Shield className="h-10 w-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-emerald-900">You are Safe</h2>
            <p className="text-emerald-800/80 mt-2 font-medium">No active flood threats in your immediate zone.</p>
            <p className="text-sm text-slate-400 mt-4">Last updated: Just now</p>
          </div>

          {/* Map Mockup */}
          <div className="h-64 bg-slate-100 relative overflow-hidden border-t border-slate-100">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

            {/* River */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
              <path d="M-10,150 Q200,100 400,150 T800,120" fill="none" stroke="#3b82f6" strokeWidth="40" strokeOpacity="0.1" />
              <path d="M-10,150 Q200,100 400,150 T800,120" fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="4 4" />
            </svg>

            {/* Locations */}
            <div className="absolute top-[40%] left-[30%]">
              <div className="h-4 w-4 rounded-full bg-[#006DC4] border-2 border-white shadow-lg animate-pulse" />
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded shadow text-[10px] font-bold text-slate-700 whitespace-nowrap">
                You
              </div>
            </div>

            <div className="absolute top-[30%] right-[20%]">
              <div className="h-3 w-3 rounded-full bg-emerald-500 border border-white shadow-sm" />
              <div className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold text-slate-500">
                Shelter A
              </div>
            </div>
          </div>
        </div>

        {/* Nearby Shelters List */}
        <div>
          <h3 className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 md:mb-4">Nearby Safe Zones</h3>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Home className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Community Hall {i}</h4>
                    <p className="text-xs text-slate-500">1.2km away • Capacity: 85%</p>
                  </div>
                </div>
                <button className="h-11 w-11 rounded-full border border-slate-100 flex items-center justify-center hover:bg-slate-50 text-blue-600">
                  <Navigation className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-red-50 rounded-xl p-4 border border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-red-900">Emergency Helpline</h4>
              <p className="text-xs text-red-700">24/7 Disaster Response Team</p>
            </div>
          </div>
          <button className="bg-red-600 hover:bg-red-700 text-white h-10 px-4 rounded-lg text-sm font-bold">
            Call 108
          </button>
        </div>

      </div>
    </div>
  );
}
