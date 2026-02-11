'use client';

import Link from 'next/link';
import {
  Database,
  Code,
  Brain,
  TrendingUp,
  Download,
  FileJson,
  ArrowRight,
  Activity,
  HardDrive,
  Cpu,
  Clock,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const quickLinks = [
  {
    href: '/researcher/data',
    icon: Database,
    title: 'Data Sandbox',
    description: 'Download LiDAR datasets, river data, and flood records',
    color: 'bg-blue-600',
    stats: '1.7 GB available',
  },
  {
    href: '/researcher/api',
    icon: Code,
    title: 'API Documentation',
    description: 'REST API endpoints with authentication guides',
    color: 'bg-violet-600',
    stats: '15 endpoints',
  },
  {
    href: '/researcher/models',
    icon: Brain,
    title: 'Model Lab',
    description: 'Test flood prediction models with custom parameters',
    color: 'bg-amber-600',
    stats: '3 models',
  },
  {
    href: '/researcher/insights',
    icon: TrendingUp,
    title: 'Research Insights',
    description: 'Visualizations and analysis of flood patterns',
    color: 'bg-emerald-600',
    stats: 'Live data',
  },
];

const stats = [
  { label: 'Total Data', value: '1.7 GB', icon: HardDrive, color: 'bg-blue-600' },
  { label: 'API Calls Today', value: '4,467', icon: Activity, color: 'bg-violet-600' },
  { label: 'Avg Response', value: '65ms', icon: Clock, color: 'bg-emerald-600' },
  { label: 'Models Active', value: '3', icon: Cpu, color: 'bg-amber-600' },
];

const recentDatasets = [
  {
    name: 'Varanasi LiDAR Point Cloud',
    size: '856 MB',
    format: 'LAZ',
    updated: '2 days ago',
    downloads: 234,
  },
  {
    name: 'Ganga River Cross-sections',
    size: '45 MB',
    format: 'GeoJSON',
    updated: '1 week ago',
    downloads: 189,
  },
  {
    name: 'Historical Flood Records (2010-2025)',
    size: '12 MB',
    format: 'CSV',
    updated: '3 days ago',
    downloads: 456,
  },
];

const apiUsage = [
  { endpoint: '/api/zones/classify', calls: 1234, avgLatency: '45ms' },
  { endpoint: '/api/predict/flood', calls: 892, avgLatency: '120ms' },
  { endpoint: '/api/safety/check', calls: 2341, avgLatency: '32ms' },
];

export default function ResearcherDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Explore your needs here</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-300">
            <span className="hidden sm:inline">January</span>
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-11 w-11 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm font-medium text-slate-600">{stat.label}</p>
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

      {/* Quick Links */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href} className="group">
            <Card className="h-full border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <div className={`h-12 w-12 rounded-xl ${link.color} flex items-center justify-center mb-3`}>
                  <link.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-base flex items-center justify-between">
                  {link.title}
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-3 text-sm text-slate-600">{link.description}</CardDescription>
                <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 font-medium">
                  {link.stats}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Datasets */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Database className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Recent Datasets</CardTitle>
                <CardDescription className="text-sm">Most downloaded this week</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentDatasets.map((dataset, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 text-sm">{dataset.name}</p>
                    <div className="flex gap-2 mt-2 text-xs text-slate-600">
                      <span className="px-2 py-1 rounded-md bg-white border border-slate-200 font-medium">{dataset.size}</span>
                      <span className="px-2 py-1 rounded-md bg-white border border-slate-200 font-medium">{dataset.format}</span>
                      <span className="text-slate-500">{dataset.updated}</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <Badge variant="outline" className="text-xs border-slate-300 font-medium">
                      <Download className="h-3 w-3 mr-1" />
                      {dataset.downloads}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/researcher/data">
              <Button variant="outline" className="w-full mt-5 border-slate-300">
                View All Datasets
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* API Usage */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <Code className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">API Usage</CardTitle>
                <CardDescription className="text-sm">Most popular endpoints today</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {apiUsage.map((api, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
                  <div>
                    <code className="text-sm font-mono text-violet-700 bg-violet-50 px-2 py-1 rounded-md border border-violet-100">{api.endpoint}</code>
                    <div className="flex items-center gap-1 mt-2 text-xs text-slate-600">
                      <Zap className="h-3 w-3" />
                      Avg latency: {api.avgLatency}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 text-lg">{api.calls.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 font-medium">calls</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/researcher/api">
              <Button variant="outline" className="w-full mt-5 border-slate-300">
                View API Docs
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Start Guide */}
      <Card className="border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-5 w-5 text-emerald-400" />
                <h3 className="font-bold text-xl">Quick Start Guide</h3>
              </div>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                Get started with our APIs in minutes. Follow these steps to access flood prediction data.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-200">
                  <span className="h-8 w-8 rounded-lg bg-emerald-600/20 flex items-center justify-center text-sm font-bold text-emerald-400">1</span>
                  Generate API key from your profile
                </div>
                <div className="flex items-center gap-3 text-slate-200">
                  <span className="h-8 w-8 rounded-lg bg-emerald-600/20 flex items-center justify-center text-sm font-bold text-emerald-400">2</span>
                  <span>Install SDK: <code className="bg-slate-700 px-2 py-0.5 rounded text-emerald-300 text-sm ml-1">pip install aquaguardians</code></span>
                </div>
                <div className="flex items-center gap-3 text-slate-200">
                  <span className="h-8 w-8 rounded-lg bg-emerald-600/20 flex items-center justify-center text-sm font-bold text-emerald-400">3</span>
                  Make your first API call
                </div>
              </div>
            </div>
            <div className="w-full md:max-w-md bg-slate-950 border border-slate-700 text-emerald-400 p-5 rounded-xl font-mono text-sm overflow-x-auto shadow-xl">
              <pre className="text-xs leading-relaxed">{`import aquaguardians as ag

client = ag.Client(api_key="your-key")
result = client.predict.flood(
    lat=25.3176,
    lng=83.0065
)
print(result.risk_level)`}</pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
