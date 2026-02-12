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
      <div className="bg-white border-b border-slate-200 sticky top-14 lg:top-0 z-20">
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-blue-500" />
                <h3 className="font-bold text-slate-900">Flood Frequency Analysis</h3>
              </div>
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-bold">
                {yearlyFloodData.reduce((s, d) => s + d.events, 0)} Total Events
              </Badge>
            </div>
            
            {/* Y-axis and Chart Container */}
            <div className="flex gap-3">
              {/* Y-axis labels */}
              <div className="flex flex-col justify-between h-64 py-1">
                {[15, 12, 9, 6, 3, 0].map((val) => (
                  <div key={val} className="text-[10px] font-bold text-slate-400 -mt-1">
                    {val}
                  </div>
                ))}
              </div>
              
              {/* Chart with grid lines */}
              <div className="flex-1 relative">
                {/* Horizontal grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="border-t border-slate-100" />
                  ))}
                </div>
                
                {/* Bars */}
                <div className="h-64 flex items-end gap-2 justify-between relative z-10">
                  {yearlyFloodData.map((d) => {
                    const maxEvents = Math.max(...yearlyFloodData.map(y => y.events));
                    const heightPercent = (d.events / maxEvents) * 100;
                    return (
                      <div key={d.year} className="flex flex-col items-center gap-2 flex-1 group">
                        {/* Bar value on top */}
                        <div className="text-xs font-black text-slate-400 group-hover:text-blue-600 transition-colors mb-1 opacity-0 group-hover:opacity-100">
                          {d.events}
                        </div>
                        
                        {/* Bar */}
                        <div 
                          className="w-full bg-blue-500 hover:bg-blue-600 rounded-t-xl transition-all relative cursor-pointer shadow-md hover:shadow-lg" 
                          style={{ height: `${heightPercent}%`, minHeight: heightPercent < 20 ? '30px' : '0px' }}
                        >
                          {/* Tooltip */}
                          <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-xl">
                            <div className="font-black text-sm mb-1">{d.year}</div>
                            <div className="flex items-center gap-2 text-[11px]">
                              <div>
                                <span className="text-blue-400">●</span> {d.events} Events
                              </div>
                              <div className="border-l border-slate-600 pl-2">
                                <span className="text-red-400">●</span> {d.deaths} Deaths
                              </div>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">
                              {d.displaced.toLocaleString()} displaced
                            </div>
                            {/* Arrow */}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                          </div>
                          
                          {/* Bar shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-t-xl" />
                        </div>
                        
                        {/* Year label */}
                        <span className="text-[11px] font-black text-slate-600 mt-1 group-hover:text-blue-600 transition-colors">
                          '{d.year.toString().slice(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Statistics footer */}
            <div className="mt-6 pt-5 border-t-2 border-slate-100 grid grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Peak Year</p>
                <p className="text-base font-black text-slate-900">2021</p>
                <p className="text-xs text-red-600 font-bold">15 events</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Average</p>
                <p className="text-base font-black text-slate-900">
                  {(yearlyFloodData.reduce((s, d) => s + d.events, 0) / yearlyFloodData.length).toFixed(1)}
                </p>
                <p className="text-xs text-slate-500 font-bold">per year</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">5-Year Trend</p>
                <p className="text-base font-black text-orange-600 flex items-center justify-center gap-1">
                  <ArrowUp className="h-4 w-4" /> 12%
                </p>
                <p className="text-xs text-orange-500 font-bold">increasing</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">2025 YTD</p>
                <p className="text-base font-black text-emerald-600">3</p>
                <p className="text-xs text-emerald-600 font-bold">ongoing</p>
              </div>
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
