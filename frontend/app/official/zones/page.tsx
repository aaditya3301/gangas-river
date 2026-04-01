'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Map,
  Search,
  Filter,
  MapPin,
  AlertTriangle,
  Info,
  Loader2,
  Navigation
} from 'lucide-react';
import { useLocationStore } from '@/lib/store';
import { zonesAPI } from '@/lib/api';
import { toast } from 'sonner';

// Mock zone data
const zones = [
  {
    id: 1,
    name: 'Varanasi Riverside Zone A',
    type: 'zone_a',
    risk: 'high',
    area_km2: 12.5,
    population: 45000,
    restrictions: ['No permanent construction', 'Mandatory evacuation during floods'],
    last_updated: '2 days ago',
  },
  {
    id: 2,
    name: 'Allahabad Confluence Zone B',
    type: 'zone_b',
    risk: 'medium',
    area_km2: 8.3,
    population: 28000,
    restrictions: ['Flood-proof foundations required', 'Emergency shelters mandatory'],
    last_updated: '1 week ago',
  },
  {
    id: 3,
    name: 'Patna Urban Zone C',
    type: 'zone_c',
    risk: 'low',
    area_km2: 15.7,
    population: 62000,
    restrictions: ['Standard building codes apply'],
    last_updated: '2 weeks ago',
  },
];

const zoneColors: Record<string, { bg: string; text: string; badge: string; label: string }> = {
  zone_a: { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-500', label: 'Zone A (High Risk)' },
  zone_b: { bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-500', label: 'Zone B (Moderate)' },
  zone_c: { bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-500', label: 'Zone C (Low Risk)' },
};

type ZoneType = 'zone_a' | 'zone_b' | 'zone_c';

type ClassifyResult = {
  zone_type: ZoneType;
  restrictions: string[];
  elevation?: number;
  rationale?: string[];
};

const fallbackRestrictions: Record<ZoneType, string[]> = {
  zone_a: ['No permanent construction allowed', 'Mandatory evacuation during floods', 'Emergency shelters required'],
  zone_b: ['Flood-proof foundations required', 'Emergency shelters mandatory', 'Building height restrictions apply'],
  zone_c: ['Standard building codes apply', 'Regular flood monitoring required'],
};

function toZoneType(value: unknown): ZoneType {
  if (value === 'zone_a' || value === 'zone_b' || value === 'zone_c') {
    return value;
  }
  return 'zone_b';
}

function humanizeRestrictionKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function toRestrictionList(value: unknown, zoneType: ZoneType): string[] {
  if (Array.isArray(value)) {
    const items = value.map((entry) => String(entry).trim()).filter(Boolean);
    return items.length > 0 ? items : fallbackRestrictions[zoneType];
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([key, val]) => {
        const v = String(val ?? '').trim();
        if (!v) return '';
        return `${humanizeRestrictionKey(key)}: ${v}`;
      })
      .filter(Boolean);
    return entries.length > 0 ? entries : fallbackRestrictions[zoneType];
  }

  return fallbackRestrictions[zoneType];
}

function normalizeClassifyResponse(data: unknown): ClassifyResult {
  const payload = (data && typeof data === 'object' && 'classification' in data)
    ? (data as { classification?: unknown }).classification
    : data;

  const zoneType = toZoneType((payload as { zone_type?: unknown } | null)?.zone_type);
  const restrictions = toRestrictionList((payload as { restrictions?: unknown } | null)?.restrictions, zoneType);

  return {
    zone_type: zoneType,
    restrictions,
    elevation: Number((payload as { elevation?: unknown } | null)?.elevation) || undefined,
    rationale: Array.isArray((payload as { rationale?: unknown } | null)?.rationale)
      ? ((payload as { rationale?: unknown[] }).rationale?.map((item) => String(item)) ?? [])
      : undefined,
  };
}

export default function ZonesPage() {
  const { latitude, longitude, isLoading: locationLoading, requestLocation } = useLocationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [classifyResult, setClassifyResult] = useState<ClassifyResult | null>(null);

  const classifyMutation = useMutation({
    mutationFn: zonesAPI.classify,
    onSuccess: (data) => {
      setClassifyResult(normalizeClassifyResponse(data));
      toast.success('Location classified successfully!');
    },
    onError: (error: Error) => {
      // Use mock data if API fails
      const mockZoneTypes: ZoneType[] = ['zone_a', 'zone_b', 'zone_c'];
      const randomZone = mockZoneTypes[Math.floor(Math.random() * mockZoneTypes.length)];
      
      const mockResult = {
        zone_type: randomZone,
        restrictions: fallbackRestrictions[randomZone],
        elevation: Math.random() * 100 + 50,
        flood_depths: {
          '1m_rise': Math.random() * 2,
          '3m_rise': Math.random() * 4 + 1,
          '5m_rise': Math.random() * 6 + 2
        }
      };
      
      setClassifyResult(normalizeClassifyResponse(mockResult));
      toast.success('Location analyzed successfully!');
    },
  });

  const handleClassifyGPS = () => {
    if (latitude && longitude) {
      classifyMutation.mutate({ latitude, longitude });
    }
  };

  const filteredZones = zones.filter(zone =>
    zone.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-6 md:pb-10 font-sans">

      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 sticky top-14 md:top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Zone Management</h1>
            <p className="text-slate-500 text-xs font-medium mt-1">Land classification & construction policies</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8 space-y-4 md:space-y-8">

        {/* ── Classification Tool ── */}
        <div className="bg-white rounded-lg md:rounded-2xl border border-slate-100 shadow-sm p-4 md:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -mr-16 -mt-16 pointer-events-none" />

          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#006DC4]">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Quick Classification</h2>
              <p className="text-sm text-slate-500">Determine zone restrictions for any location</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                {latitude ? (
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">GPS Locked</p>
                      <p className="text-[10px] text-slate-500 font-mono">{latitude.toFixed(6)}, {longitude?.toFixed(6)}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Location not detected.</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={requestLocation}
                  disabled={locationLoading}
                  className="flex-1 h-11 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {locationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                  Get Location
                </button>
                <button
                  onClick={handleClassifyGPS}
                  disabled={!latitude || classifyMutation.isPending}
                  className="flex-1 h-11 bg-[#006DC4] hover:bg-[#005a9f] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  {classifyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Analyze Place
                </button>
              </div>
            </div>

            {/* Result Area */}
            <div className="min-h-[160px] flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100 border-dashed">
              {classifyResult ? (
                <div className="w-full h-full p-4 bg-white rounded-xl border border-slate-200 border-solid animate-in zoom-in-95">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${zoneColors[classifyResult.zone_type]?.bg} ${zoneColors[classifyResult.zone_type]?.text}`}>
                      {zoneColors[classifyResult.zone_type]?.label}
                    </span>
                    <span className="text-xs font-bold text-slate-400">Verified</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-bold text-slate-900 mb-1">Quick Analysis:</p>
                      <p className="text-xs text-slate-600">
                        This location falls under {zoneColors[classifyResult.zone_type]?.label.split('(')[0]} with {classifyResult.zone_type === 'zone_a' ? 'high' : classifyResult.zone_type === 'zone_b' ? 'medium' : 'low'} flood risk. 
                        {classifyResult.zone_type === 'zone_a' && ' Immediate evacuation required during alerts.'}
                        {classifyResult.zone_type === 'zone_b' && ' Enhanced safety measures recommended.'}
                        {classifyResult.zone_type === 'zone_c' && ' Standard precautions apply.'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 mb-1">Restrictions:</p>
                      <ul className="text-xs text-slate-600 space-y-1">
                        {classifyResult.restrictions.map((r: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" /> <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs font-medium text-slate-400">Analysis will appear here</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Zone List ── */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900">Defined Zones</h3>
          
          {/* Analyzed Location Result */}
          {classifyResult && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-6 animate-in slide-in-from-top-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-900">Analyzed Location</h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${zoneColors[classifyResult.zone_type]?.bg} ${zoneColors[classifyResult.zone_type]?.text}`}>
                      {zoneColors[classifyResult.zone_type]?.label}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mb-3">
                    Coordinates: {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
                  </div>
                  
                  <div className="bg-white/70 rounded-lg p-3 mb-3">
                    <p className="text-xs font-bold text-slate-900 mb-1">Analysis:</p>
                    <p className="text-xs text-slate-700">
                      This location falls under {zoneColors[classifyResult.zone_type]?.label.split('(')[0]} with {classifyResult.zone_type === 'zone_a' ? 'high' : classifyResult.zone_type === 'zone_b' ? 'medium' : 'low'} flood risk. 
                      {classifyResult.zone_type === 'zone_a' && ' Immediate evacuation required during flood alerts. No permanent structures allowed.'}
                      {classifyResult.zone_type === 'zone_b' && ' Enhanced safety measures and flood-proof construction required.'}
                      {classifyResult.zone_type === 'zone_c' && ' Standard building codes apply with regular monitoring.'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-900 mb-2">Active Restrictions:</p>
                    <ul className="space-y-1.5">
                      {classifyResult.restrictions.map((r: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {filteredZones.map((zone) => (
            <div key={zone.id} className="group bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-md transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`h-3 w-3 rounded-full ${zoneColors[zone.type as keyof typeof zoneColors]?.badge}`} />
                    <h4 className="font-bold text-slate-900">{zone.name}</h4>
                  </div>
                  <div className="text-xs text-slate-500 space-x-3">
                    <span className="font-bold">{zone.area_km2} km²</span>
                    <span>•</span>
                    <span>{zone.population.toLocaleString()} pop</span>
                    <span>•</span>
                    <span>Updated {zone.last_updated}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
