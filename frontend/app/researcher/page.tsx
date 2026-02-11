'use client';

import Link from 'next/link';
import {
  Database,
  Code,
  Brain,
  TrendingUp,
  Download,
  FileJson,
  ArrowRight,
  Activity,
  HardDrive,
  Cpu,
  Clock,
  Zap,
  ChevronRight,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const quickLinks = [
  {
    href: '/researcher/data',
    icon: Database,
    title: 'Data Sandbox',
    description: 'Download LiDAR datasets, river data, and flood records',
    color: 'bg-blue-50',
    iconColor: 'text-[#006DC4]',
    stats: '1.7 GB available',
  },
  {
    href: '/researcher/api',
    icon: Code,
    title: 'API Documentation',
    description: 'REST API endpoints with authentication guides',
    color: 'bg-violet-50',
    iconColor: 'text-violet-600',
    stats: '15 endpoints',
  },
  {
    href: '/researcher/models',
    icon: Brain,
    title: 'Model Lab',
    description: 'Test flood prediction models with custom parameters',
    color: 'bg-amber-50',
    iconColor: 'text-amber-600',
    stats: '3 models',
  },
  {
    href: '/researcher/insights',
    icon: TrendingUp,
    title: 'Research Insights',
    description: 'Visualizations and analysis of flood patterns',
    color: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    stats: 'Live data',
  },
];

const datasets = [
  { name: 'Varanasi LiDAR Point Cloud', size: '856 MB', format: 'LAZ', downloads: 234 },
  { name: 'Ganga River Cross-sections', size: '45 MB', format: 'GeoJSON', downloads: 189 },
  { name: 'Historical Flood Records', size: '12 MB', format: 'CSV', downloads: 456 },
];

export default function ResearcherDashboard() {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-sans">

      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-200 sticky top-[57px] z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Research <span className="text-[#006DC4]">Portal</span>
            </h1>
            <p className="text-slate-500 text-xs font-medium mt-1">
              Access real-time hydrological data & predictive models
            </p>
          </div>
          <div className="flex gap-3">
            <div className="hidden md:flex items-center bg-slate-100 rounded-xl px-3 py-2 border border-slate-200">
              <Search className="h-4 w-4 text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Search datasets..."
                className="bg-transparent border-none text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none w-48"
              />
            </div>
            <Button className="bg-[#006DC4] hover:bg-[#005a9f] text-white rounded-xl shadow-lg shadow-blue-500/20">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ── Stats Strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: 'Data Registry', value: '1.7 TB', icon: HardDrive, color: 'text-blue-600' },
            { label: 'API Requests', value: '4.2k', icon: Activity, color: 'text-violet-600' },
            { label: 'Avg Latency', value: '65ms', icon: Clock, color: 'text-emerald-600' },
            { label: 'Active Models', value: '3', icon: Cpu, color: 'text-amber-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-slate-50 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Quick Links Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href} className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:border-blue-100 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className={`h-12 w-12 rounded-xl ${link.color} flex items-center justify-center ${link.iconColor} group-hover:scale-110 transition-transform`}>
                  <link.icon className="h-6 w-6" />
                </div>
                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#006DC4]" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-[#006DC4] transition-colors">{link.title}</h3>
              <p className="text-sm text-slate-500 mb-4 h-10">{link.description}</p>
              <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-50 text-xs font-bold text-slate-600 border border-slate-100">
                {link.stats}
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Recent Datasets ── */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-500" />
                Recent Datasets
              </h3>
              <Link href="/researcher/data" className="text-xs font-bold text-blue-600 hover:underline">View All</Link>
            </div>
            <div className="divide-y divide-slate-50">
              {datasets.map((ds, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                      <FileJson className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{ds.name}</div>
                      <div className="text-xs text-slate-500 flex gap-2 mt-0.5">
                        <span className="font-semibold text-slate-700">{ds.size}</span>
                        <span>•</span>
                        <span>{ds.format}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 text-xs font-bold border-slate-200">
                    <Download className="h-3 w-3 mr-2" />
                    {ds.downloads}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* ── API Snippet ── */}
          <div className="bg-slate-900 rounded-2xl p-6 text-slate-300 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 text-white">
                <Code className="h-5 w-5 text-emerald-400" />
                <h3 className="font-bold">Quick Start</h3>
              </div>
              <div className="bg-slate-950/50 rounded-xl p-4 font-mono text-xs border border-white/5 mb-4">
                <span className="text-purple-400">import</span> aquaguardians <span className="text-purple-400">as</span> ag<br /><br />
                client = ag.Client(key=<span className="text-emerald-400">"..."</span>)<br />
                prediction = client.predict(<br />
                &nbsp;&nbsp;lat=<span className="text-orange-400">25.31</span>,<br />
                &nbsp;&nbsp;lng=<span className="text-orange-400">83.01</span><br />
                )
              </div>
              <Button className="w-full bg-white/10 hover:bg-white/20 text-white border-none">
                Read Full Documentation
              </Button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
