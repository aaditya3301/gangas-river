"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, MapPin, Navigation, Route } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { evacuationAPI } from "@/lib/api";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

type Shelter = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  total_capacity?: number;
  current_occupancy?: number;
  has_medical?: boolean;
  has_food?: boolean;
  has_water?: boolean;
  contact_phone?: string;
  elevation?: number;
  distance_km?: number;
};

type RouteChoice = {
  type: string;
  geometry: { type: string; coordinates: number[][] };
  distance_km: number;
  duration_min: number;
};

type RouteResponse = {
  routes: RouteChoice[];
};

type Point = { lat: number; lng: number };

function occupancySeverity(shelter: Shelter): "low" | "medium" | "high" {
  const total = shelter.total_capacity || 1;
  const current = shelter.current_occupancy || 0;
  const ratio = current / total;
  if (ratio < 0.5) return "low";
  if (ratio < 0.8) return "medium";
  return "high";
}

export default function OfficialEvacuationPage() {
  const [clickMode, setClickMode] = useState<"start" | "end">("start");
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [endPoint, setEndPoint] = useState<Point | null>(null);
  const [routePreference, setRoutePreference] = useState<"fastest" | "safest" | "shortest">("safest");
  const [activeRoute, setActiveRoute] = useState<RouteChoice | null>(null);

  const { data: shelters = [], isLoading: sheltersLoading } = useQuery<Shelter[]>({
    queryKey: ["official-all-shelters"],
    queryFn: () => evacuationAPI.getShelters(25.4, 82.0, 500),
    refetchInterval: 60_000,
  });

  const calculateRoute = useMutation({
    mutationFn: async () => {
      if (!startPoint || !endPoint) {
        throw new Error("Set both start and destination points");
      }
      return evacuationAPI.getRoute({
        start_lat: startPoint.lat,
        start_lng: startPoint.lng,
        end_lat: endPoint.lat,
        end_lng: endPoint.lng,
        preference: routePreference,
      }) as Promise<RouteResponse>;
    },
    onSuccess: (data) => {
      const preferred = data.routes?.find((r) => r.type === routePreference) || data.routes?.[0] || null;
      setActiveRoute(preferred);
      toast.success("Route calculated");
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Route calculation failed");
    },
  });

  const mapMarkers = useMemo(() => {
    const shelterMarkers = shelters.map((shelter) => ({
      id: `shelter-${shelter.id}`,
      latitude: shelter.lat,
      longitude: shelter.lng,
      type: "shelter" as const,
      severity: occupancySeverity(shelter),
      title: shelter.name,
      description: `${shelter.current_occupancy || 0}/${shelter.total_capacity || 0} occupied`,
    }));

    const planningMarkers = [
      startPoint
        ? {
            id: "start-point",
            latitude: startPoint.lat,
            longitude: startPoint.lng,
            type: "user" as const,
            title: "Start Point",
            description: "Selected on map",
          }
        : null,
      endPoint
        ? {
            id: "end-point",
            latitude: endPoint.lat,
            longitude: endPoint.lng,
            type: "alert" as const,
            severity: "critical" as const,
            title: "Destination",
            description: "Selected on map",
          }
        : null,
    ].filter((item): item is NonNullable<typeof item> => item !== null);

    return [...shelterMarkers, ...planningMarkers];
  }, [shelters, startPoint, endPoint]);

  const totalCapacity = shelters.reduce((sum, shelter) => sum + (shelter.total_capacity || 0), 0);
  const totalOccupancy = shelters.reduce((sum, shelter) => sum + (shelter.current_occupancy || 0), 0);
  const occupancyPct = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Evacuation Planning</h1>
        <p className="text-sm text-slate-500">Click map to set route start/end and plan movement between zones.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-slate-500">Shelters</p>
          <p className="text-2xl font-semibold">{sheltersLoading ? "..." : shelters.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Total Capacity</p>
          <p className="text-2xl font-semibold">{totalCapacity}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Occupancy</p>
          <p className="text-2xl font-semibold">{occupancyPct}%</p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b flex flex-wrap items-center gap-2">
          <button
            onClick={() => setClickMode("start")}
            className={`rounded-md px-3 py-2 text-xs font-semibold border ${clickMode === "start" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-200"}`}
          >
            Set Start Point
          </button>
          <button
            onClick={() => setClickMode("end")}
            className={`rounded-md px-3 py-2 text-xs font-semibold border ${clickMode === "end" ? "bg-rose-600 text-white border-rose-600" : "bg-white text-slate-700 border-slate-200"}`}
          >
            Set Destination
          </button>

          <select
            value={routePreference}
            onChange={(event) => setRoutePreference(event.target.value as typeof routePreference)}
            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="fastest">Fastest</option>
            <option value="safest">Safest</option>
            <option value="shortest">Shortest</option>
          </select>

          <button
            onClick={() => calculateRoute.mutate()}
            className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
            disabled={!startPoint || !endPoint || calculateRoute.isPending}
          >
            {calculateRoute.isPending ? <Loader2 className="h-4 w-4 animate-spin inline" /> : "Calculate Route"}
          </button>

          <button
            onClick={() => {
              setStartPoint(null);
              setEndPoint(null);
              setActiveRoute(null);
            }}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
          >
            Clear Points
          </button>
        </div>

        <MapView
          initialViewState={{ latitude: 25.4358, longitude: 81.8463, zoom: 7 }}
          markers={mapMarkers}
          routes={
            activeRoute
              ? [
                  {
                    id: "planned-route",
                    coordinates: activeRoute.geometry.coordinates,
                    color: "#2563eb",
                    label: `${activeRoute.distance_km} km · ${activeRoute.duration_min} min`,
                  },
                ]
              : []
          }
          onMapClick={(lat, lng) => {
            if (clickMode === "start") {
              setStartPoint({ lat, lng });
              setClickMode("end");
            } else {
              setEndPoint({ lat, lng });
              setClickMode("start");
            }
          }}
          showUserLocation={false}
          height="60vh"
        />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4 space-y-3">
          <h2 className="font-semibold">Selected Route</h2>
          {!activeRoute ? (
            <p className="text-sm text-slate-500">Set points and calculate route to view details.</p>
          ) : (
            <div className="space-y-1 text-sm text-slate-700">
              <p className="flex items-center gap-2"><Route className="h-4 w-4" /> Type: {activeRoute.type}</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Distance: {activeRoute.distance_km} km</p>
              <p className="flex items-center gap-2"><Navigation className="h-4 w-4" /> ETA: {activeRoute.duration_min} min</p>
            </div>
          )}
        </Card>

        <Card className="p-4 space-y-3">
          <h2 className="font-semibold">Shelter Capacity</h2>
          {sheltersLoading ? (
            <p className="text-sm text-slate-500">Loading shelters...</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {shelters.map((shelter) => {
                const total = shelter.total_capacity || 1;
                const current = shelter.current_occupancy || 0;
                const pct = Math.round((current / total) * 100);
                return (
                  <div key={shelter.id} className="rounded-md border p-3">
                    <p className="text-sm font-medium">{shelter.name}</p>
                    <p className="text-xs text-slate-500">{shelter.address || "Address unavailable"}</p>
                    <div className="mt-2 h-2 rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${pct < 50 ? "bg-emerald-500" : pct < 80 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${Math.max(5, Math.min(100, pct))}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-600">{current}/{total} occupied</p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
