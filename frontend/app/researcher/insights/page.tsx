"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
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

const DEMO_REPORTS = [
  {
    id: "demo-ins-001",
    title: "Overflow observed near east embankment",
    city: "Prayagraj",
    category: "flood",
    status: "verified",
    verification_score: 0.92,
    latitude: 25.4358,
    longitude: 81.8463,
    reported_at: "2026-03-17",
  },
  {
    id: "demo-ins-002",
    title: "Major drain blockage in dense settlement",
    city: "Varanasi",
    category: "infrastructure",
    status: "pending",
    verification_score: 0.79,
    latitude: 25.3176,
    longitude: 82.9739,
    reported_at: "2026-03-20",
  },
  {
    id: "demo-ins-003",
    title: "Riverbank erosion risk near school road",
    city: "Buxar",
    category: "erosion",
    status: "verified",
    verification_score: 0.87,
    latitude: 25.5647,
    longitude: 83.9777,
    reported_at: "2026-03-23",
  },
  {
    id: "demo-ins-004",
    title: "Rapid waterlogging in low-lying sector",
    city: "Hapur",
    category: "flood",
    status: "resolved",
    verification_score: 0.84,
    latitude: 28.7306,
    longitude: 77.7807,
    reported_at: "2026-03-28",
  },
];

const FALLBACK_CURATED_INSIGHTS: CuratedInsight[] = [
  {
    id: "fallback-seasonal-1",
    title: "Monsoon-Linked Report Escalation",
    description: "Most incident reports cluster in high-rainfall windows, especially in low-drainage wards.",
    source: "Demo research synthesis",
    type: "seasonal",
  },
  {
    id: "fallback-regional-1",
    title: "Hotspot Belt Along Ganga Corridor",
    description: "Repeated alerts align with dense habitation close to embankment pressure zones.",
    source: "Demo regional scan",
    type: "regional",
  },
  {
    id: "fallback-intervention-1",
    title: "Drainage + Warning Systems Have Fastest Benefit",
    description: "Combined early warning and drainage maintenance provides the highest near-term resilience impact.",
    source: "Demo intervention assessment",
    type: "intervention",
  },
];

const STATUS_STYLES: Record<string, string> = {
  verified: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  resolved: "bg-blue-100 text-blue-800",
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

  const useDemoAnalytics = totalReports < DEMO_REPORTS.length;

  const fallbackTrendData: TrendPoint[] = useMemo(() => {
    const sorted = [...DEMO_REPORTS].sort((a, b) => a.reported_at.localeCompare(b.reported_at));
    return sorted.map((item, index) => ({
      month: item.reported_at,
      reports: index + 1,
    }));
  }, []);

  const fallbackCategoryData: CategoryPoint[] = useMemo(() => {
    const categoryMap = new Map<string, number>();
    for (const item of DEMO_REPORTS) {
      categoryMap.set(item.category, (categoryMap.get(item.category) ?? 0) + 1);
    }
    return Array.from(categoryMap.entries()).map(([name, count]) => ({ name, count }));
  }, []);

  const fallbackStatusData: StatusPoint[] = useMemo(() => {
    const statusMap = new Map<string, number>();
    for (const item of DEMO_REPORTS) {
      statusMap.set(item.status, (statusMap.get(item.status) ?? 0) + 1);
    }
    return Array.from(statusMap.entries()).map(([name, count]) => ({ name, count }));
  }, []);

  const fallbackVerificationData = useMemo(() => {
    const scores = DEMO_REPORTS.map((item) => item.verification_score);
    const buckets = new Array(10).fill(0) as number[];
    for (const score of scores) {
      const idx = Math.min(9, Math.max(0, Math.floor(score * 10)));
      buckets[idx] += 1;
    }
    const distribution = buckets.map((count, i) => ({
      range: `${(i / 10).toFixed(1)}-${((i + 1) / 10).toFixed(1)}`,
      count,
    }));
    const avgScore = scores.reduce((acc, score) => acc + score, 0) / scores.length;
    return {
      distribution,
      avg_score: Number(avgScore.toFixed(3)),
      total_verified: scores.length,
    };
  }, []);

  const fallbackRegionalData: RegionPoint[] = useMemo(
    () =>
      DEMO_REPORTS.map((item) => ({
        lat: Number(item.latitude.toFixed(1)),
        lng: Number(item.longitude.toFixed(1)),
        report_count: 1,
        avg_verification: Number(item.verification_score.toFixed(2)),
      })),
    []
  );

  const effectiveTrendData = !useDemoAnalytics && (trendData?.trend?.length ?? 0) > 0 ? trendData?.trend ?? [] : fallbackTrendData;
  const effectiveCategoryData = !useDemoAnalytics && (categoryData?.categories?.length ?? 0) > 0 ? categoryData?.categories ?? [] : fallbackCategoryData;
  const effectiveStatusData = !useDemoAnalytics && (statusData?.statuses?.length ?? 0) > 0 ? statusData?.statuses ?? [] : fallbackStatusData;
  const effectiveVerificationData = !useDemoAnalytics && verificationData ? verificationData : fallbackVerificationData;
  const effectiveRegionalData = !useDemoAnalytics && (regionalData?.regions?.length ?? 0) > 0 ? regionalData?.regions ?? [] : fallbackRegionalData;
  const effectiveCuratedInsights = (curatedData?.insights?.length ?? 0) > 0 ? curatedData?.insights ?? [] : FALLBACK_CURATED_INSIGHTS;

  const effectiveTotalReports = useMemo(
    () => (useDemoAnalytics ? DEMO_REPORTS.length : effectiveTrendData.reduce((acc, point) => acc + point.reports, 0)),
    [effectiveTrendData, useDemoAnalytics]
  );

  const topRegion = useMemo(() => {
    const regions = effectiveRegionalData;
    if (regions.length === 0) {
      return null;
    }
    return regions[0];
  }, [effectiveRegionalData]);

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
          <p className="text-2xl font-bold mt-1">{effectiveTotalReports}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-slate-500">Verified Reports</p>
          <p className="text-2xl font-bold mt-1">{effectiveVerificationData.total_verified}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-slate-500">Avg Verification</p>
          <p className="text-2xl font-bold mt-1">{effectiveVerificationData.avg_score}</p>
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
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={effectiveTrendData}>
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip
                formatter={(value) => [`${value} reports`, "Count"]}
                labelFormatter={(label) => `Period: ${label}`}
              />
              <Bar dataKey="reports" barSize={22} fill="#93c5fd" radius={[6, 6, 0, 0]} />
              <Area type="monotone" dataKey="reports" fill="url(#trendFill)" stroke="none" />
              <Line
                type="monotone"
                dataKey="reports"
                stroke="#1d4ed8"
                strokeWidth={3}
                dot={{ r: 5, strokeWidth: 2, fill: "#ffffff" }}
                activeDot={{ r: 7 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> Reports by Category
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={effectiveCategoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={90} />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 5, 5, 0]}>
                {effectiveCategoryData.map((_, index) => (
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
            <BarChart data={effectiveVerificationData.distribution}>
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
                data={effectiveStatusData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={80}
                label={({ name, value }) => `${name}: ${value ?? 0}`}
              >
                {effectiveStatusData.map((_, index) => (
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
          {effectiveRegionalData.slice(0, 6).map((region) => (
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
          {effectiveCuratedInsights.map((insight) => (
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

      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">Field Reports (4)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DEMO_REPORTS.map((report) => (
            <div key={report.id} className="rounded border bg-white p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">{report.title}</p>
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${STATUS_STYLES[report.status] ?? "bg-slate-100 text-slate-700"}`}>
                  {report.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {report.city} | {report.category} | Verification {Math.round(report.verification_score * 100)}% | {report.reported_at}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
