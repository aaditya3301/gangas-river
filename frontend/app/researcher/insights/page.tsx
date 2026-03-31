"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, BarChart3, CheckCircle2, Lightbulb, MapPinned, TrendingUp } from "lucide-react";

import { Card } from "@/components/ui/card";
import { insightsAPI } from "@/lib/api";

interface TrendPoint {
  month: string;
  reports: number;
}

interface CategoryPoint {
  name: string;
  count: number;
}

interface VerificationBucket {
  range: string;
  count: number;
}

interface StatusPoint {
  name: string;
  count: number;
}

interface RegionPoint {
  lat: number;
  lng: number;
  report_count: number;
  avg_verification: number;
}

interface CuratedInsight {
  id: string;
  title: string;
  description: string;
  source: string;
  type: string;
}

const COLORS = ["#2563eb", "#dc2626", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899"];

const INSIGHT_ICONS: Record<string, string> = {
  seasonal: "rain",
  regional: "map",
  economic: "money",
  vulnerability: "home",
  intervention: "shield",
};

export default function InsightsPage() {
  const { data: trendData } = useQuery<{ trend: TrendPoint[] }>({
    queryKey: ["insights-trend"],
    queryFn: () => insightsAPI.getReportTrends(),
  });

  const { data: categoryData } = useQuery<{ categories: CategoryPoint[] }>({
    queryKey: ["insights-categories"],
    queryFn: () => insightsAPI.getCategoryDistribution(),
  });

  const { data: verificationData } = useQuery<{ distribution: VerificationBucket[]; avg_score: number; total_verified: number }>({
    queryKey: ["insights-verification"],
    queryFn: () => insightsAPI.getVerificationStats(),
  });

  const { data: statusData } = useQuery<{ statuses: StatusPoint[] }>({
    queryKey: ["insights-status"],
    queryFn: () => insightsAPI.getStatusBreakdown(),
  });

  const { data: regionalData } = useQuery<{ regions: RegionPoint[] }>({
    queryKey: ["insights-regions"],
    queryFn: () => insightsAPI.getRegionalSummary(),
  });

  const { data: curatedData } = useQuery<{ insights: CuratedInsight[] }>({
    queryKey: ["insights-curated"],
    queryFn: () => insightsAPI.getCuratedInsights(),
  });

  const totalReports = useMemo(
    () => (trendData?.trend ?? []).reduce((acc, point) => acc + point.reports, 0),
    [trendData?.trend]
  );

  const topRegion = useMemo(() => {
    const regions = regionalData?.regions ?? [];
    if (regions.length === 0) {
      return null;
    }
    return regions[0];
  }, [regionalData?.regions]);

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Insights and Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">
          Research-grade analytics from platform reports, verification outcomes, and curated flood intelligence.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <p className="text-xs text-slate-500">Total Reports</p>
          <p className="text-2xl font-bold mt-1">{totalReports}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-slate-500">Verified Reports</p>
          <p className="text-2xl font-bold mt-1">{verificationData?.total_verified ?? 0}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-slate-500">Avg Verification</p>
          <p className="text-2xl font-bold mt-1">{verificationData?.avg_score ?? 0}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-slate-500">Top Cluster</p>
          <p className="text-sm font-semibold mt-1">
            {topRegion ? `${topRegion.lat}, ${topRegion.lng}` : "-"}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" /> Report Trends
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData?.trend ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area type="monotone" dataKey="reports" stroke="#2563eb" fill="#2563eb" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> Reports by Category
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData?.categories ?? []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={90} />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 5, 5, 0]}>
                {(categoryData?.categories ?? []).map((_, index) => (
                  <Cell key={`cat-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Verification Score Distribution
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={verificationData?.distribution ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="range" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-violet-600" /> Status Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusData?.statuses ?? []}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={80}
                label={({ name, count }) => `${name}: ${count}`}
              >
                {(statusData?.statuses ?? []).map((_, index) => (
                  <Cell key={`status-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <MapPinned className="w-4 h-4 text-red-600" /> Regional Hotspots
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          {(regionalData?.regions ?? []).slice(0, 6).map((region) => (
            <div key={`${region.lat}-${region.lng}`} className="rounded border bg-white p-3">
              <p className="font-semibold text-slate-800">
                {region.lat}, {region.lng}
              </p>
              <p className="text-slate-500 mt-1">Reports: {region.report_count}</p>
              <p className="text-slate-500">Avg verification: {region.avg_verification}</p>
            </div>
          ))}
        </div>
      </Card>

      <div>
        <h2 className="text-base md:text-lg font-semibold mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" /> Curated Flood Insights
        </h2>
        <div className="space-y-3">
          {(curatedData?.insights ?? []).map((insight) => (
            <Card key={insight.id} className="p-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-lg text-slate-500">{INSIGHT_ICONS[insight.type] ?? "chart"}</span>
                <div>
                  <h3 className="font-semibold text-sm md:text-base">{insight.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{insight.description}</p>
                  <p className="text-xs text-slate-400 mt-2">Source: {insight.source}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
