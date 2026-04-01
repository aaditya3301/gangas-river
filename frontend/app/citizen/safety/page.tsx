'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Loader2, LocateFixed, Phone, Shield, TriangleAlert, Waves, CloudRain } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { safetyAPI } from '@/lib/api';

type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

interface HistoricalComparison {
  year: number;
  location: string;
  similarity_score: number;
  flood_depth_m: number;
  rainfall_mm: number;
  actual_damage_crore: number;
  source?: string;
}

interface SafetyCheckResult {
  is_safe: boolean;
  risk_level: RiskLevel;
  zone_type?: string | null;
  elevation: number;
  flood_depth_prediction?: number | null;
  confidence?: number | null;
  contributing_factors: string[];
  historical_comparison?: HistoricalComparison | null;
  model_source?: string | null;
  message: string;
  recommendations: string[];
}

const RISK_STYLES: Record<RiskLevel, { title: string; shell: string; accent: string; iconBg: string }> = {
  low: {
    title: 'You are Safe',
    shell: 'border-emerald-100',
    accent: 'text-emerald-900',
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
  medium: {
    title: 'Stay Alert',
    shell: 'border-amber-100',
    accent: 'text-amber-900',
    iconBg: 'bg-amber-100 text-amber-600',
  },
  high: {
    title: 'High Risk',
    shell: 'border-orange-100',
    accent: 'text-orange-900',
    iconBg: 'bg-orange-100 text-orange-600',
  },
  critical: {
    title: 'Critical Risk',
    shell: 'border-red-100',
    accent: 'text-red-900',
    iconBg: 'bg-red-100 text-red-600',
  },
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { detail?: string } } }).response;
    if (response?.data?.detail) {
      return response.data.detail;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

export default function AmISafePage() {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [altitude, setAltitude] = useState<number | null>(null);
  const [rainfall, setRainfall] = useState(80);
  const [isLocating, setIsLocating] = useState(false);
  const [autoWhatIf, setAutoWhatIf] = useState(true);
  const [hasCheckedOnce, setHasCheckedOnce] = useState(false);

  const [result, setResult] = useState<SafetyCheckResult | null>(null);

  const safetyMutation = useMutation({
    mutationFn: (payload: { latitude: number; longitude: number; altitude?: number; rainfall_mm: number }) =>
      safetyAPI.check(payload),
    onSuccess: (data: SafetyCheckResult) => {
      setResult(data);
      setHasCheckedOnce(true);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Unable to check safety right now.'));
    },
  });

  const locateMe = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported on this browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setAltitude(position.coords.altitude ?? null);
        setIsLocating(false);
        toast.success('GPS location captured.');
      },
      (error) => {
        setIsLocating(false);
        toast.error(error.message || 'Unable to get your location.');
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const runCheck = (rainfallMm: number) => {
    if (latitude === null || longitude === null) {
      toast.error('Capture your location first.');
      return;
    }

    safetyMutation.mutate({
      latitude,
      longitude,
      altitude: altitude ?? undefined,
      rainfall_mm: rainfallMm,
    });
  };

  useEffect(() => {
    if (!autoWhatIf || !hasCheckedOnce || latitude === null || longitude === null) {
      return;
    }

    const timer = setTimeout(() => {
      runCheck(rainfall);
    }, 450);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rainfall, autoWhatIf, hasCheckedOnce, latitude, longitude]);

  const riskLevel: RiskLevel = (result?.risk_level || 'low') as RiskLevel;
  const style = RISK_STYLES[riskLevel] ?? RISK_STYLES.low;
  const confidencePct = useMemo(() => {
    if (result?.confidence === null || result?.confidence === undefined) {
      return null;
    }
    return Math.round(result.confidence * 100);
  }, [result?.confidence]);

  return (
    <div className="bg-slate-50 pb-20 md:pb-8">
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center gap-3">
          <Link href="/citizen" className="p-2 -ml-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg md:text-xl font-bold text-slate-900">Safety Check</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 md:py-8 space-y-4 md:space-y-6">
        <Card className="p-4 md:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-900">Live Location & What-If Scenario</h2>
            <Button onClick={locateMe} variant="outline" className="gap-2" disabled={isLocating}>
              {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
              Locate Me
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
              Latitude: {latitude?.toFixed(6) ?? 'Not captured'}
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
              Longitude: {longitude?.toFixed(6) ?? 'Not captured'}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <p className="font-medium text-slate-800 flex items-center gap-2">
                <CloudRain className="h-4 w-4 text-blue-600" /> What-If Rainfall
              </p>
              <span className="font-bold text-slate-900">{rainfall} mm</span>
            </div>
            <input
              type="range"
              min={0}
              max={350}
              step={5}
              value={rainfall}
              onChange={(event) => setRainfall(Number(event.target.value))}
              className="w-full accent-blue-600"
            />
            <label className="inline-flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={autoWhatIf}
                onChange={(event) => setAutoWhatIf(event.target.checked)}
                className="accent-blue-600"
              />
              Auto re-check when slider changes
            </label>
          </div>

          <Button onClick={() => runCheck(rainfall)} disabled={safetyMutation.isPending} className="w-full gap-2">
            {safetyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
            Check Safety
          </Button>
        </Card>

        <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${style.shell}`}>
          <div className="p-8 flex flex-col items-center justify-center text-center bg-linear-to-b from-white to-slate-50">
            <div className={`h-20 w-20 rounded-full flex items-center justify-center mb-4 ${style.iconBg}`}>
              <Shield className="h-10 w-10" />
            </div>
            <h2 className={`text-2xl md:text-3xl font-black ${style.accent}`}>{style.title}</h2>
            <p className="text-slate-600 mt-2 font-medium">{result?.message ?? 'Capture location and run a check to see your current flood risk.'}</p>
            {confidencePct !== null && (
              <p className="text-sm text-slate-500 mt-4">Model confidence: {confidencePct}%</p>
            )}
          </div>

          <div className="h-52 bg-slate-100 relative overflow-hidden border-t border-slate-100">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
              <path d="M-10,150 Q200,100 400,150 T800,120" fill="none" stroke="#3b82f6" strokeWidth="40" strokeOpacity="0.1" />
              <path d="M-10,150 Q200,100 400,150 T800,120" fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="4 4" />
            </svg>
            <div className="absolute top-[40%] left-[30%]">
              <div className="h-4 w-4 rounded-full bg-[#006DC4] border-2 border-white shadow-lg animate-pulse" />
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded shadow text-[10px] font-bold text-slate-700 whitespace-nowrap">
                You
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Prediction Details</h3>
            <div className="space-y-2 text-sm text-slate-700">
              <p>Flood depth estimate: <strong>{result?.flood_depth_prediction?.toFixed(2) ?? '0.00'} m</strong></p>
              <p>Elevation: <strong>{result?.elevation?.toFixed(2) ?? '--'} m</strong></p>
              <p>Policy zone: <strong>{result?.zone_type ?? 'Not mapped'}</strong></p>
              <p>Model source: <strong>{result?.model_source ?? 'N/A'}</strong></p>
            </div>
            {result?.contributing_factors?.length ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-800">Contributing factors</p>
                <div className="space-y-1">
                  {result.contributing_factors.map((factor) => (
                    <p key={factor} className="text-xs text-slate-600">- {factor}</p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-md bg-slate-50 border border-slate-200 p-3 text-xs text-slate-500">
                Run a safety check to view top risk factors.
              </div>
            )}
          </Card>

          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Waves className="h-4 w-4 text-blue-600" /> Historical Comparison
            </h3>
            {result?.historical_comparison ? (
              <div className="space-y-2 text-sm text-slate-700">
                <p><strong>{result.historical_comparison.year}</strong> - {result.historical_comparison.location}</p>
                <p>Similarity: <strong>{Math.round(result.historical_comparison.similarity_score * 100)}%</strong></p>
                <p>Depth recorded: <strong>{result.historical_comparison.flood_depth_m} m</strong></p>
                <p>Rainfall recorded: <strong>{result.historical_comparison.rainfall_mm} mm</strong></p>
                <p>Damage observed: <strong>Rs {result.historical_comparison.actual_damage_crore} crore</strong></p>
                {result.historical_comparison.source && (
                  <p className="text-xs text-slate-500">Source: {result.historical_comparison.source}</p>
                )}
              </div>
            ) : (
              <div className="rounded-md bg-slate-50 border border-slate-200 p-3 text-xs text-slate-500 flex items-start gap-2">
                <TriangleAlert className="h-4 w-4 mt-0.5" />
                Historical match appears after prediction output is available.
              </div>
            )}

            {!!result?.recommendations?.length && (
              <div className="space-y-1 pt-2 border-t border-slate-100">
                <p className="text-sm font-semibold text-slate-800">Recommendations</p>
                {result.recommendations.map((item) => (
                  <p key={item} className="text-xs text-slate-600">- {item}</p>
                ))}
              </div>
            )}
          </Card>
        </div>

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
          <button type="button" className="bg-red-600 hover:bg-red-700 text-white h-10 px-4 rounded-lg text-sm font-bold">
            Call 108
          </button>
        </div>
      </div>
    </div>
  );
}
