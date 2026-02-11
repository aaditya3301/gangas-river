'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useMutation } from '@tanstack/react-query';
import { MapPin, Shield, AlertTriangle, CheckCircle, Loader2, Navigation, Info, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocationStore } from '@/lib/store';
import { safetyAPI } from '@/lib/api';
import { toast } from 'sonner';

// Dynamic import for MapView (requires client-side rendering)
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => <div className="h-[250px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center"><Map className="h-8 w-8 text-gray-400" /></div>,
});

interface SafetyResult {
  is_safe: boolean;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  zone_type: string;
  elevation: number;
  flood_depth_prediction: number;
  message: string;
  recommendations: string[];
}

const riskColors = {
  low: { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-50', border: 'border-green-200' },
  medium: { bg: 'bg-yellow-500', text: 'text-yellow-700', light: 'bg-yellow-50', border: 'border-yellow-200' },
  high: { bg: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-50', border: 'border-orange-200' },
  critical: { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-50', border: 'border-red-200' },
};

const riskIcons = {
  low: CheckCircle,
  medium: AlertTriangle,
  high: AlertTriangle,
  critical: AlertTriangle,
};

export default function SafetyCheckPage() {
  const { latitude, longitude, altitude, accuracy, isLoading: locationLoading, error: locationError, requestLocation } = useLocationStore();
  const [result, setResult] = useState<SafetyResult | null>(null);

  const safetyMutation = useMutation({
    mutationFn: safetyAPI.check,
    onSuccess: (data) => {
      setResult(data);
      if (data.is_safe) {
        toast.success('You are in a safe zone!');
      } else {
        toast.warning('Caution: Elevated flood risk detected');
      }
    },
    onError: (error: Error) => {
      toast.error('Failed to check safety: ' + error.message);
    },
  });

  const handleLocateMe = () => {
    setResult(null);
    requestLocation();
  };

  const handleCheckSafety = () => {
    if (latitude && longitude) {
      safetyMutation.mutate({
        latitude,
        longitude,
        altitude: altitude ?? undefined,
      });
    }
  };

  const hasLocation = latitude !== null && longitude !== null;
  const isChecking = safetyMutation.isPending;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-200 mb-2">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Am I Safe?</h1>
        <p className="text-slate-600">
          Check flood risk at your current GPS location
        </p>
      </div>

      {/* Location Card */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            Your Location
          </CardTitle>
          <CardDescription>
            We use GPS to check flood risk at your exact coordinates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location Status */}
          {hasLocation ? (
            <div className="bg-slate-50 rounded-xl p-4 space-y-2.5 border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Latitude</span>
                <span className="font-mono text-sm bg-slate-200 px-2 py-0.5 rounded">{latitude?.toFixed(6)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Longitude</span>
                <span className="font-mono text-sm bg-slate-200 px-2 py-0.5 rounded">{longitude?.toFixed(6)}</span>
              </div>
              {altitude && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Altitude</span>
                  <span className="font-mono text-sm bg-slate-200 px-2 py-0.5 rounded">{altitude.toFixed(1)}m</span>
                </div>
              )}
              {accuracy && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Accuracy</span>
                  <span className="font-mono text-sm bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">±{accuracy.toFixed(0)}m</span>
                </div>
              )}
            </div>
          ) : locationLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Navigation className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Location not available</p>
            </div>
          )}

          {/* Location Error */}
          {locationError && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Location Error</AlertTitle>
              <AlertDescription>{locationError}</AlertDescription>
            </Alert>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleLocateMe}
              disabled={locationLoading}
            >
              {locationLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4 mr-2" />
              )}
              {hasLocation ? 'Update' : 'Locate Me'}
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={handleCheckSafety}
              disabled={!hasLocation || isChecking}
            >
              {isChecking ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Shield className="h-4 w-4 mr-2" />
              )}
              Check Safety
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Map View */}
      {hasLocation && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Map className="h-5 w-5 text-blue-500" />
              Your Location on Map
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <MapView
              initialViewState={{
                latitude: latitude!,
                longitude: longitude!,
                zoom: 14,
              }}
              markers={[
                {
                  id: 'user-location',
                  latitude: latitude!,
                  longitude: longitude!,
                  type: 'user',
                  title: 'Your Location',
                  description: result ? `Risk: ${result.risk_level}` : 'Checking safety...',
                  severity: result?.risk_level,
                },
              ]}
              height="250px"
              showUserLocation={false}
            />
          </CardContent>
        </Card>
      )}

      {/* Result Card */}
      {result && (
        <Card className={`border-2 ${riskColors[result.risk_level].border}`}>
          <CardContent className="pt-6">
            {/* Main Status */}
            <div className={`rounded-xl p-6 ${riskColors[result.risk_level].light} text-center mb-4`}>
              {(() => {
                const RiskIcon = riskIcons[result.risk_level];
                return (
                  <div className={`inline-flex items-center justify-center h-16 w-16 rounded-full ${riskColors[result.risk_level].bg} mb-3`}>
                    <RiskIcon className="h-8 w-8 text-white" />
                  </div>
                );
              })()}
              <h2 className={`text-2xl font-bold ${riskColors[result.risk_level].text}`}>
                {result.is_safe ? 'You Are Safe' : 'Caution Required'}
              </h2>
              <p className="text-gray-600 mt-1">{result.message}</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <span className="text-xs text-gray-500 block">Risk Level</span>
                <Badge className={`mt-1 ${riskColors[result.risk_level].bg}`}>
                  {result.risk_level.toUpperCase()}
                </Badge>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <span className="text-xs text-gray-500 block">Zone Type</span>
                <span className="font-semibold text-sm">{result.zone_type.replace('_', ' ').toUpperCase()}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <span className="text-xs text-gray-500 block">Elevation</span>
                <span className="font-semibold text-sm">{result.elevation.toFixed(1)}m</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <span className="text-xs text-gray-500 block">Flood Depth</span>
                <span className="font-semibold text-sm">{result.flood_depth_prediction.toFixed(2)}m</span>
              </div>
            </div>

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Recommendations
                </h3>
                <ul className="space-y-1">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Note */}
      <div className="text-center text-xs text-gray-500 space-y-1">
        <p>Data powered by NMCG LiDAR and AI flood prediction models</p>
        <p>For emergencies, call: 112 or NDMA: 1078</p>
      </div>
    </div>
  );
}
