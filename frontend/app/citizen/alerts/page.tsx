import { Bell, AlertTriangle, CheckCircle, Info, Phone, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Mock data - in production this would come from API
const alerts = [
  {
    id: 1,
    type: 'info',
    title: 'Normal Water Levels',
    message: 'Water levels in your district are within normal range.',
    timestamp: '2 hours ago',
    active: true,
  },
];

export default function AlertsPage() {
  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-200 mb-2">
          <Bell className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Flood Alerts</h1>
        <p className="text-slate-600">
          Real-time flood warnings for your area
        </p>
      </div>

      {/* Current Status */}
      <Card className="border-0 bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <CheckCircle className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">All Clear</h3>
              <p className="text-sm text-emerald-100">No active flood warnings in your area</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert History */}
      <div className="space-y-3">
        <h3 className="font-semibold text-slate-700">Recent Updates</h3>
        
        {alerts.map((alert) => (
          <div key={alert.id} className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                <Info className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-800">{alert.title}</h4>
                <p className="text-sm text-blue-700 mt-0.5">{alert.message}</p>
                <span className="text-xs text-blue-500 mt-1 block">{alert.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alert Types Explanation */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-lg">Understanding Alerts</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
            <Badge className="bg-gradient-to-r from-red-500 to-rose-600 text-white border-0">Critical</Badge>
            <span className="text-sm text-slate-700">Evacuate immediately</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
            <Badge className="bg-gradient-to-r from-orange-500 to-amber-600 text-white border-0">High</Badge>
            <span className="text-sm text-slate-700">Prepare for evacuation</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl">
            <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0">Medium</Badge>
            <span className="text-sm text-slate-700">Stay alert, avoid low areas</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
            <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0">Low</Badge>
            <span className="text-sm text-slate-700">Normal conditions</span>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="absolute inset-0 gradient-mesh opacity-20" />
        <CardHeader className="relative pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-lg text-white">Emergency Contacts</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-3">
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
            <span className="text-slate-300">National Emergency</span>
            <a href="tel:112" className="font-bold text-emerald-400 text-lg">112</a>
          </div>
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
            <span className="text-slate-300">NDMA Helpline</span>
            <a href="tel:1078" className="font-bold text-emerald-400 text-lg">1078</a>
          </div>
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
            <span className="text-slate-300">Flood Control Room</span>
            <a href="tel:1070" className="font-bold text-emerald-400 text-lg">1070</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
