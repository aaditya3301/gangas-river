'use client';

import dynamic from 'next/dynamic';
import { 
  AlertTriangle,
  FileText,
  MapPin,
  Activity,
  Waves,
  Home,
  Map
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Dynamic import for MapView (requires client-side rendering)
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-[350px] bg-slate-100 rounded-lg animate-pulse flex items-center justify-center">
      <Map className="h-8 w-8 text-slate-400" />
    </div>
  ),
});

// Mock data - in production from API
const stats = [
  { title: 'Active Alerts', value: '0', icon: AlertTriangle, color: 'bg-emerald-600' },
  { title: 'Reports', value: '24', icon: FileText, color: 'bg-blue-600' },
  { title: 'Shelters', value: '12', icon: Home, color: 'bg-violet-600' },
  { title: 'Flood Zones', value: '8', icon: Waves, color: 'bg-amber-600' },
];

const recentReports = [
  { id: 1, category: 'flood', location: 'Varanasi Ghats', time: '2h ago', status: 'verified' },
  { id: 2, category: 'erosion', location: 'Allahabad Bank', time: '5h ago', status: 'pending' },
  { id: 3, category: 'pollution', location: 'Kanpur Industrial', time: '1d ago', status: 'verified' },
];

const riskZones = [
  { name: 'Zone A - Varanasi', risk: 'high', affected: '~5,000 people' },
  { name: 'Zone B - Allahabad', risk: 'medium', affected: '~2,500 people' },
  { name: 'Zone C - Patna', risk: 'low', affected: '~1,200 people' },
];

// Map markers for display
const mapMarkers = [
  { id: 'alert-1', latitude: 25.3109, longitude: 83.0107, type: 'alert' as const, title: 'Active Alert', description: 'Water rising at Dashashwamedh Ghat', severity: 'high' as const },
  { id: 'shelter-1', latitude: 25.2890, longitude: 83.0023, type: 'shelter' as const, title: 'Community Center', description: 'Capacity: 500' },
];

const floodZones = [
  {
    id: 'zone-a-varanasi',
    zone: 'A' as const,
    name: 'Varanasi Ghats High Risk',
    coordinates: [
      [83.000, 25.305],
      [83.020, 25.305],
      [83.020, 25.320],
      [83.000, 25.320],
      [83.000, 25.305],
    ],
  },
];

export default function OfficialDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Explore your needs here</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-slate-300">
            <span className="hidden sm:inline">January</span>
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-11 w-11 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm font-medium text-slate-600">{stat.title}</p>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Activity className="h-3 w-3 text-emerald-600" />
                    <span className="text-xs text-emerald-600 font-medium">10% vs last month</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live Map */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">Live Map</CardTitle>
              <CardDescription className="text-slate-500">Real-time flood monitoring</CardDescription>
            </div>
            <Link href="/official/zones">
              <Button variant="outline" size="sm" className="border-slate-300">Manage Zones</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <MapView
            initialViewState={{ latitude: 25.3109, longitude: 83.0065, zoom: 12 }}
            markers={mapMarkers}
            floodZones={floodZones}
            height="380px"
            showUserLocation={false}
          />
        </CardContent>
      </Card>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Risk Zones */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-slate-900">Risk Zones</CardTitle>
              <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {riskZones.map((zone, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      zone.risk === 'high' ? 'bg-red-100' :
                      zone.risk === 'medium' ? 'bg-amber-100' : 'bg-emerald-100'
                    }`}>
                      <div className={`h-3 w-3 rounded-full ${
                        zone.risk === 'high' ? 'bg-red-500' :
                        zone.risk === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{zone.name}</p>
                      <p className="text-sm text-slate-500">{zone.affected}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`font-medium ${
                    zone.risk === 'high' ? 'border-red-200 text-red-700 bg-red-50' :
                    zone.risk === 'medium' ? 'border-amber-200 text-amber-700 bg-amber-50' : 
                    'border-emerald-200 text-emerald-700 bg-emerald-50'
                  }`}>
                    {zone.risk.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-slate-900">Recent Reports</CardTitle>
              <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 capitalize">{report.category}</p>
                      <p className="text-sm text-slate-500">{report.location} • {report.time}</p>
                    </div>
                  </div>
                  <Badge className={report.status === 'verified' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-amber-100 text-amber-700 hover:bg-amber-100'}>
                    {report.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Bar */}
      <Card className="border-emerald-200 shadow-sm bg-emerald-50/50">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-emerald-900">All Systems Operational</p>
                <p className="text-sm text-emerald-600">Last updated: 2 minutes ago</p>
              </div>
            </div>
            <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-semibold px-3 py-1">
              LIVE
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
