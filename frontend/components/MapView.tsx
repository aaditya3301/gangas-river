'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Type definitions
interface ViewState {
  latitude: number;
  longitude: number;
  zoom: number;
}

export interface MapMarker {
  id: string | number;
  latitude: number;
  longitude: number;
  type: 'user' | 'shelter' | 'flood' | 'alert' | 'report';
  title?: string;
  description?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface FloodZone {
  id: string;
  coordinates: number[][];
  zone: 'A' | 'B' | 'C';
  name?: string;
}

export interface MapRoute {
  id: string | number;
  coordinates: number[][]; // [lng, lat]
  color?: string;
  weight?: number;
  label?: string;
}

interface MapViewProps {
  initialViewState?: Partial<ViewState>;
  markers?: MapMarker[];
  floodZones?: FloodZone[];
  routes?: MapRoute[];
  onMarkerClick?: (marker: MapMarker) => void;
  onMapClick?: (lat: number, lng: number) => void;
  showUserLocation?: boolean;
  interactive?: boolean;
  height?: string;
  className?: string;
}

const getMarkerColor = (type: MapMarker['type'], severity?: MapMarker['severity']) => {
  if (type === 'alert' || type === 'flood' || (type === 'shelter' && severity)) {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#3b82f6';
    }
  }
  switch (type) {
    case 'user': return '#3b82f6';
    case 'shelter': return '#22c55e';
    case 'report': return '#f97316';
    default: return '#6b7280';
  }
};

const getZoneStyle = (zone: 'A' | 'B' | 'C') => {
  switch (zone) {
    case 'A': return { color: '#dc2626', fillColor: '#ef4444', fillOpacity: 0.3 };
    case 'B': return { color: '#ca8a04', fillColor: '#eab308', fillOpacity: 0.25 };
    case 'C': return { color: '#16a34a', fillColor: '#22c55e', fillOpacity: 0.2 };
  }
};

// Create custom marker icons
const createIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
};

// Map click handler component
function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

// User location component
function LocationMarker({ show }: { show: boolean }) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const map = useMap();

  useEffect(() => {
    if (show) {
      map.locate().on('locationfound', (e) => {
        setPosition([e.latlng.lat, e.latlng.lng]);
        map.flyTo(e.latlng, map.getZoom());
      });
    }
  }, [map, show]);

  return position === null ? null : (
    <Marker 
      position={position} 
      icon={L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px #3b82f6, 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      })}
    >
      <Popup>You are here</Popup>
    </Marker>
  );
}

export default function MapView({
  initialViewState = {
    latitude: 25.3176,
    longitude: 83.0065,
    zoom: 12,
  },
  markers = [],
  floodZones = [],
  routes = [],
  onMarkerClick,
  onMapClick,
  showUserLocation = true,
  interactive = true,
  height = 'clamp(300px, 45vh, 500px)',
  className = '',
}: MapViewProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div 
        className={`relative w-full rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center ${className}`} 
        style={{ height }}
      >
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full rounded-lg overflow-hidden ${className}`} style={{ height }}>
      <MapContainer
        center={[initialViewState.latitude!, initialViewState.longitude!]}
        zoom={initialViewState.zoom!}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={interactive}
        dragging={interactive}
        doubleClickZoom={interactive}
        zoomControl={interactive}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler onMapClick={onMapClick} />
        <LocationMarker show={showUserLocation} />

        {/* Flood Zones */}
        {floodZones.map((zone) => {
          const style = getZoneStyle(zone.zone);
          // Convert [lng, lat] to [lat, lng] for Leaflet
          const positions = zone.coordinates.map(coord => [coord[1], coord[0]] as [number, number]);
          return (
            <Polygon
              key={zone.id}
              positions={positions}
              pathOptions={style}
            >
              {zone.name && <Popup>{zone.name} - Zone {zone.zone}</Popup>}
            </Polygon>
          );
        })}

        {/* Route Polylines */}
        {routes.map((route) => (
          <Polyline
            key={route.id}
            positions={route.coordinates.map((coord) => [coord[1], coord[0]] as [number, number])}
            pathOptions={{
              color: route.color || '#2563eb',
              weight: route.weight || 5,
              opacity: 0.85,
            }}
          >
            {route.label ? <Popup>{route.label}</Popup> : null}
          </Polyline>
        ))}

        {/* Markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.latitude, marker.longitude]}
            icon={createIcon(getMarkerColor(marker.type, marker.severity))}
            eventHandlers={{
              click: () => onMarkerClick?.(marker),
            }}
          >
            <Popup>
              <div className="min-w-30">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {marker.title || marker.type.charAt(0).toUpperCase() + marker.type.slice(1)}
                </h3>
                {marker.description && (
                  <p className="text-xs text-gray-600 mt-1">{marker.description}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {marker.latitude.toFixed(4)}, {marker.longitude.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend */}
      {floodZones.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-1000">
          <p className="text-xs font-semibold text-gray-700 mb-2">Flood Zones</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-4 h-3 bg-red-500/50 border border-red-600 rounded" />
              <span className="text-gray-600">Zone A (High Risk)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-4 h-3 bg-yellow-500/50 border border-yellow-600 rounded" />
              <span className="text-gray-600">Zone B (Medium)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-4 h-3 bg-green-500/50 border border-green-600 rounded" />
              <span className="text-gray-600">Zone C (Low Risk)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
