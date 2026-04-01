"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, LocateFixed, MapPin, Navigation, Route, Shield } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/PageHeader";
import { evacuationAPI } from "@/lib/api";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

type RoutePreference = "fastest" | "safest" | "shortest";

interface RouteGeometry {
  type: "LineString";
  coordinates: [number, number][];
}

interface RouteResult {
  type: string;
  geometry: RouteGeometry;
  distance_km: number;
  duration_min: number;
  steps: Array<{
    instruction: string;
    modifier: string;
    road_name: string;
    distance_m: number;
    duration_s: number;
  }>;
}

interface Shelter {
  id: number;
  name: string;
  lat: number;
  lng: number;
  capacity: number;
  has_medical: boolean;
  distance_km: number;
}

interface RoutePayload {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  preference?: string;
  routes: RouteResult[];
  shelter?: Shelter;
  error?: string;
}

interface DestinationCity {
  label: string;
  latitude: number;
  longitude: number;
  aliases: string[];
}

const routeColors: Record<string, string> = {
  fastest: "#2563eb",
  safest: "#16a34a",
  shortest: "#4b5563",
  direct: "#0f766e",
  alternative_1: "#9333ea",
  alternative_2: "#ca8a04",
};

const defaultCenter = {
  latitude: 25.3176,
  longitude: 82.9739,
};

const DESTINATION_CITIES: DestinationCity[] = [
  { label: "Varanasi", latitude: 25.3176, longitude: 82.9739, aliases: ["varanasi"] },
  { label: "Prayagraj", latitude: 25.4358, longitude: 81.8463, aliases: ["prayagraj", "allahabad"] },
  { label: "Hapur", latitude: 28.7306, longitude: 77.7811, aliases: ["hapur"] },
  { label: "Lucknow", latitude: 26.8467, longitude: 80.9462, aliases: ["lucknow"] },
  { label: "Kanpur", latitude: 26.4499, longitude: 80.3319, aliases: ["kanpur"] },
];

const CITY_MOCK_SHELTERS: Shelter[] = [
  { id: 1101, name: "Varanasi Shelter A", lat: 25.3248, lng: 82.9822, capacity: 260, has_medical: true, distance_km: 0 },
  { id: 1102, name: "Varanasi Shelter B", lat: 25.3074, lng: 82.9643, capacity: 220, has_medical: true, distance_km: 0 },
  { id: 1201, name: "Prayagraj Shelter A", lat: 25.4426, lng: 81.8589, capacity: 280, has_medical: true, distance_km: 0 },
  { id: 1202, name: "Prayagraj Shelter B", lat: 25.4289, lng: 81.8336, capacity: 240, has_medical: false, distance_km: 0 },
  { id: 1301, name: "Hapur Shelter A", lat: 28.7389, lng: 77.7932, capacity: 200, has_medical: true, distance_km: 0 },
  { id: 1302, name: "Hapur Shelter B", lat: 28.7242, lng: 77.7698, capacity: 190, has_medical: false, distance_km: 0 },
  { id: 1401, name: "Lucknow Shelter A", lat: 26.8568, lng: 80.9593, capacity: 300, has_medical: true, distance_km: 0 },
  { id: 1402, name: "Lucknow Shelter B", lat: 26.8391, lng: 80.9317, capacity: 250, has_medical: true, distance_km: 0 },
  { id: 1501, name: "Kanpur Shelter A", lat: 26.4587, lng: 80.3454, capacity: 230, has_medical: true, distance_km: 0 },
  { id: 1502, name: "Kanpur Shelter B", lat: 26.4381, lng: 80.3189, capacity: 210, has_medical: false, distance_km: 0 },
];

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
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

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const r = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function resolveDestinationByName(input: string): DestinationCity | null {
  const normalized = input.trim().toLowerCase();
  if (!normalized) return null;

  const exact = DESTINATION_CITIES.find(
    (city) => city.label.toLowerCase() === normalized || city.aliases.includes(normalized)
  );
  if (exact) return exact;

  const fuzzy = DESTINATION_CITIES.find(
    (city) =>
      city.label.toLowerCase().includes(normalized) ||
      city.aliases.some((alias) => alias.includes(normalized) || normalized.includes(alias))
  );
  return fuzzy ?? null;
}

export default function EvacuationPage() {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedRouteType, setSelectedRouteType] = useState<RoutePreference>("safest");
  const [destinationPlace, setDestinationPlace] = useState("Varanasi");
  const [routeData, setRouteData] = useState<RoutePayload | null>(null);
  const [locating, setLocating] = useState(false);

  const sheltersQuery = useQuery<Shelter[]>({
    queryKey: ["evacuation-shelters", userLocation?.latitude, userLocation?.longitude],
    queryFn: () => evacuationAPI.getShelters(userLocation!.latitude, userLocation!.longitude, 75),
    enabled: Boolean(userLocation),
    staleTime: 60_000,
  });

  const routeToShelterMutation = useMutation({
    mutationFn: (preference: RoutePreference) => {
      if (!userLocation) {
        throw new Error("User location is required");
      }
      return evacuationAPI.getRouteToShelter(userLocation.latitude, userLocation.longitude, preference);
    },
    onSuccess: (data: RoutePayload, preference) => {
      if (data.error) {
        toast.error(data.error);
        return;
      }
      setSelectedRouteType(preference);
      setRouteData(data);
      toast.success("Safe route to nearest shelter calculated");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to calculate route"));
    },
  });

  const customRouteMutation = useMutation({
    mutationFn: (payload: {
      start_lat: number;
      start_lng: number;
      end_lat: number;
      end_lng: number;
      preference: RoutePreference;
    }) => evacuationAPI.getRoute(payload),
    onSuccess: (data: RoutePayload, variables) => {
      setSelectedRouteType(variables.preference);
      setRouteData(data);
      toast.success("Evacuation route generated");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Unable to build custom route"));
    },
  });

  const displayRoutes = useMemo(() => routeData?.routes || [], [routeData]);

  const resolvedDestination = useMemo(
    () => resolveDestinationByName(destinationPlace),
    [destinationPlace]
  );

  const mapShelters = useMemo(() => {
    const merged = [...CITY_MOCK_SHELTERS, ...(sheltersQuery.data || [])];
    const anchor = userLocation
      ? { latitude: userLocation.latitude, longitude: userLocation.longitude }
      : resolvedDestination
        ? { latitude: resolvedDestination.latitude, longitude: resolvedDestination.longitude }
        : defaultCenter;

    return merged
      .map((shelter) => ({
        ...shelter,
        distance_km: Math.round(haversineKm(anchor.latitude, anchor.longitude, shelter.lat, shelter.lng) * 10) / 10,
      }))
      .sort((a, b) => a.distance_km - b.distance_km);
  }, [resolvedDestination, sheltersQuery.data, userLocation]);

  const focusedRoute = useMemo(() => {
    return displayRoutes.find((route) => route.type === selectedRouteType) || displayRoutes[0];
  }, [displayRoutes, selectedRouteType]);

  const mapMarkers = useMemo(() => {
    const shelterMarkers = mapShelters.map((shelter) => ({
      id: `shelter-${shelter.id}`,
      latitude: shelter.lat,
      longitude: shelter.lng,
      type: "shelter" as const,
      severity: shelter.has_medical ? "low" as const : "medium" as const,
      title: shelter.name,
      description: `${shelter.distance_km} km away`,
    }));

    const userMarker = userLocation
      ? [
          {
            id: "user-location",
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            type: "user" as const,
            title: "Your Location",
            description: "Current GPS position",
          },
        ]
      : [];

    const destinationMarker = resolvedDestination
      ? [
          {
            id: "destination-place",
            latitude: resolvedDestination.latitude,
            longitude: resolvedDestination.longitude,
            type: "alert" as const,
            severity: "medium" as const,
            title: `Destination: ${resolvedDestination.label}`,
            description: "Selected destination",
          },
        ]
      : [];

    return [...shelterMarkers, ...userMarker, ...destinationMarker];
  }, [mapShelters, resolvedDestination, userLocation]);

  const currentCenter = {
    latitude: userLocation?.latitude || defaultCenter.latitude,
    longitude: userLocation?.longitude || defaultCenter.longitude,
  };

  const locateMe = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported on this browser");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        toast.success("Location captured");
        setLocating(false);
      },
      (error) => {
        toast.error(error.message || "Unable to fetch GPS location");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const findRouteToNearest = () => {
    routeToShelterMutation.mutate(selectedRouteType);
  };

  const findCustomRoute = () => {
    if (!userLocation) {
      toast.error("Capture your current location first");
      return;
    }

    if (!resolvedDestination) {
      toast.error("Enter a valid destination place name");
      return;
    }

    const safestPreference: RoutePreference = "safest";
    setSelectedRouteType(safestPreference);

    customRouteMutation.mutate({
      start_lat: userLocation.latitude,
      start_lng: userLocation.longitude,
      end_lat: resolvedDestination.latitude,
      end_lng: resolvedDestination.longitude,
      preference: safestPreference,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Safe Evacuation Routes"
        description="Get route options to shelters with real road-network directions"
        icon={Navigation}
        iconColor="text-blue-600"
        iconBgColor="bg-blue-100"
        actions={
          <Button onClick={locateMe} disabled={locating} className="gap-2">
            {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
            Use My GPS
          </Button>
        }
      />

      <Card className="p-4 md:p-5 space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2 space-y-2">
            <Input
              list="destination-cities"
              placeholder="Destination place (e.g. Varanasi, Prayagraj, Hapur)"
              value={destinationPlace}
              onChange={(event) => setDestinationPlace(event.target.value)}
            />
            <datalist id="destination-cities">
              {DESTINATION_CITIES.map((city) => (
                <option key={city.label} value={city.label} />
              ))}
            </datalist>
            <p className="text-xs text-slate-500">
              {resolvedDestination
                ? `${resolvedDestination.label}: ${resolvedDestination.latitude.toFixed(4)} N, ${resolvedDestination.longitude.toFixed(4)} E`
                : "Use one of: Varanasi, Prayagraj, Hapur, Lucknow, Kanpur"}
            </p>
          </div>
          <Button onClick={findCustomRoute} disabled={customRouteMutation.isPending} className="gap-2">
            {customRouteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Route className="h-4 w-4" />}
            Build Safest Route
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["fastest", "safest", "shortest"] as RoutePreference[]).map((routeType) => (
            <Button
              key={routeType}
              variant={selectedRouteType === routeType ? "default" : "outline"}
              onClick={() => setSelectedRouteType(routeType)}
              className="capitalize"
            >
              {routeType}
            </Button>
          ))}

          <Button
            onClick={findRouteToNearest}
            disabled={!userLocation || routeToShelterMutation.isPending}
            variant="secondary"
            className="gap-2"
          >
            {routeToShelterMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
            Find Nearest Shelter Route
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden">
          <MapView
            initialViewState={{
              latitude: currentCenter.latitude,
              longitude: currentCenter.longitude,
              zoom: 10,
            }}
            markers={mapMarkers}
            routes={
              focusedRoute
                ? [
                    {
                      id: `route-${focusedRoute.type}`,
                      coordinates: focusedRoute.geometry.coordinates,
                      color: routeColors[focusedRoute.type] || "#16a34a",
                      label: `${focusedRoute.type} · ${focusedRoute.distance_km} km · ${focusedRoute.duration_min} min`,
                    },
                  ]
                : []
            }
            showUserLocation={Boolean(userLocation)}
            height="60vh"
          />
        </Card>

        <div className="space-y-4">
          <Card className="p-4 space-y-3">
            <h3 className="font-semibold text-slate-900">Current Route</h3>
            {!focusedRoute && <p className="text-sm text-slate-500">Generate a route to see distance and ETA.</p>}
            {focusedRoute && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Type</span>
                  <Badge className="capitalize">{focusedRoute.type}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Distance</span>
                  <span className="font-medium">{focusedRoute.distance_km} km</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">ETA</span>
                  <span className="font-medium">{focusedRoute.duration_min} min</span>
                </div>
                <p className="text-xs text-slate-500">Steps: {focusedRoute.steps.length}</p>
              </div>
            )}
          </Card>

          <Card className="p-4 space-y-3">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" /> Nearby Shelters
            </h3>

            {sheltersQuery.isLoading && <p className="text-sm text-slate-500">Loading shelters...</p>}
            {!userLocation && <p className="text-sm text-slate-500">Showing mapped shelters for major cities in your corridor.</p>}
            {mapShelters.slice(0, 6).map((shelter) => (
              <div key={shelter.id} className="rounded-lg border p-3 text-sm bg-white">
                <p className="font-medium text-slate-900">{shelter.name}</p>
                <p className="text-slate-500">{shelter.distance_km} km away</p>
                <p className="text-xs text-slate-400">Capacity: {shelter.capacity} {shelter.has_medical ? "- Medical support" : ""}</p>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
