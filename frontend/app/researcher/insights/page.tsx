'use client';

import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  LineChart,
  PieChart,
  Calendar,
  Droplets,
  ThermometerSun,
  Mountain,
  Users,
  AlertTriangle,
  FileText,
  Download,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock historical data
const yearlyFloodData = [
  { year: 2019, events: 12, deaths: 45, displaced: 125000, damage_cr: 450 },
  { year: 2020, events: 8, deaths: 23, displaced: 78000, damage_cr: 280 },
  { year: 2021, events: 15, deaths: 67, displaced: 189000, damage_cr: 620 },
  { year: 2022, events: 11, deaths: 34, displaced: 112000, damage_cr: 380 },
  { year: 2023, events: 9, deaths: 28, displaced: 95000, damage_cr: 310 },
  { year: 2024, events: 14, deaths: 52, displaced: 156000, damage_cr: 520 },
  { year: 2025, events: 3, deaths: 8, displaced: 34000, damage_cr: 95 },
];

const monthlyWaterLevel = [
  { month: 'Jan', level: 62.3, avg: 61.5 },
  { month: 'Feb', level: 60.8, avg: 60.2 },
  { month: 'Mar', level: 59.2, avg: 58.9 },
  { month: 'Apr', level: 58.5, avg: 58.1 },
  { month: 'May', level: 60.1, avg: 59.8 },
  { month: 'Jun', level: 68.4, avg: 67.2 },
  { month: 'Jul', level: 78.9, avg: 76.5 },
  { month: 'Aug', level: 82.3, avg: 79.8 },
  { month: 'Sep', level: 76.5, avg: 74.2 },
  { month: 'Oct', level: 69.8, avg: 68.5 },
  { month: 'Nov', level: 65.2, avg: 64.8 },
  { month: 'Dec', level: 63.1, avg: 62.5 },
];

const zoneDistribution = [
  { zone: 'Zone A (High Risk)', count: 45, area_km2: 125, population: 234000, color: 'bg-red-500' },
  { zone: 'Zone B (Medium Risk)', count: 89, area_km2: 310, population: 567000, color: 'bg-yellow-500' },
  { zone: 'Zone C (Low Risk)', count: 156, area_km2: 520, population: 890000, color: 'bg-green-500' },
];

const recentPatterns = [
  {
    title: 'Earlier Monsoon Onset',
    description: 'Monsoon arriving 10-15 days earlier than historical average',
    trend: 'up',
    impact: 'Increased flash flood risk in June',
  },
  {
    title: 'Higher Peak Water Levels',
    description: '12% increase in peak water levels over last decade',
    trend: 'up',
    impact: 'More Zone A classifications needed',
  },
  {
    title: 'Reduced Flood Duration',
    description: 'Flood events lasting 20% shorter but more intense',
    trend: 'down',
    impact: 'Faster evacuation response required',
  },
  {
    title: 'Urbanization Impact',
    description: 'Impervious surface area increased by 15% since 2015',
    trend: 'up',
    impact: 'Increased runoff and waterlogging',
  },
];

export default function InsightsPage() {
  const [timeRange, setTimeRange] = useState('5y');

  const totalEvents = yearlyFloodData.reduce((s, d) => s + d.events, 0);
  const totalDisplaced = yearlyFloodData.reduce((s, d) => s + d.displaced, 0);
  const avgDamage = yearlyFloodData.reduce((s, d) => s + d.damage_cr, 0) / yearlyFloodData.length;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="h-4 w-4 text-red-500" />;
      case 'down':
        return <ArrowDown className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const maxLevel = Math.max(...monthlyWaterLevel.map((m) => m.level));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Research Insights</h1>
          <p className="text-gray-500">Flood pattern analysis and trend visualizations</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1y">Last 1 Year</SelectItem>
              <SelectItem value="5y">Last 5 Years</SelectItem>
              <SelectItem value="10y">Last 10 Years</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Flood Events</p>
                <p className="text-2xl font-bold">{totalEvents}</p>
                <p className="text-xs text-gray-400">2019-2025</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Droplets className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">People Displaced</p>
                <p className="text-2xl font-bold">{(totalDisplaced / 1000).toFixed(0)}K</p>
                <p className="text-xs text-gray-400">Cumulative</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg. Damage/Year</p>
                <p className="text-2xl font-bold">₹{avgDamage.toFixed(0)}Cr</p>
                <p className="text-xs text-gray-400">Economic loss</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">High-Risk Zones</p>
                <p className="text-2xl font-bold">{zoneDistribution[0].count}</p>
                <p className="text-xs text-gray-400">Zone A areas</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Mountain className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Yearly Flood Events Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-blue-500" />
              Flood Events by Year
            </CardTitle>
            <CardDescription>Number of significant flood events per year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {yearlyFloodData.map((data) => (
                <div key={data.year} className="flex items-center gap-3">
                  <span className="w-12 text-sm font-medium text-gray-600">{data.year}</span>
                  <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded flex items-center justify-end pr-2"
                      style={{ width: `${(data.events / 15) * 100}%` }}
                    >
                      {data.events >= 5 && (
                        <span className="text-xs text-white font-medium">{data.events}</span>
                      )}
                    </div>
                  </div>
                  {data.events < 5 && (
                    <span className="text-xs text-gray-500">{data.events}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Water Level Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-cyan-500" />
              Monthly Water Levels (2024)
            </CardTitle>
            <CardDescription>Actual vs historical average (meters above datum)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-40 mb-2">
              {monthlyWaterLevel.map((data, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <div
                    className="w-full bg-cyan-500 rounded-t"
                    style={{ height: `${(data.level / maxLevel) * 100}%` }}
                  />
                  <div
                    className="w-full bg-cyan-200 rounded-t opacity-50"
                    style={{ height: `${(data.avg / maxLevel) * 100}%`, marginTop: '-100%' }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              {monthlyWaterLevel.map((data, i) => (
                <span key={i} className="w-6 text-center">{data.month}</span>
              ))}
            </div>
            <div className="flex gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-cyan-500 rounded" />
                <span className="text-gray-600">2024 Actual</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-cyan-200 rounded" />
                <span className="text-gray-600">Historical Average</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zone Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-500" />
              Zone Distribution
            </CardTitle>
            <CardDescription>Flood zone classification breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {zoneDistribution.map((zone) => (
                <div key={zone.zone} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${zone.color}`} />
                      <span className="font-medium text-sm text-gray-900">{zone.zone}</span>
                    </div>
                    <span className="text-sm text-gray-500">{zone.count} areas</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${zone.color}`}
                      style={{ width: `${(zone.count / 290) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{zone.area_km2} km²</span>
                    <span>{(zone.population / 1000).toFixed(0)}K population</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pattern Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Emerging Patterns
            </CardTitle>
            <CardDescription>Key trends identified from historical analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPatterns.map((pattern, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-2 mb-1">
                    {getTrendIcon(pattern.trend)}
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-900">{pattern.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{pattern.description}</p>
                    </div>
                  </div>
                  <div className="mt-2 ml-6">
                    <Badge variant="outline" className="text-xs">
                      Impact: {pattern.impact}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Research Notes */}
      <Card className="bg-emerald-50 border-emerald-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-medium text-emerald-900">Research Methodology</h3>
              <p className="text-sm text-emerald-700 mt-1">
                Analysis based on NMCG LiDAR data (1.7GB), CWC water level records, IMD rainfall data,
                and historical flood event records from 2010-2025. Zone classifications follow
                NDMA guidelines with elevation thresholds relative to mean sea level.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
