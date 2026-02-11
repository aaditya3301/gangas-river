'use client';

import Link from 'next/link';
import { ArrowLeft, CloudRain, Sun, Droplets, ArrowUpRight } from 'lucide-react';

export default function FarmingTipsPage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/citizen" className="p-2 -ml-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Farming Insights</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* Weather Summary */}
        <div className="bg-gradient-to-br from-[#006DC4] to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
          {/* Abstract Circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10 flex justify-between items-center">
            <div>
              <p className="text-blue-100 text-sm font-medium">Tomorrow's Forecast</p>
              <h2 className="text-3xl font-black mt-1">Light Rain</h2>
              <p className="text-white/80 text-sm mt-1">Humidity: 85% • Wind: 12km/h</p>
            </div>
            <div className="h-16 w-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <CloudRain className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Crop Recommendations */}
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Recommended Actions</h3>
          <div className="grid sm:grid-cols-2 gap-4">

            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:border-emerald-200 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-slate-900">Plant Rice now</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Soil moisture is optimal (78%). Expected rainfall will support early growth.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:border-amber-200 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 mb-4">
                <Sun className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-slate-900">Delay Wheat sowing</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Wait 3 days for ground temperature to stabilize after current cold snap.
              </p>
            </div>

          </div>
        </div>

        {/* Soil Health */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-[#006DC4]">
              <Droplets className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Soil Moisture</h4>
              <p className="text-xs text-slate-500">Sensor ID: #4492</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-slate-800">78%</div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">OPTIMAL</span>
          </div>
        </div>

      </div>
    </div>
  );
}
