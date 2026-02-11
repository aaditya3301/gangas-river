'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  Map, 
  Search, 
  Filter, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  Info,
  Loader2,
  Navigation
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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

const zoneColors = {
  zone_a: { bg: 'bg-red-100', text: 'text-red-700', badge: 'bg-red-500', label: 'Zone A (High Risk)' },
  zone_b: { bg: 'bg-yellow-100', text: 'text-yellow-700', badge: 'bg-yellow-500', label: 'Zone B (Moderate)' },
  zone_c: { bg: 'bg-green-100', text: 'text-green-700', badge: 'bg-green-500', label: 'Zone C (Low Risk)' },
};

interface ClassifyResult {
  zone_type: string;
  flood_depth_1m: number;
  flood_depth_3m: number;
  flood_depth_5m: number;
  restrictions: string[];
  recommendation: string;
}

export default function ZonesPage() {
  const { latitude, longitude, isLoading: locationLoading, requestLocation } = useLocationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [classifyResult, setClassifyResult] = useState<ClassifyResult | null>(null);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');

  const classifyMutation = useMutation({
    mutationFn: zonesAPI.classify,
    onSuccess: (data) => {
      setClassifyResult(data);
      toast.success('Location classified successfully!');
    },
    onError: (error: Error) => {
      toast.error('Classification failed: ' + error.message);
    },
  });

  const handleClassifyGPS = () => {
    if (latitude && longitude) {
      classifyMutation.mutate({ latitude, longitude });
    }
  };

  const handleClassifyManual = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      classifyMutation.mutate({ latitude: lat, longitude: lng });
    } else {
      toast.error('Please enter valid coordinates');
    }
  };

  const filteredZones = zones.filter(zone =>
    zone.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
            <Map className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Zone Management</h1>
            <p className="text-slate-500">Policy zones and land classification</p>
          </div>
        </div>
      </div>

      {/* Zone Classification Tool */}
      <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            Classify Location
          </CardTitle>
          <CardDescription>
            Check zone classification and building restrictions for any location
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* GPS Option */}
            <div className="space-y-3 p-5 rounded-xl bg-white border border-slate-100 shadow-sm">
              <h4 className="font-semibold text-slate-900">Use GPS Location</h4>
              {latitude && longitude ? (
                <div className="text-sm text-slate-600 font-mono bg-slate-100 p-2 rounded-lg">
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={requestLocation}
                  disabled={locationLoading}
                  className="w-full border-slate-300"
                >
                  {locationLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Navigation className="h-4 w-4 mr-2" />
                  )}
                  Get Current Location
                </Button>
              )}
              {latitude && longitude && (
                <Button
                  onClick={handleClassifyGPS}
                  disabled={classifyMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  {classifyMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Classify This Location
                </Button>
              )}
            </div>

            {/* Manual Entry */}
            <div className="space-y-3 p-5 rounded-xl bg-white border border-slate-100 shadow-sm">
              <h4 className="font-semibold text-slate-900">Enter Coordinates</h4>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Latitude"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  step="any"
                  className="border-slate-200"
                />
                <Input
                  type="number"
                  placeholder="Longitude"
                  value={manualLng}
                  onChange={(e) => setManualLng(e.target.value)}
                  step="any"
                  className="border-slate-200"
                />
              </div>
              <Button
                onClick={handleClassifyManual}
                disabled={classifyMutation.isPending || !manualLat || !manualLng}
                variant="outline"
                className="w-full border-slate-300"
              >
                Classify Coordinates
              </Button>
            </div>
          </div>

          {/* Classification Result */}
          {classifyResult && (
            <div className={`rounded-lg p-4 ${zoneColors[classifyResult.zone_type as keyof typeof zoneColors]?.bg || 'bg-gray-100'}`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`font-bold text-lg ${zoneColors[classifyResult.zone_type as keyof typeof zoneColors]?.text || 'text-gray-700'}`}>
                  {zoneColors[classifyResult.zone_type as keyof typeof zoneColors]?.label || classifyResult.zone_type}
                </h4>
                <Badge className={zoneColors[classifyResult.zone_type as keyof typeof zoneColors]?.badge || 'bg-gray-500'}>
                  Classified
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-2 bg-white/50 rounded">
                  <p className="text-xs text-gray-600">1m Rise</p>
                  <p className="font-bold">{classifyResult.flood_depth_1m.toFixed(2)}m</p>
                </div>
                <div className="text-center p-2 bg-white/50 rounded">
                  <p className="text-xs text-gray-600">3m Rise</p>
                  <p className="font-bold">{classifyResult.flood_depth_3m.toFixed(2)}m</p>
                </div>
                <div className="text-center p-2 bg-white/50 rounded">
                  <p className="text-xs text-gray-600">5m Rise</p>
                  <p className="font-bold">{classifyResult.flood_depth_5m.toFixed(2)}m</p>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-medium text-sm">Restrictions:</h5>
                <ul className="text-sm space-y-1">
                  {classifyResult.restrictions.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              <Alert className="mt-4 bg-white/70">
                <Info className="h-4 w-4" />
                <AlertTitle>Recommendation</AlertTitle>
                <AlertDescription>{classifyResult.recommendation}</AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search zones..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Zone Legend */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-red-500" />
          <span className="text-sm text-gray-600">Zone A - No Construction</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-yellow-500" />
          <span className="text-sm text-gray-600">Zone B - Conditional</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-green-500" />
          <span className="text-sm text-gray-600">Zone C - Permitted</span>
        </div>
      </div>

      {/* Zones List */}
      <div className="grid gap-4">
        {filteredZones.map((zone) => (
          <Card key={zone.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={zoneColors[zone.type as keyof typeof zoneColors].badge}>
                      {zone.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                    <div>
                      <span className="text-gray-500">Area:</span>
                      <span className="font-medium ml-1">{zone.area_km2} km²</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Population:</span>
                      <span className="font-medium ml-1">{zone.population.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Updated:</span>
                      <span className="font-medium ml-1">{zone.last_updated}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {zone.restrictions.map((restriction, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {restriction}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Map className="h-4 w-4 mr-1" />
                    View Map
                  </Button>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
