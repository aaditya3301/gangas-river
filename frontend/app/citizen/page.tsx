import Link from 'next/link';
import { Shield, FileText, Leaf, Bell, ArrowRight, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const features = [
  {
    href: '/citizen/safety',
    icon: Shield,
    title: 'Am I Safe?',
    description: 'Check flood risk at your current GPS location',
    color: 'bg-emerald-600',
  },
  {
    href: '/citizen/report',
    icon: FileText,
    title: 'Report Issue',
    description: 'Report floods, pollution, or infrastructure damage',
    color: 'bg-blue-600',
  },
  {
    href: '/citizen/farming',
    icon: Leaf,
    title: 'Farming Advisory',
    description: 'Get AI-powered crop recommendations',
    color: 'bg-amber-600',
  },
  {
    href: '/citizen/alerts',
    icon: Bell,
    title: 'Flood Alerts',
    description: 'View active flood warnings in your area',
    color: 'bg-red-600',
  },
];

export default function CitizenHome() {
  return (
    <div className="space-y-6 pb-4 max-w-4xl mx-auto">
      {/* Hero Section */}
      <section className="text-center space-y-4 py-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100">
          <Shield className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">Your AI-powered safety companion</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
          Welcome to AquaGuardians
        </h1>
        <p className="text-slate-600 text-base max-w-2xl mx-auto">
          Stay safe with real-time flood alerts and AI-powered farming recommendations
        </p>
      </section>

      {/* Quick Safety Check CTA */}
      <Link href="/citizen/safety" className="block group">
        <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 border-0 text-white shadow-lg hover:shadow-xl transition-all">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Shield className="h-7 w-7" />
              </div>
              <div>
                <h2 className="font-bold text-xl">Check Your Safety</h2>
                <p className="text-emerald-100 text-sm mt-1">Tap to check flood risk at your location</p>
              </div>
            </div>
            <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
          </CardContent>
        </Card>
      </Link>

      {/* Feature Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-xl text-slate-900">Quick Actions</h2>
          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900">
            View All
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <Link key={feature.href} href={feature.href} className="block group">
              <Card className="border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all bg-white">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-xl ${feature.color} flex items-center justify-center flex-shrink-0`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                        {feature.title}
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Info Section */}
      <Card className="border-blue-200 bg-blue-50/30 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">About AquaGuardians</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                Uses government LiDAR data and AI to predict flood risks and provide real-time 
                safety information for residents along the Ganga River corridor.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="px-2 py-1 rounded-md bg-white border border-slate-200">Riverathon 1.0</span>
                <span className="px-2 py-1 rounded-md bg-white border border-slate-200">NMCG LiDAR Data</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
