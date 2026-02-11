'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Shield, AlertTriangle, FileText, Leaf, Bell,
  MapPin, ChevronRight, Phone, Trophy, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

export default function CitizenDashboard() {
  const [activeAlert, setActiveAlert] = useState(true);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="pb-20 font-sans">

      {/* ── Header Section ── */}
      <div className="bg-white border-b border-slate-100 sticky top-14 md:top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                Welcome back, <span className="text-[#006DC4]">Citizen</span>
              </h1>
              <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm font-medium">
                <MapPin className="h-4 w-4 text-emerald-500" />
                Varanasi, Sector 4 • <span className="text-emerald-600">Safe Zone</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  River Level: Normal
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* ── Status Banner (Conditional) ── */}
        {activeAlert ? (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 p-6 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-sm">
            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-amber-900">Moderate Flood Warning</h3>
              <p className="text-amber-800/80 text-sm mt-1 leading-relaxed">
                Water levels in Ganga rising near Ghat 4. Expected to increase by 45cm in the next 6 hours. Please stay alert.
              </p>
            </div>
            <button
              onClick={() => setActiveAlert(false)}
              className="px-4 py-2 bg-white rounded-lg text-sm font-bold text-amber-700 shadow-sm hover:bg-amber-50 transition-colors"
            >
              Dismiss
            </button>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-6 flex items-center gap-6 shadow-sm">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-900">You are safe</h3>
              <p className="text-emerald-800/80 text-sm mt-1">No immediate flood risks detected in your area.</p>
            </div>
          </div>
        )}

        {/* ── Quick Actions Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Am I Safe? */}
          <Link href="/citizen/safety" className="group relative bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg hover:border-blue-100 transition-all duration-300">
            <div className="absolute top-6 right-6 h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-500" />
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#006DC4] mb-4 group-hover:scale-110 transition-transform">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Am I Safe?</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Check real-time flood risk for your current location and find nearest shelters.
            </p>
          </Link>

          {/* Report Issue */}
          <Link href="/citizen/report" className="group relative bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg hover:border-blue-100 transition-all duration-300">
            <div className="absolute top-6 right-6 h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-500" />
            </div>
            <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Report Issue</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Spot rising water or blocked drains? Upload a photo and alert authorities instantly.
            </p>
          </Link>

          {/* Alerts */}
          <Link href="/citizen/alerts" className="group relative bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg hover:border-blue-100 transition-all duration-300">
            <div className="absolute top-6 right-6 h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-500" />
            </div>
            <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 mb-4 group-hover:scale-110 transition-transform">
              <Bell className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">My Alerts</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Manage your SMS/WhatsApp subscriptions and view past emergency notifications.
            </p>
          </Link>

          {/* Farming Tips */}
          <Link href="/citizen/farming" className="group relative bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg hover:border-blue-100 transition-all duration-300">
            <div className="absolute top-6 right-6 h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-500" />
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
              <Leaf className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Farming Tips</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Get AI-powered crop advice based on water levels and seasonal weather forecasts.
            </p>
          </Link>

          {/* NGO Ranking (New) */}
          <div className="group relative bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg hover:border-amber-100 transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4 group-hover:scale-110 transition-transform">
              <Trophy className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">NGO Heroes</h3>
            <div className="space-y-3 mb-3">
              {[
                { rank: 1, name: 'Red Cross', pts: '2.8k' },
                { rank: 2, name: 'Green Earth', pts: '2.6k' },
              ].map((ngo) => (
                <div key={ngo.rank} className="flex items-center justify-between text-sm p-2 rounded-lg bg-slate-50">
                  <span className="font-bold text-slate-700">#{ngo.rank} {ngo.name}</span>
                  <span className="text-xs font-bold text-amber-600">{ngo.pts} pts</span>
                </div>
              ))}
            </div>
            <button className="text-xs font-bold text-[#006DC4] hover:underline flex items-center gap-1">
              View Leaderboard <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          {/* Emergency Contacts (New) */}
          <div className="group relative bg-red-50 rounded-2xl p-6 border border-red-100 shadow-[0_4px_20px_-4px_rgba(239,68,68,0.05)] hover:shadow-lg hover:border-red-200 transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600 mb-4 group-hover:scale-110 transition-transform animate-pulse">
              <Phone className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-red-900 mb-2">Emergency</h3>
            <div className="space-y-2 mb-3">
              <button
                onClick={() => copyToClipboard('1077')}
                className="w-full flex items-center justify-between p-2 bg-white/60 rounded-lg hover:bg-white transition-colors border border-red-100/50"
              >
                <span className="text-sm font-bold text-red-800">Flood Control</span>
                <span className="text-sm font-mono text-red-600 font-bold">1077</span>
              </button>
              <button
                onClick={() => copyToClipboard('100')}
                className="w-full flex items-center justify-between p-2 bg-white/60 rounded-lg hover:bg-white transition-colors border border-red-100/50"
              >
                <span className="text-sm font-bold text-red-800">Police</span>
                <span className="text-sm font-mono text-red-600 font-bold">100</span>
              </button>
              <button
                onClick={() => copyToClipboard('102')}
                className="w-full flex items-center justify-between p-2 bg-white/60 rounded-lg hover:bg-white transition-colors border border-red-100/50"
              >
                <span className="text-sm font-bold text-red-800">Ambulance</span>
                <span className="text-sm font-mono text-red-600 font-bold">102</span>
              </button>
            </div>
            <p className="text-[10px] text-red-600/70 font-medium text-center">Tap numbers to copy</p>
          </div>

        </div>

        {/* ── River Stats Summary (Mini Dashboard) ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Live River Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-xs font-semibold text-slate-500 mb-1">Water Level</div>
              <div className="text-2xl font-black text-[#006DC4]">84.5m</div>
              <div className="text-xs text-emerald-600 font-bold mt-1">Normal Range</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 mb-1">Flow Rate</div>
              <div className="text-2xl font-black text-slate-800">1,240</div>
              <div className="text-xs text-slate-400 mt-1">cusecs</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 mb-1">Rainfall (24h)</div>
              <div className="text-2xl font-black text-slate-800">12mm</div>
              <div className="text-xs text-slate-400 mt-1">Light Rain</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 mb-1">Forecast</div>
              <div className="text-2xl font-black text-slate-800">Sunny</div>
              <div className="text-xs text-slate-400 mt-1">Next 12 hours</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
