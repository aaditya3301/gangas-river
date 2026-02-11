'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import {
  Bell, AlertTriangle, MapPin, Navigation, TrendingUp,
  Droplets, Phone, FileText, ChevronRight, Activity,
  Calendar, Clock, Shield, CheckCircle2, MessageSquare,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { emergencyAPI } from '@/lib/api';

export default function CitizenDashboard() {
  const [activeAlert, setActiveAlert] = useState(true);
  const [citizenPhone, setCitizenPhone] = useState('');
  const [whatsappSubscribed, setWhatsappSubscribed] = useState(false);

  const testAlertMutation = useMutation({
    mutationFn: () => emergencyAPI.activate({
      message: 'This is a TEST alert from AquaGuardians. You are now subscribed to emergency WhatsApp alerts for flood warnings in your area. Stay safe!',
      severity: 'info',
    }),
    onSuccess: (data: any) => {
      toast.success('✅ Test WhatsApp alert sent! Check your WhatsApp.');
      setWhatsappSubscribed(true);
    },
    onError: (error: any) => {
      const detail = error?.response?.data?.detail || error.message || 'Unknown error';
      toast.error(`Failed to send test alert: ${detail}`);
    },
  });

  const handleSubscribe = () => {
    if (!citizenPhone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }
    testAlertMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Citizen Dashboard</h1>
              <p className="text-sm text-slate-500 mt-0.5">Stay safe, stay informed</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-slate-500">Current Location</p>
                <p className="text-sm font-medium text-slate-900 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  Varanasi, UP
                </p>
              </div>
              <Button size="sm" variant="outline" className="rounded-lg">
                <Bell className="h-4 w-4 mr-1.5" />
                Alerts
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Active Alert Banner */}
        {activeAlert && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-900 flex items-center justify-between">
              <span>
                <strong>Moderate Flood Warning:</strong> Water level rising in Ganga River. Expected to reach 45.2m by tomorrow.
              </span>
              <Button variant="ghost" size="sm" onClick={() => setActiveAlert(false)} className="text-amber-900 hover:text-amber-950">
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Today's Highlights */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Today's Highlights</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-slate-200 bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">Safe</div>
                </div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Your Area Status</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Droplets className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">42.8m</div>
                </div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Current Water Level</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">24h</div>
                </div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Next Alert Check</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-violet-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">3</div>
                </div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Active Warnings</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Feature 1: Alerts & Notifications */}
          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <Bell className="h-4 w-4 text-white" />
                </div>
                Alerts & Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Get instant WhatsApp & SMS alerts when flood levels rise above safe thresholds in your area.
              </p>
              <div className="space-y-3 mb-4">
                {/* WhatsApp Alerts — functional */}
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-4 w-4 text-emerald-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">WhatsApp Alerts</p>
                      {whatsappSubscribed ? (
                        <div className="flex items-center gap-1 mt-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <p className="text-xs text-emerald-700 font-medium">Subscribed — you'll receive flood alerts on WhatsApp</p>
                        </div>
                      ) : (
                        <div className="mt-2 space-y-2">
                          <Input
                            placeholder="Enter your WhatsApp number (e.g. +919031851732)"
                            value={citizenPhone}
                            onChange={(e) => setCitizenPhone(e.target.value)}
                            className="h-8 text-sm"
                          />
                          <Button
                            size="sm"
                            onClick={handleSubscribe}
                            disabled={testAlertMutation.isPending}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                          >
                            {testAlertMutation.isPending ? (
                              <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                            ) : (
                              <MessageSquare className="h-3 w-3 mr-1.5" />
                            )}
                            {testAlertMutation.isPending ? 'Sending test...' : 'Subscribe & Send Test Alert'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* SMS Alerts */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                  <Phone className="h-4 w-4 text-emerald-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">SMS Alerts Enabled</p>
                    <p className="text-xs text-slate-500 mt-0.5">+91 98765-43210</p>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>

                {/* Push Notifications */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                  <Bell className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Push Notifications</p>
                    <p className="text-xs text-slate-500 mt-0.5">Real-time updates</p>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
              <Link href="/citizen/alerts">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-lg">
                  Manage Alerts
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Feature 2: Report Incidents */}
          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                Report Incidents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Report blocked drainage, water logging, or infrastructure issues in your community.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-lg border border-slate-200 text-center hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer">
                  <AlertTriangle className="h-5 w-5 text-slate-600 mx-auto mb-1.5" />
                  <p className="text-xs font-medium text-slate-900">Drainage Block</p>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 text-center hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer">
                  <Droplets className="h-5 w-5 text-slate-600 mx-auto mb-1.5" />
                  <p className="text-xs font-medium text-slate-900">Water Logging</p>
                </div>
              </div>
              <Link href="/citizen/report">
                <Button variant="outline" className="w-full border-slate-300 rounded-lg">
                  Submit New Report
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Feature 3: Flood Predictions */}
          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-violet-600 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                Flood Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                AI-powered 7-day flood forecasts for your area based on real-time data.
              </p>
              <div className="space-y-2 mb-4">
                {[
                  { day: 'Today', level: 'Low', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { day: 'Tomorrow', level: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-50' },
                  { day: 'Day 3', level: 'Low', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((item) => (
                  <div key={item.day} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <span className="text-sm text-slate-700">{item.day}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${item.bg} ${item.color}`}>
                      {item.level}
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/citizen/safety">
                <Button variant="outline" className="w-full border-slate-300 rounded-lg">
                  View Full Forecast
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Feature 4: Evacuation Routes */}
          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-red-600 flex items-center justify-center">
                  <Navigation className="h-4 w-4 text-white" />
                </div>
                Evacuation Routes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Find the safest and fastest evacuation path during flood emergencies.
              </p>
              <div className="p-4 rounded-lg bg-slate-50 mb-4 border border-slate-200">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Nearest Safe Zone</p>
                    <p className="text-xs text-slate-500 mt-1">Sigra Relief Camp - 2.3 km away</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-slate-600">
                      <Clock className="h-3 w-3" />
                      <span>Est. travel: 8 mins</span>
                    </div>
                  </div>
                </div>
              </div>
              <Link href="/citizen/safety">
                <Button variant="outline" className="w-full border-slate-300 rounded-lg">
                  View Route Map
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { icon: Bell, text: 'Flood alert sent to your phone', time: '2 hours ago', color: 'text-emerald-600' },
                { icon: FileText, text: 'Your drainage report was verified', time: '1 day ago', color: 'text-blue-600' },
                { icon: TrendingUp, text: 'Water level decreased by 0.5m', time: '2 days ago', color: 'text-violet-600' },
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
  );
}
