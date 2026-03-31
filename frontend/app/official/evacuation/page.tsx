'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Route,
  Home,
  Users,
  Phone,
  MapPin,
  Navigation,
  Loader2,
  Heart,
  Utensils,
  Droplets,
  X
} from 'lucide-react';

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
});
import { useLocationStore } from '@/lib/store';
import { toast } from 'sonner';

// Mock shelter data
const mockShelters = [
  {
    id: 1,
    name: 'Hapur Community Center',
    address: 'Garh Road, Hapur, UP 245101',
    total_capacity: 500,
    current_occupancy: 120,
    has_medical: true,
    has_food: true,
    has_water: true,
    elevation: 85.5,
    distance_km: 2.3,
    contact_phone: '+919031851732',
    latitude: 28.730,
    longitude: 77.775,
  },
  {
    id: 2,
    name: 'Government School Shelter',
    address: 'Delhi Road, Hapur, UP 245101',
    total_capacity: 300,
    current_occupancy: 45,
    has_medical: false,
    has_food: true,
    has_water: true,
    elevation: 78.2,
    distance_km: 4.1,
    contact_phone: '+919031851732',
    latitude: 28.725,
    longitude: 77.780,
  },
  {
    id: 3,
    name: 'Sports Complex Emergency',
    address: 'Mandi Area, Hapur, UP 245101',
    total_capacity: 800,
    current_occupancy: 230,
    has_medical: true,
    has_food: true,
    has_water: true,
    elevation: 92.0,
    distance_km: 5.8,
    contact_phone: '+919031851732',
    latitude: 28.735,
    longitude: 77.785,
  },
];

export default function EvacuationPage() {
  const { latitude, longitude, isLoading: locationLoading, requestLocation } = useLocationStore();
  const [selectedShelter, setSelectedShelter] = useState<number | null>(null);
  const [routePreference, setRoutePreference] = useState<string>('safest');
  const [routeResult, setRouteResult] = useState<any | null>(null);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [modalShelter, setModalShelter] = useState<any | null>(null);
  const [showContactNumber, setShowContactNumber] = useState(false);

  const handleCalculateRoute = (shelterId: number) => {
    // Use default Hapur location if user location not available
    const userLat = latitude || 28.730;
    const userLng = longitude || 77.775;

    const shelter = mockShelters.find(s => s.id === shelterId);
    setModalShelter(shelter);
    setShowRouteModal(true);
    setSelectedShelter(shelterId);
    
    // Mock route result since backend may not be running
    setTimeout(() => {
      setRouteResult({
        estimated_time_min: Math.floor(Math.random() * 20) + 10,
        safety_score: Math.floor(Math.random() * 20) + 80,
      });
      toast.success('Route calculated successfully!');
    }, 1000);
  };

  const handleContact = () => {
    setShowContactNumber(true);
    toast.success('Contact number displayed');
  };

  // Filter shelters based on route preference
  const filteredShelters = routePreference === 'safest' 
    ? mockShelters.slice(0, 2) 
    : routePreference === 'fastest'
    ? mockShelters.slice(0, 1)
    : mockShelters.slice(0, 2);

  const totalCapacity = filteredShelters.reduce((sum, s) => sum + s.total_capacity, 0);
  const totalOccupancy = filteredShelters.reduce((sum, s) => sum + s.current_occupancy, 0);

  return (
    <div className="pb-6 md:pb-10 font-sans">

      {/* Route Map Modal */}
      {showRouteModal && modalShelter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl md:rounded-2xl max-w-4xl w-full max-h-[92vh] md:max-h-[88vh] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Route to {modalShelter.name}</h3>
                <p className="text-sm text-slate-500">{modalShelter.address}</p>
              </div>
              <button onClick={() => setShowRouteModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div className="h-[300px] md:h-[500px] overflow-hidden">
              <MapView 
                initialViewState={{
                  latitude: latitude || 28.730,
                  longitude: longitude || 77.775,
                  zoom: 12,
                }}
                markers={[
                  {
                    id: 'user',
                    latitude: latitude || 28.730,
                    longitude: longitude || 77.775,
                    type: 'user',
                    title: 'Your Location',
                  },
                  {
                    id: modalShelter.id,
                    latitude: modalShelter.latitude,
                    longitude: modalShelter.longitude,
                    type: 'shelter',
                    title: modalShelter.name,
                    description: modalShelter.address,
                  }
                ]}
                height="100%"
              />
            </div>
            <div className="p-4 bg-slate-50 border-t">
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Distance</p>
                    <p className="font-bold text-slate-900">{modalShelter.distance_km} km</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Est. Time</p>
                    <p className="font-bold text-slate-900">{routeResult?.estimated_time_min || 15} min</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowRouteModal(false)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Number Modal */}
      {showContactNumber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 max-w-sm w-full shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <button onClick={() => setShowContactNumber(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Contact Shelter</h3>
            <p className="text-sm text-slate-500 mb-4">Call this number to inquire about shelter availability</p>
            <div className="bg-slate-50 rounded-xl p-4 mb-4">
              <p className="text-xs text-slate-500 mb-1">Emergency Contact</p>
              <a href="tel:+919031851732" className="text-2xl font-bold text-blue-600 hover:text-blue-700">+91 9031851732</a>
            </div>
            <button 
              onClick={() => setShowContactNumber(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 sticky top-14 md:top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Evacuation Grid</h1>
            <p className="text-slate-500 text-xs font-medium mt-1">Real-time shelter capacity and route planning</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8 space-y-4 md:space-y-8">

        {/* ── Stats Overview ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Shelters</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{mockShelters.length}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#006DC4]">
              <Home className="h-6 w-6" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total capacity</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{totalCapacity.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Occupancy Rate</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{((totalOccupancy / totalCapacity) * 100).toFixed(0)}%</p>
              <p className="text-xs text-slate-400 font-medium">Stable</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Shelter List ── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Available Facilities</h2>
            </div>
            {filteredShelters.map((shelter) => {
              const occupancyPct = shelter.current_occupancy / shelter.total_capacity;
              const statusColor = occupancyPct < 0.5 ? 'bg-emerald-500' : occupancyPct < 0.8 ? 'bg-amber-500' : 'bg-red-500';
              return (
                <div key={shelter.id} className={`group bg-white rounded-2xl border p-6 transition-all ${selectedShelter === shelter.id ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-100 shadow-sm hover:border-slate-300'}`}>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                          <Home className="h-6 w-6 text-slate-400 group-hover:text-[#006DC4] transition-colors" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#006DC4] transition-colors">{shelter.name}</h3>
                          <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {shelter.address}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <span>Occupancy</span>
                          <span className={occupancyPct > 0.8 ? 'text-red-500' : 'text-emerald-600'}>
                            {shelter.current_occupancy} <span className="text-slate-300">/</span> {shelter.total_capacity}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${statusColor}`}
                            style={{ width: `${occupancyPct * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {shelter.has_medical && <span className="inline-flex items-center px-2 py-1 rounded bg-red-50 text-red-600 text-xs font-bold"><Heart className="h-3 w-3 mr-1" /> Medical</span>}
                        {shelter.has_food && <span className="inline-flex items-center px-2 py-1 rounded bg-orange-50 text-orange-600 text-xs font-bold"><Utensils className="h-3 w-3 mr-1" /> Food</span>}
                        {shelter.has_water && <span className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-600 text-xs font-bold"><Droplets className="h-3 w-3 mr-1" /> Water</span>}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-slate-50 pt-4 md:pt-0 md:pl-6 md:w-48">
                      <div className="text-center mb-2">
                        <p className="text-2xl font-black text-slate-900">{shelter.distance_km}<span className="text-sm font-bold text-slate-400">km</span></p>
                        <p className="text-xs text-slate-400">Distance</p>
                      </div>
                      <button
                        onClick={() => handleCalculateRoute(shelter.id)}
                        className="w-full py-2.5 bg-[#006DC4] hover:bg-[#005a9f] text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <Route className="h-4 w-4" />
                        Get Route
                      </button>
                      <button 
                        onClick={handleContact}
                        className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <Phone className="h-4 w-4" />
                        Contact
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Route Panel ── */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-24">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Navigation className="h-5 w-5 text-slate-400" />
                Route Planner
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Preference</label>
                  <select
                    value={routePreference}
                    onChange={(e) => setRoutePreference(e.target.value)}
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm font-bold focus:outline-none"
                  >
                    <option value="safest">Safest (Avoid Flood Zones)</option>
                    <option value="fastest">Fastest</option>
                    <option value="shortest">Shortest</option>
                  </select>
                </div>

                {latitude && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-800">Location Locked</p>
                      <p className="text-[10px] text-emerald-600 font-mono">{latitude.toFixed(4)}, {longitude?.toFixed(4)}</p>
                    </div>
                  </div>
                )}

                {routeResult && selectedShelter && (
                  <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-2">
                    <h4 className="font-bold text-slate-900 text-sm mb-3">Route Summary</h4>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3 bg-slate-50 rounded-lg text-center">
                        <p className="text-xs text-slate-400 font-bold uppercase">Time</p>
                        <p className="text-xl font-black text-slate-800">{routeResult.estimated_time_min}m</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg text-center">
                        <p className="text-xs text-slate-400 font-bold uppercase">Safety</p>
                        <p className="text-xl font-black text-emerald-600">{routeResult.safety_score}%</p>
                      </div>
                    </div>
                    <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                      <Navigation className="h-4 w-4" />
                      Start Navigation
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
