'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { 
  AlertTriangle, FileText, MapPin, Activity, Waves, Home, Map, 
  Phone, Bell, Users, TrendingUp, Clock, Shield, Award,
  ChevronRight, PhoneCall, MessageSquare, CheckCircle2,
  Upload, Star, Trophy, BarChart3, Droplets, Navigation
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

// Dynamic import for MapView
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-[350px] bg-slate-100 rounded-lg animate-pulse flex items-center justify-center">
      <Map className="h-8 w-8 text-slate-400" />
    </div>
  ),
});

// Map markers
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

// NGO Rankings
const ngoRankings = [
  { rank: 1, name: 'Red Cross Varanasi', contributions: 145, points: 2850, avatar: '🏆' },
  { rank: 2, name: 'Green Earth Foundation', contributions: 132, points: 2640, avatar: '🥈' },
  { rank: 3, name: 'River Care Initiative', contributions: 118, points: 2360, avatar: '🥉' },
  { rank: 4, name: 'Community Aid Network', contributions: 95, points: 1900, avatar: '⭐' },
  { rank: 5, name: 'Ganga Seva Trust', contributions: 87, points: 1740, avatar: '⭐' },
];

export default function OfficialDashboard() {
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [showContributionForm, setShowContributionForm] = useState(false);

  const handleEmergencyAlert = () => {
    setEmergencyActive(true);
    // Simulate emergency broadcast
    setTimeout(() => {
      setEmergencyActive(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">NGO Command Center</h1>
              <p className="text-sm text-slate-500 mt-0.5">Coordinate flood response & track contributions</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 px-3 py-1">
                <Activity className="h-3 w-3 mr-1.5" />
                System Active
              </Badge>
              <Button size="sm" variant="outline" className="rounded-lg">
                <Bell className="h-4 w-4 mr-1.5" />
                Notifications
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Emergency Alert Status */}
        {emergencyActive && (
          <Alert className="mb-6 border-red-200 bg-red-50 animate-pulse">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-900 flex items-center justify-between">
              <span>
                <strong>EMERGENCY BROADCAST ACTIVE:</strong> SMS & Voice calls being sent to all registered citizens and officials...
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* Emergency Broadcast Button */}
        <Card className="mb-6 border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-red-600 flex items-center justify-center">
                  <PhoneCall className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Emergency Broadcast System</h2>
                  <p className="text-sm text-slate-600 mt-0.5">Send instant SMS & voice alerts to all citizens in affected zones</p>
                </div>
              </div>
              <Button 
                size="lg" 
                onClick={handleEmergencyAlert}
                disabled={emergencyActive}
                className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl px-6"
              >
                <Phone className="h-5 w-5 mr-2" />
                {emergencyActive ? 'Broadcasting...' : 'Activate Emergency Alert'}
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-red-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-red-600" />
                <span className="text-sm text-slate-700"><strong>4,523</strong> Citizens registered</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-red-600" />
                <span className="text-sm text-slate-700"><strong>156</strong> Officials on duty</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-red-600" />
                <span className="text-sm text-slate-700"><strong>&lt;30s</strong> Delivery time</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Stats */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Today's Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { label: 'Active Alerts', value: '3', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
              { label: 'Water Level', value: '42.8m', icon: Droplets, color: 'text-blue-600', bg: 'bg-blue-100' },
              { label: 'Shelters Active', value: '12', icon: Home, color: 'text-emerald-600', bg: 'bg-emerald-100' },
              { label: 'People Evacuated', value: '1,234', icon: Users, color: 'text-violet-600', bg: 'bg-violet-100' },
              { label: 'Reports Today', value: '45', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-100' },
              { label: 'NGOs Active', value: '28', icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-100' },
            ].map((stat, idx) => (
              <Card key={idx} className="border-slate-200 bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className={`h-10 w-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Live Map - Spans 2 columns */}
          <Card className="lg:col-span-2 border-slate-200 bg-white">
            <CardHeader className="pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Live Flood Map</CardTitle>
                  <CardDescription className="text-slate-500 text-sm">Real-time monitoring of flood zones</CardDescription>
                </div>
                <Link href="/official/zones">
                  <Button size="sm" variant="outline" className="border-slate-300 rounded-lg">
                    Manage Zones
                  </Button>
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

          {/* Quick Actions */}
          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <Link href="/official/evacuation">
                  <Button variant="outline" className="w-full justify-start border-slate-200 rounded-lg h-auto py-3">
                    <Navigation className="h-4 w-4 mr-3 text-blue-600" />
                    <div className="text-left">
                      <p className="font-medium text-sm">Plan Evacuation</p>
                      <p className="text-xs text-slate-500">Route optimizer</p>
                    </div>
                  </Button>
                </Link>
                <Link href="/official/zones">
                  <Button variant="outline" className="w-full justify-start border-slate-200 rounded-lg h-auto py-3">
                    <MapPin className="h-4 w-4 mr-3 text-violet-600" />
                    <div className="text-left">
                      <p className="font-medium text-sm">Manage Zones</p>
                      <p className="text-xs text-slate-500">Flood risk areas</p>
                    </div>
                  </Button>
                </Link>
                <Link href="/official/reports">
                  <Button variant="outline" className="w-full justify-start border-slate-200 rounded-lg h-auto py-3">
                    <FileText className="h-4 w-4 mr-3 text-emerald-600" />
                    <div className="text-left">
                      <p className="font-medium text-sm">Review Reports</p>
                      <p className="text-xs text-slate-500">45 pending</p>
                    </div>
                  </Button>
                </Link>
                <Link href="/official/alerts">
                  <Button variant="outline" className="w-full justify-start border-slate-200 rounded-lg h-auto py-3">
                    <AlertTriangle className="h-4 w-4 mr-3 text-red-600" />
                    <div className="text-left">
                      <p className="font-medium text-sm">Send Alert</p>
                      <p className="text-xs text-slate-500">Broadcast system</p>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* NGO Contribution System */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Submit Contribution */}
          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Upload className="h-4 w-4 text-white" />
                </div>
                Submit Your Contribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-slate-600 mb-4">
                Log your NGO's flood relief activities to earn ranking points and showcase your impact.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { icon: Users, label: 'People Helped', color: 'text-emerald-600' },
                  { icon: Home, label: 'Shelters Setup', color: 'text-blue-600' },
                  { icon: Droplets, label: 'Water Supplied', color: 'text-cyan-600' },
                  { icon: Shield, label: 'Safety Training', color: 'text-violet-600' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setShowContributionForm(true)}
                    className="p-3 rounded-lg border border-slate-200 text-center hover:border-blue-300 hover:bg-blue-50 transition-all"
                  >
                    <item.icon className={`h-5 w-5 ${item.color} mx-auto mb-1.5`} />
                    <p className="text-xs font-medium text-slate-900">{item.label}</p>
                  </button>
                ))}
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg">
                <Upload className="h-4 w-4 mr-2" />
                Submit New Contribution
              </Button>
              <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Your Points This Month</span>
                  <span className="font-bold text-slate-900">285 pts</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievement Tracking */}
          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-amber-600 flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-white" />
                </div>
                Your Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 mb-4">
                {[
                  { title: 'Total Contributions', value: '42', icon: Award, progress: 84 },
                  { title: 'People Impacted', value: '1,250', icon: Users, progress: 62 },
                  { title: 'Current Ranking', value: '#8', icon: Trophy, progress: 45 },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 text-amber-600" />
                        <span className="text-sm text-slate-700">{item.title}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{item.value}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div 
                        className="bg-amber-600 h-1.5 rounded-full transition-all" 
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Link href="#rankings">
                <Button variant="outline" className="w-full border-slate-300 rounded-lg">
                  View Full Leaderboard
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* NGO Rankings Leaderboard */}
        <Card id="rankings" className="border-slate-200 bg-white">
          <CardHeader className="pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-600" />
                  NGO Contribution Rankings
                </CardTitle>
                <CardDescription className="text-sm text-slate-500 mt-1">
                  Top performing NGOs in flood relief efforts this month
                </CardDescription>
              </div>
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1">
                Live Rankings
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {ngoRankings.map((ngo) => (
                <div 
                  key={ngo.rank}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-md ${
                    ngo.rank <= 3 
                      ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200' 
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`text-3xl ${ngo.rank <= 3 ? 'scale-110' : ''}`}>
                      {ngo.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900">{ngo.name}</p>
                        {ngo.rank <= 3 && (
                          <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-100 text-xs">
                            Top {ngo.rank}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {ngo.contributions} contributions • {ngo.points} points
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Rank</p>
                      <p className="text-2xl font-black text-slate-900">#{ngo.rank}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Rankings updated every hour</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last update: 5 mins ago
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Zones & Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Risk Zones */}
          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle className="text-base font-semibold">High Risk Zones</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {[
                  { name: 'Zone A - Varanasi Ghats', risk: 'high', affected: '5,200', trend: 'up' },
                  { name: 'Zone B - Allahabad Bank', risk: 'medium', affected: '2,800', trend: 'stable' },
                  { name: 'Zone C - Patna East', risk: 'low', affected: '1,100', trend: 'down' },
                ].map((zone, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${
                        zone.risk === 'high' ? 'bg-red-500' :
                        zone.risk === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{zone.name}</p>
                        <p className="text-xs text-slate-500">{zone.affected} people affected</p>
                      </div>
                    </div>
                    <TrendingUp className={`h-4 w-4 ${
                      zone.trend === 'up' ? 'text-red-600' :
                      zone.trend === 'down' ? 'text-emerald-600' : 'text-slate-400'
                    } ${zone.trend === 'down' ? 'rotate-180' : ''}`} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {[
                  { icon: PhoneCall, text: 'Emergency broadcast sent', time: '5 mins ago', color: 'text-red-600' },
                  { icon: FileText, text: 'New report verified', time: '15 mins ago', color: 'text-emerald-600' },
                  { icon: Users, text: '50 people evacuated to shelter', time: '1 hour ago', color: 'text-blue-600' },
                ].map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <activity.icon className={`h-4 w-4 ${activity.color} mt-0.5`} />
                    <div className="flex-1">
                      <p className="text-sm text-slate-900">{activity.text}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
