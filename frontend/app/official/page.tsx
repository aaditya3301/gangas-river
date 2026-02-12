'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useMutation } from '@tanstack/react-query';
import {
  AlertTriangle, FileText, MapPin, Activity, Waves, Home, Map,
  Phone, Bell, Users, TrendingUp, Clock, Shield, Award,
  ChevronRight, MessageSquare, CheckCircle2,
  Upload, Star, Trophy, BarChart3, Droplets, Navigation, Loader2, Megaphone, Siren
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { emergencyAPI } from '@/lib/api';

// Dynamic import for MapView
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-slate-100/50 rounded-2xl animate-pulse flex items-center justify-center border border-slate-200">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <Map className="h-8 w-8" />
        <span className="text-sm font-medium">Loading Command Map...</span>
      </div>
    </div>
  ),
});

export default function OfficialDashboard() {
  const [emergencyActive, setEmergencyActive] = useState(false);

  // Hapur flood zones (dummy data)
  const hapurFloodZones = [
    {
      id: 'zone-a-1',
      zone: 'A' as const,
      name: 'Garh Road Area',
      coordinates: [
        [77.765, 28.735],
        [77.772, 28.735],
        [77.772, 28.728],
        [77.765, 28.728],
        [77.765, 28.735],
      ],
    },
    {
      id: 'zone-a-2',
      zone: 'A' as const,
      name: 'Mandi Area',
      coordinates: [
        [77.778, 28.725],
        [77.785, 28.725],
        [77.785, 28.718],
        [77.778, 28.718],
        [77.778, 28.725],
      ],
    },
    {
      id: 'zone-b-1',
      zone: 'B' as const,
      name: 'Railway Colony',
      coordinates: [
        [77.760, 28.740],
        [77.768, 28.740],
        [77.768, 28.733],
        [77.760, 28.733],
        [77.760, 28.740],
      ],
    },
    {
      id: 'zone-b-2',
      zone: 'B' as const,
      name: 'Civil Lines',
      coordinates: [
        [77.772, 28.720],
        [77.780, 28.720],
        [77.780, 28.713],
        [77.772, 28.713],
        [77.772, 28.720],
      ],
    },
    {
      id: 'zone-b-3',
      zone: 'B' as const,
      name: 'Delhi Road Sector',
      coordinates: [
        [77.785, 28.730],
        [77.792, 28.730],
        [77.792, 28.723],
        [77.785, 28.723],
        [77.785, 28.730],
      ],
    },
  ];

  const emergencyMutation = useMutation({
    mutationFn: () => emergencyAPI.activate({ severity: 'critical' }),
    onSuccess: (data: any) => {
      setEmergencyActive(true);
      toast.success(`🚨 Alert Broadcast Sent!`, {
        description: `${data.successful}/${data.total} citizens notified via automated calls.`
      });
      setTimeout(() => setEmergencyActive(false), 8000);
    },
    onError: (error: any) => {
      toast.error('Broadcast Failed', {
        description: error.message
      });
    },
  });

  return (
    <div className="pb-20 font-sans">

      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 sticky top-14 md:top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Command <span className="text-[#006DC4]">Center</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">System Operational • Hapur HO</p>
            </div>
          </div>

          <button
            onClick={() => emergencyMutation.mutate()}
            disabled={emergencyMutation.isPending || emergencyActive}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95 ${emergencyActive
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/10'
              }`}
          >
            {emergencyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : emergencyActive ? <Siren className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4" />}
            {emergencyMutation.isPending ? 'SENDING...' : emergencyActive ? 'BROADCASTING...' : 'Broadcast Alert'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">

        {/* ── Status Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Users className="h-5 w-5" /></div>
              <span className="text-xs font-bold text-slate-400 uppercase">Active Teams</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-slate-900">12</span>
              <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="h-3 w-3" /> All units responsive
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><AlertTriangle className="h-5 w-5" /></div>
              <span className="text-xs font-bold text-slate-400 uppercase">Pending Alerts</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-slate-900">3</span>
              <span className="text-[10px] font-bold text-amber-600">Requires validation</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Home className="h-5 w-5" /></div>
              <span className="text-xs font-bold text-slate-400 uppercase">Shelter Capacity</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-slate-900">85%</span>
              <span className="text-[10px] font-bold text-slate-500">1,240 spaces available</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Activity className="h-5 w-5" /></div>
              <span className="text-xs font-bold text-slate-400 uppercase">System Load</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-slate-900">Normal</span>
              <span className="text-[10px] font-bold text-slate-500">Latency: 45ms</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Main Map View ── */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm relative group">
              <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 shadow-sm flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                LIVE FEEDS - HAPUR
              </div>
              <MapView 
                initialViewState={{
                  latitude: 28.730,
                  longitude: 77.775,
                  zoom: 13,
                }}
                floodZones={hapurFloodZones}
                showUserLocation={false}
              />
            </div>

            {/* Recent Reports List */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#006DC4]" />
                  Incoming Citizen Reports
                </h3>
                <button className="text-xs font-bold text-[#006DC4] hover:underline">View All</button>
              </div>
              <div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 cursor-pointer">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-slate-900">High Water Level</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700">UNVERIFIED</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">Reported at Ghat 4 • 12 mins ago</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Sidebar Feed ── */}
          <div className="space-y-6">

            {/* ── Action Center ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b bg-slate-50">
                <h3 className="font-semibold text-slate-900">Quick Actions</h3>
              </div>
              <div className="p-4 space-y-2">
                <button className="w-full py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 flex items-center px-4 transition-colors">
                  <Megaphone className="h-4 w-4 mr-3 text-slate-500" /> Broadcast Advisory
                </button>
                <button className="w-full py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 flex items-center px-4 transition-colors">
                  <Users className="h-4 w-4 mr-3 text-slate-500" /> Deploy Response Team
                </button>
                <button className="w-full py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 flex items-center px-4 transition-colors">
                  <FileText className="h-4 w-4 mr-3 text-slate-500" /> Generate Status Report
                </button>
              </div>
            </div>

            {/* Emergency Contacts Widget */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-red-50/50">
                <h3 className="font-bold text-red-900 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-red-500" />
                  Emergency Contacts
                </h3>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50">
                  <span className="text-sm font-medium text-slate-600">Flood Control</span>
                  <span className="text-sm font-mono font-bold text-slate-900">1077</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50">
                  <span className="text-sm font-medium text-slate-600">NDRF HQ</span>
                  <span className="text-sm font-mono font-bold text-slate-900">011-24363260</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50">
                  <span className="text-sm font-medium text-slate-600">Police Control</span>
                  <span className="text-sm font-mono font-bold text-slate-900">112</span>
                </div>
              </div>
            </div>

            {/* NGO Leaderboard */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  Top NGOs
                </h3>
              </div>
              <div className="divide-y divide-slate-50">
                {[
                  { rank: 1, name: 'Red Cross Varanasi', points: 2850, award: '🏆' },
                  { rank: 2, name: 'Green Earth', points: 2640, award: '🥈' },
                  { rank: 3, name: 'River Care', points: 2360, award: '🥉' },
                ].map((ngo) => (
                  <div key={ngo.rank} className="flex items-center gap-4 px-6 py-4">
                    <div className="font-black text-slate-300 w-4">{ngo.rank}</div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-slate-900">{ngo.name}</div>
                      <div className="text-xs text-slate-500">{ngo.points} pts</div>
                    </div>
                    <div className="text-lg">{ngo.award}</div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <button className="w-full py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                  View Full Standings
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
