'use client';

import Link from 'next/link';
import { ArrowLeft, Bell, MessageSquare, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/citizen" className="p-2 -ml-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Notifications</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6">

        {/* Settings Toggle */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-[#006DC4]">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">SMS Alerts</h4>
              <p className="text-xs text-slate-500">Receive critical updates on your phone</p>
            </div>
          </div>
          <div className="h-6 w-10 bg-[#006DC4] rounded-full relative cursor-pointer">
            <div className="absolute top-1 right-1 h-4 w-4 bg-white rounded-full shadow-sm" />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['all', 'critical', 'info'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${activeTab === tab
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-4">
          {/* Alert 1 */}
          <div className="bg-white p-4 rounded-xl border border-l-4 border-slate-100 border-l-amber-500 shadow-sm flex gap-4">
            <div className="mt-1">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-sm font-bold text-slate-900">Flood Warning: Zone B</h4>
                <span className="text-[10px] text-slate-400">2h ago</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Water level rising above danger mark at Ravidas Ghat. Please avoid the area.
              </p>
            </div>
          </div>

          {/* Alert 2 */}
          <div className="bg-white p-4 rounded-xl border border-l-4 border-slate-100 border-l-emerald-500 shadow-sm flex gap-4">
            <div className="mt-1">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-sm font-bold text-slate-900">Report Verified</h4>
                <span className="text-[10px] text-slate-400">Yesterday</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your report regarding "Blocked Drain" in Sector 4 has been verified and forwarded to municipal authorites.
              </p>
            </div>
          </div>

          {/* Alert 3 */}
          <div className="bg-white p-4 rounded-xl border border-l-4 border-slate-100 border-l-blue-500 shadow-sm flex gap-4 opacity-75">
            <div className="mt-1">
              <Bell className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-sm font-bold text-slate-900">Weekly Forecast</h4>
                <span className="text-[10px] text-slate-400">2 days ago</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Expect light to moderate rainfall over the weekend. No flooding is anticipated.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
