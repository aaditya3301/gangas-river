'use client';

import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  LineChart,
  PieChart,
  Droplets,
  Mountain,
  Users,
  Download,
  ArrowUp,
  ArrowDown,
  Minus,
  FileText
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Mock data
const yearlyFloodData = [
  { year: 2019, events: 12, deaths: 45, displaced: 125000, damage_cr: 450 },
  { year: 2020, events: 8, deaths: 23, displaced: 78000, damage_cr: 280 },
  { year: 2021, events: 15, deaths: 67, displaced: 189000, damage_cr: 620 },
  { year: 2022, events: 11, deaths: 34, displaced: 112000, damage_cr: 380 },
  { year: 2023, events: 9, deaths: 28, displaced: 95000, damage_cr: 310 },
  { year: 2024, events: 14, deaths: 52, displaced: 156000, damage_cr: 520 },
  { year: 2025, events: 3, deaths: 8, displaced: 34000, damage_cr: 95 },
];

const zoneDistribution = [
  { zone: 'Zone A (High Risk)', count: 45, area_km2: 125, population: 234000, color: 'bg-red-500' },
  { zone: 'Zone B (Medium Risk)', count: 89, area_km2: 310, population: 567000, color: 'bg-amber-500' },
  { zone: 'Zone C (Low Risk)', count: 156, area_km2: 520, population: 890000, color: 'bg-emerald-500' },
];

const recentPatterns = [
  {
    title: 'Earlier Monsoon Onset',
    description: 'Monsoon arriving 10-15 days earlier than historical average',
    trend: 'up',
    impact: 'Increased flash flood risk in June',
  },
  {
    title: 'Higher Peak Water Levels',
    description: '12% increase in peak water levels over last decade',
    trend: 'up',
    impact: 'More Zone A classifications needed',
  },
  {
    title: 'Reduced Flood Duration',
    description: 'Flood events lasting 20% shorter but more intense',
    trend: 'down',
    impact: 'Faster evacuation response required',
  },
];

export default function InsightsPage() {
  const [timeRange, setTimeRange] = useState('5y');
  const totalEvents = yearlyFloodData.reduce((s, d) => s + d.events, 0);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-sans">

      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 sticky top-[57px] z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Research Insights</h1>
            <p className="text-slate-500 text-xs font-medium mt-1">Hydrological pattern analysis & archival data</p>
          </div>
          <div className="flex gap-2">
            <select className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none">
              <option>Last 5 Years</option>
              <option>Last 10 Years</option>
              <option>All Time</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#006DC4] hover:bg-[#005a9f] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20">
              <Download className="h-4 w-4" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Events</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalEvents}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Droplets className="h-5 w-5" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Displaced</p>
              <p className="text-2xl font-black text-slate-900 mt-1">~1.2M</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Risk Zones</p>
              <p className="text-2xl font-black text-slate-900 mt-1">290</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
              <Mountain className="h-5 w-5" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Damage</p>
              <p className="text-2xl font-black text-slate-900 mt-1">₹380Cr</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Yearly Flood Chart ── */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <BarChart2 className="h-5 w-5 text-blue-500" />
              <h3 className="font-bold text-slate-900">Flood Frequency</h3>
            </div>
            <div className="h-64 flex items-end gap-2 justify-between">
              {yearlyFloodData.map((d) => (
                <div key={d.year} className="flex flex-col items-center gap-2 w-full">
                  <div className="w-full bg-blue-500 rounded-t-md hover:bg-blue-600 transition-colors relative group" style={{ height: `${(d.events / 15) * 100}%` }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {d.events} Events
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{d.year}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Patterns ── */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <h3 className="font-bold text-slate-900">Emerging Patterns</h3>
            </div>
            <div className="space-y-4">
              {recentPatterns.map((p, i) => (
                <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${p.trend === 'up' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {p.trend === 'up' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{p.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{p.description}</p>
                    <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-bold text-slate-600">
                      Impact: {p.impact}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── Zone Dist ── */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="h-5 w-5 text-purple-500" />
            <h3 className="font-bold text-slate-900">Zone Distribution Models</h3>
          </div>
          <div className="space-y-4">
            {zoneDistribution.map((zone) => (
              <div key={zone.zone} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-700">{zone.zone}</span>
                  <span className="text-slate-500 text-xs">{zone.count} Areas</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${zone.color}`} style={{ width: `${(zone.count / 290) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Methodology ── */}
        <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 flex items-start gap-4">
          <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-emerald-900 text-sm">Data Source Methodology</h4>
            <p className="text-xs text-emerald-700 mt-1 leading-relaxed max-w-3xl">
              Our insights are derived from a combination of real-time sensor data, historical CWC water level records (2010-2025), a
              nd satellite imagery analysis. Predictive models use an ensemble of LSTM and Random Forest algorithms with a confidence interval of 95%.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
