"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Map, { Layer, Marker, NavigationControl, Source } from "react-map-gl/mapbox";
import type { StyleSpecification } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Loader2, LocateFixed, MapPin, Navigation, Route, Shield } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/PageHeader";
import { evacuationAPI } from "@/lib/api";

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

export default function EvacuationPage() {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedRouteType, setSelectedRouteType] = useState<RoutePreference>("fastest");
  const [destinationLat, setDestinationLat] = useState("");
  const [destinationLng, setDestinationLng] = useState("");
  const [routeData, setRouteData] = useState<RoutePayload | null>(null);
  const [locating, setLocating] = useState(false);

  const mapToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const mapStyle: string | StyleSpecification = mapToken
    ? "mapbox://styles/mapbox/streets-v12"
    : ({
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "OpenStreetMap",
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
          },
        ],
      } as StyleSpecification);

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

  const focusedRoute = useMemo(() => {
    return displayRoutes.find((route) => route.type === selectedRouteType) || displayRoutes[0];
  }, [displayRoutes, selectedRouteType]);

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

    const endLat = Number(destinationLat);
    const endLng = Number(destinationLng);
    if (Number.isNaN(endLat) || Number.isNaN(endLng)) {
      toast.error("Enter valid destination coordinates");
      return;
    }

    customRouteMutation.mutate({
      start_lat: userLocation.latitude,
      start_lng: userLocation.longitude,
      end_lat: endLat,
      end_lng: endLng,
      preference: selectedRouteType,
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
          <Input
            placeholder="Destination latitude"
            value={destinationLat}
            onChange={(event) => setDestinationLat(event.target.value)}
          />
          <Input
            placeholder="Destination longitude"
            value={destinationLng}
            onChange={(event) => setDestinationLng(event.target.value)}
          />
          <Button onClick={findCustomRoute} disabled={customRouteMutation.isPending} className="gap-2">
            {customRouteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Route className="h-4 w-4" />}
            Build Custom Route
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
          <div className="h-105 w-full">
            <Map
              initialViewState={{
                latitude: currentCenter.latitude,
                longitude: currentCenter.longitude,
                zoom: 11,
              }}
              mapStyle={mapStyle}
              mapboxAccessToken={mapToken}
              reuseMaps
              attributionControl
            >
              <NavigationControl position="top-right" />

              {displayRoutes.map((route) => {
                const feature = {
                  type: "Feature" as const,
                  properties: { type: route.type },
                  geometry: route.geometry,
                };

                const isSelected = route.type === (focusedRoute?.type || selectedRouteType);
                return (
                  <Source key={`route-${route.type}`} id={`route-${route.type}`} type="geojson" data={feature}>
                    <Layer
                      id={`route-layer-${route.type}`}
                      type="line"
                      paint={{
                        "line-color": routeColors[route.type] || "#2563eb",
                        "line-width": isSelected ? 5 : 3,
                        "line-opacity": isSelected ? 0.95 : 0.55,
                      }}
                    />
                  </Source>
                );
              })}

              {userLocation && (
                <Marker latitude={userLocation.latitude} longitude={userLocation.longitude}>
                  <div className="h-4 w-4 rounded-full bg-blue-600 border-2 border-white shadow" />
                </Marker>
              )}

              {(sheltersQuery.data || []).map((shelter) => (
                <Marker key={shelter.id} latitude={shelter.lat} longitude={shelter.lng}>
                  <div className="rounded bg-emerald-600 px-2 py-1 text-[10px] text-white shadow">
                    {shelter.name}
                  </div>
                </Marker>
              ))}
            </Map>
          </div>

          {!mapToken && (
            <div className="border-t bg-amber-50 px-3 py-2 text-xs text-amber-700">
              Mapbox token not set. Using OpenStreetMap tiles fallback.
            </div>
          )}
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
            {!userLocation && <p className="text-sm text-slate-500">Capture your GPS to load nearby shelters.</p>}
            {(sheltersQuery.data || []).slice(0, 5).map((shelter) => (
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
