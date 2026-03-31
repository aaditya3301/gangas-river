"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, Map as MapIcon, Home, CheckCircle, Droplets, Loader2, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { toast } from "sonner";

export default function RoutesPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [routeFound, setRouteFound] = useState(false);
  const [activeRouteIndex, setActiveRouteIndex] = useState(0);

  const safeShelters = [
    {
      id: 1,
      name: "Gangotri Community Center",
      distance: "1.2 km",
      status: t("open"),
      capacity: "80%",
      address: "Block A, Near Old Temple",
      isSafest: true
    },
    {
      id: 2,
      name: "Saraswati School Hall",
      distance: "2.5 km",
      status: t("open"),
      capacity: "45%",
      address: "Main Road, Sector 4",
      isSafest: false
    },
    {
      id: 3,
      name: "City Hospital Ground",
      distance: "3.1 km",
      status: t("full"),
      capacity: "100%",
      address: "Hospital Road",
      isSafest: false
    }
  ];

  const handleSearch = () => {
    if (!searchQuery.trim()) {
        toast.error("Please enter a location first.");
        return;
    }
    
    setIsSearching(true);
    setRouteFound(false);

    // Simulate API call to GIS Service
    setTimeout(() => {
        setIsSearching(false);
        setRouteFound(true);
        toast.success("Safe evacuation route calculated!");
    }, 2000);
  };

  return (
    <div className="space-y-4 md:space-y-6 relative">
      {/* Decorative River Element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-100/40 to-transparent rounded-bl-full -z-10 pointer-events-none" />
      
      <div className="flex flex-col gap-2">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-blue-950">{t("safeRoutesTitle")}</h1>
        <p className="text-sm md:text-base text-gray-500">
          {t("safeRoutesDesc")}
        </p>
      </div>

      <div className="grid gap-3 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Search & Map Controls */}
        <Card className="col-span-full border-blue-100 shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-50">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-blue-800">
              <Navigation className="h-5 w-5 text-blue-600" />
              {t("planEvacuation")}
            </CardTitle>
            <CardDescription>{t("enterLocation")} {t("findRouteButton")}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                <Input 
                    className="pl-9 border-blue-200 focus-visible:ring-blue-500" 
                    placeholder={t("enterLocation")} 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button 
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-blue-600 hover:bg-blue-700 text-white h-10 md:h-11 min-w-[140px] shadow-lg shadow-blue-500/20"
              >
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Droplets className="h-4 w-4 mr-2 fill-blue-200" />}
                {t("findRouteButton")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Map */}
        <Card className="col-span-full lg:col-span-2 h-[300px] md:h-[400px] flex flex-col relative overflow-hidden bg-slate-50 border-2 border-blue-100 shadow-inner group">
            
            {/* Map Background Pattern (Simulated) */}
            <div className="absolute inset-0 opacity-10" 
                style={{
                  backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }} 
            />

            {!routeFound && !isSearching && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <div className="text-center space-y-3 p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-dashed border-gray-300">
                        <MapIcon className="h-12 w-12 mx-auto text-blue-200" />
                        <div>
                            <p className="font-medium text-gray-600">{t("mapLoading")}</p>
                            <p className="text-xs text-gray-400">{t("connectingGIS")}</p>
                        </div>
                    </div>
                </div>
            )}

            {isSearching && (
                 <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px] z-10">
                     <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                        <span className="text-sm font-medium text-blue-800 animate-pulse">Analyzing Flood Zones...</span>
                     </div>
                 </div>
            )}

            {routeFound && (
                <div className="relative w-full h-full bg-[#f8fafc]">
                    {/* Simulated SVG Route Map */}
                    <svg className="w-full h-full p-8" viewBox="0 0 400 300">
                        {/* Terrain/Zones */}
                        <path d="M0,300 C100,280 150,220 200,300 L0,300 Z" fill="#e2e8f0" /> {/* Safe Zone */}
                        <path d="M250,300 C300,250 350,250 400,280 L400,300 Z" fill="#fee2e2" opacity="0.5" /> {/* Danger Zone */}
                        
                        {/* River */}
                        <path d="M0,150 Q100,100 200,150 T400,150" fill="none" stroke="#60a5fa" strokeWidth="20" strokeOpacity="0.2" />
                        <path d="M0,150 Q100,100 200,150 T400,150" fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="5,5" />

                        {/* Route Line */}
                        <path 
                            d="M50,250 Q150,200 250,150 T350,50" 
                            fill="none" 
                            stroke="#16a34a" 
                            strokeWidth="4" 
                            strokeLinecap="round"
                            className="drop-shadow-lg"
                        />
                        
                        {/* Start Point */}
                        <circle cx="50" cy="250" r="6" fill="#ef4444" className="animate-pulse" />
                        <text x="30" y="270" fontSize="10" fill="#64748b" fontWeight="bold">You</text>

                        {/* End Point */}
                        <circle cx="350" cy="50" r="8" fill="#16a34a" />
                        <text x="330" y="35" fontSize="10" fill="#15803d" fontWeight="bold">Safe Zone</text>

                        {/* Animated User Marker */}
                        <circle cx="0" cy="0" r="4" fill="white" stroke="#16a34a" strokeWidth="2">
                            <animateMotion 
                                dur="3s" 
                                repeatCount="indefinite"
                                path="M50,250 Q150,200 250,150 T350,50"
                            />
                        </circle>
                    </svg>

                    {/* Overlay Info */}
                    <div className="absolute bottom-4 right-4 bg-white/95 p-4 rounded-lg shadow-xl max-w-xs border border-green-100 backdrop-blur">
                        <div className="text-sm font-bold text-green-800 mb-1 flex items-center gap-2">
                           {t("routeSuggestion")}
                           <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0 h-5 px-1.5 pointer-events-none">Optimal</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-green-600 font-semibold mb-1">
                            <CheckCircle className="h-3 w-3" /> {t("safePathDetected")}
                        </div>
                        <div className="text-xs text-slate-500 leading-relaxed">
                             {t("avoidFloodZone")} 
                             <span className="block mt-1 text-blue-600 font-medium">ETA: 15 mins</span>
                        </div>
                        <Button className="w-full mt-3 h-8 text-xs bg-green-600 hover:bg-green-700">
                             Go Now <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </Card>

        {/* Shelter List */}
        <Card className="col-span-full lg:col-span-1 h-[300px] md:h-[400px] flex flex-col bg-white border-blue-100/50 shadow-md">
          <CardHeader className="pb-3 border-b border-gray-100">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800">
              <Home className="h-5 w-5 text-green-600" />
              {t("nearbyShelters")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {safeShelters.map((shelter) => (
              <div 
                key={shelter.id} 
                className={`p-4 border rounded-xl transition-all cursor-pointer relative overflow-hidden group
                    ${routeFound && shelter.isSafest ? 'bg-green-50 border-green-200 shadow-sm ring-1 ring-green-200' : 'hover:bg-slate-50 border-slate-100'}
                `}
              >
                 {routeFound && shelter.isSafest && (
                     <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">
                         BEST OPTION
                     </div>
                 )}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900 text-sm leading-tight">{shelter.name}</h3>
                  <Badge variant={shelter.status === t('full') ? "destructive" : "default"} className={`ml-2 h-5 text-[10px] ${shelter.status === t('open') ? "bg-green-600 hover:bg-green-700" : ""}`}>
                    {shelter.status}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500 mb-3 flex items-start gap-1">
                    <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                    {shelter.address}
                </div>
                <div className="flex items-center justify-between text-xs bg-white/50 p-2 rounded-lg border border-gray-100">
                  <span className="flex items-center gap-1 font-medium text-blue-700"><Navigation className="h-3 w-3" /> {shelter.distance} {t("away")}</span>
                  <span className="text-gray-600">{t("capacity")}: <span className="font-semibold text-gray-900">{shelter.capacity}</span></span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
