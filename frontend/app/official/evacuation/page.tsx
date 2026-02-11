'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Route,
  Home,
  Users,
  Phone,
  MapPin,
  Navigation,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Droplets,
  Heart,
  Utensils
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocationStore } from '@/lib/store';
import { evacuationAPI } from '@/lib/api';
import { toast } from 'sonner';

// Mock shelter data - in production from API
const mockShelters = [
  {
    id: 1,
    name: 'Varanasi Community Center',
    address: 'Sigra, Varanasi, UP 221010',
    total_capacity: 500,
    current_occupancy: 120,
    has_medical: true,
    has_food: true,
    has_water: true,
    elevation: 85.5,
    distance_km: 2.3,
    contact_phone: '+91 9876543210',
  },
  {
    id: 2,
    name: 'Government School Shelter',
    address: 'Cantt, Varanasi, UP 221002',
    total_capacity: 300,
    current_occupancy: 45,
    has_medical: false,
    has_food: true,
    has_water: true,
    elevation: 78.2,
    distance_km: 4.1,
    contact_phone: '+91 9876543211',
  },
  {
    id: 3,
    name: 'Sports Complex Emergency Shelter',
    address: 'BHU Campus, Varanasi, UP 221005',
    total_capacity: 800,
    current_occupancy: 230,
    has_medical: true,
    has_food: true,
    has_water: true,
    elevation: 92.0,
    distance_km: 5.8,
    contact_phone: '+91 9876543212',
  },
];

interface RouteResult {
  distance_km: number;
  estimated_time_min: number;
  safety_score: number;
  route_type: string;
  waypoints: Array<{ lat: number; lng: number }>;
  warnings: string[];
}

export default function EvacuationPage() {
  const { latitude, longitude, isLoading: locationLoading, requestLocation } = useLocationStore();
  const [selectedShelter, setSelectedShelter] = useState<number | null>(null);
  const [routePreference, setRoutePreference] = useState<string>('safest');
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);

  const routeMutation = useMutation({
    mutationFn: evacuationAPI.getRoute,
    onSuccess: (data) => {
      setRouteResult(data);
      toast.success('Route calculated!');
    },
    onError: (error: Error) => {
      toast.error('Route calculation failed: ' + error.message);
    },
  });

  const handleCalculateRoute = (shelterId: number) => {
    if (!latitude || !longitude) {
      toast.error('Please enable location first');
      return;
    }
    
    const shelter = mockShelters.find(s => s.id === shelterId);
    if (!shelter) return;

    setSelectedShelter(shelterId);
    routeMutation.mutate({
      start_lat: latitude,
      start_lng: longitude,
      preference: routePreference as 'fastest' | 'safest' | 'shortest',
    });
  };

  const getOccupancyColor = (occupancy: number, capacity: number) => {
    const ratio = occupancy / capacity;
    if (ratio < 0.5) return 'text-green-600 bg-green-100';
    if (ratio < 0.8) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const totalCapacity = mockShelters.reduce((sum, s) => sum + s.total_capacity, 0);
  const totalOccupancy = mockShelters.reduce((sum, s) => sum + s.current_occupancy, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Evacuation Management</h1>
          <p className="text-gray-500">Shelters, routes, and capacity management</p>
        </div>
        <Button onClick={requestLocation} disabled={locationLoading}>
          {locationLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4 mr-2" />
          )}
          {latitude ? 'Location Active' : 'Enable Location'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Shelters</p>
                <p className="text-2xl font-bold">{mockShelters.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Home className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Capacity</p>
                <p className="text-2xl font-bold">{totalCapacity.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Current Occupancy</p>
                <p className="text-2xl font-bold">{totalOccupancy.toLocaleString()}</p>
                <p className="text-xs text-gray-400">
                  {((totalOccupancy / totalCapacity) * 100).toFixed(1)}% utilized
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Route Preferences */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Route Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Select value={routePreference} onValueChange={setRoutePreference}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="safest">Safest Route</SelectItem>
                <SelectItem value="fastest">Fastest Route</SelectItem>
                <SelectItem value="shortest">Shortest Route</SelectItem>
              </SelectContent>
            </Select>
            {latitude && longitude && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                Current: {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Route Result */}
      {routeResult && selectedShelter && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                <Route className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-green-800">Route Calculated</h3>
                <p className="text-sm text-green-600">
                  To: {mockShelters.find(s => s.id === selectedShelter)?.name}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-500">Distance</p>
                <p className="text-xl font-bold text-gray-900">{routeResult.distance_km.toFixed(1)} km</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-500">Est. Time</p>
                <p className="text-xl font-bold text-gray-900">{routeResult.estimated_time_min} min</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-500">Safety Score</p>
                <p className="text-xl font-bold text-gray-900">{routeResult.safety_score}/100</p>
              </div>
            </div>

            {routeResult.warnings.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-yellow-800">Warnings:</p>
                {routeResult.warnings.map((warning, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-yellow-700">
                    <AlertTriangle className="h-4 w-4" />
                    {warning}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Shelters List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Available Shelters</h2>
        
        {mockShelters.map((shelter) => (
          <Card key={shelter.id} className={`transition-all ${selectedShelter === shelter.id ? 'ring-2 ring-blue-500' : ''}`}>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Home className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{shelter.name}</h3>
                      <p className="text-sm text-gray-500">{shelter.address}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Elevation: {shelter.elevation}m • {shelter.distance_km} km away
                      </p>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Capacity</span>
                      <span className={`font-medium ${getOccupancyColor(shelter.current_occupancy, shelter.total_capacity).split(' ')[0]}`}>
                        {shelter.current_occupancy}/{shelter.total_capacity}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          shelter.current_occupancy / shelter.total_capacity < 0.5 ? 'bg-green-500' :
                          shelter.current_occupancy / shelter.total_capacity < 0.8 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(shelter.current_occupancy / shelter.total_capacity) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-2">
                    {shelter.has_medical && (
                      <Badge variant="outline" className="text-xs">
                        <Heart className="h-3 w-3 mr-1 text-red-500" />
                        Medical
                      </Badge>
                    )}
                    {shelter.has_food && (
                      <Badge variant="outline" className="text-xs">
                        <Utensils className="h-3 w-3 mr-1 text-orange-500" />
                        Food
                      </Badge>
                    )}
                    {shelter.has_water && (
                      <Badge variant="outline" className="text-xs">
                        <Droplets className="h-3 w-3 mr-1 text-blue-500" />
                        Water
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 lg:items-end">
                  <Button
                    onClick={() => handleCalculateRoute(shelter.id)}
                    disabled={!latitude || routeMutation.isPending}
                    className="w-full lg:w-auto"
                  >
                    {routeMutation.isPending && selectedShelter === shelter.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Route className="h-4 w-4 mr-2" />
                    )}
                    Calculate Route
                  </Button>
                  <a href={`tel:${shelter.contact_phone}`}>
                    <Button variant="outline" className="w-full lg:w-auto">
                      <Phone className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
