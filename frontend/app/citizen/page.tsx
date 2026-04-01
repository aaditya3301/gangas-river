"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  ChevronRight,
  CloudRain,
  Clock,
  Droplets,
  FileText,
  Mic,
  Navigation,
  Phone,
  Radio,
  Shield,
  Waves,
  Wind,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import api from "@/lib/api";

interface DashboardAlert {
  id: number;
  message: string;
  severity: string;
  sent_at: string | null;
}

interface DashboardReport {
  id: number;
  category: string;
  description: string;
  status: string;
  verification_score: number | null;
  reported_at: string | null;
}

interface DashboardStats {
  reports_24h: number;
  active_flood_reports: number;
  active_alerts: number;
  available_shelters?: number;
}

interface CitizenDashboardResponse {
  user_name: string;
  timestamp: string;
  stats: DashboardStats;
  recent_alerts: DashboardAlert[];
  my_reports: DashboardReport[];
}

interface WeatherSnapshot {
  temperature: number;
  condition: string;
  humidity: number;
  wind_speed: number;
  rainfall_forecast: string;
  icon: string;
}

const MOCK_DASHBOARD: CitizenDashboardResponse = {
  user_name: "Citizen",
  timestamp: new Date().toISOString(),
  stats: {
    reports_24h: 12,
    active_flood_reports: 3,
    active_alerts: 2,
    available_shelters: 5,
  },
  recent_alerts: [
    {
      id: 1,
      message: "Water levels rising in Zone 3. Please stay prepared for evacuation.",
      severity: "critical",
      sent_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: 2,
      message: "Heavy rain forecast for the next 24 hours across nearby districts.",
      severity: "warning",
      sent_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      id: 3,
      message: "Zone 1 updated advisory: avoid riverbank roads after sunset.",
      severity: "info",
      sent_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    },
  ],
  my_reports: [
    {
      id: 101,
      category: "flood",
      description: "Water entering low-lying houses near the riverbank area.",
      status: "verified",
      verification_score: 0.87,
      reported_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: 102,
      category: "infrastructure",
      description: "Bridge railing damaged due to water pressure and needs repair.",
      status: "pending",
      verification_score: 0.62,
      reported_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    },
  ],
};

const MOCK_WEATHER: WeatherSnapshot = {
  temperature: 34,
  condition: "Partly Cloudy",
  humidity: 72,
  wind_speed: 12,
  rainfall_forecast: "Heavy rain expected in 6 hours",
  icon: "Cloud",
};

const SEVERITY_STYLES: Record<string, { bg: string; text: string; dot: string; badge: string }> = {
  emergency: {
    bg: "bg-red-50 border-red-200",
    text: "text-red-700",
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-700",
  },
  critical: {
    bg: "bg-red-50 border-red-200",
    text: "text-red-700",
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-700",
  },
  warning: {
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700",
  },
  info: {
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-700",
    dot: "bg-blue-500",
    badge: "bg-blue-100 text-blue-700",
  },
};

const STATUS_CONFIG: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-amber-500", label: "Pending" },
  verified: { icon: CheckCircle, color: "text-green-500", label: "Verified" },
  rejected: { icon: XCircle, color: "text-red-500", label: "Rejected" },
  resolved: { icon: CheckCircle, color: "text-blue-500", label: "Resolved" },
};

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  flood: { label: "Flood", color: "bg-blue-100 text-blue-700" },
  pollution: { label: "Pollution", color: "bg-slate-100 text-slate-700" },
  infrastructure: { label: "Infrastructure", color: "bg-amber-100 text-amber-700" },
  erosion: { label: "Erosion", color: "bg-orange-100 text-orange-700" },
  other: { label: "Other", color: "bg-slate-100 text-slate-700" },
};

const SAFETY_TIPS = [
  "Never walk or drive through flood water. Even shallow, fast water can be dangerous.",
  "Keep an emergency kit ready with water, medicine, flashlight, and critical documents.",
  "Plan evacuation before the flood starts. Check safe routes in advance.",
  "Move to higher ground immediately when critical warnings are issued.",
  "Avoid contact with downed power lines or visibly damaged buildings after flooding.",
  "Report rising water and local damage early using the incident report feature.",
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function timeAgo(dateStr: string | null) {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function SafetyTipCard() {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTipIndex((prev) => (prev + 1) % SAFETY_TIPS.length);
    }, 8000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <Card className="border-emerald-200 bg-emerald-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Safety Tip</p>
      <p className="mt-1 text-sm text-emerald-800">{SAFETY_TIPS[tipIndex]}</p>
      <div className="mt-2 flex justify-center gap-1">
        {SAFETY_TIPS.map((_, idx) => (
          <span
            key={idx}
            className={`h-1.5 w-1.5 rounded-full ${idx === tipIndex ? "bg-emerald-600" : "bg-emerald-200"}`}
          />
        ))}
      </div>
    </Card>
  );
}

export default function CitizenDashboardPage() {
  const [weather] = useState<WeatherSnapshot>(MOCK_WEATHER);

  const { data: dashboard } = useQuery<CitizenDashboardResponse>({
    queryKey: ["citizen-dashboard-home"],
    queryFn: async () => {
      try {
        const response = await api.get("/api/citizen/dashboard");
        return response.data as CitizenDashboardResponse;
      } catch {
        return MOCK_DASHBOARD;
      }
    },
    initialData: MOCK_DASHBOARD,
    refetchInterval: 60_000,
  });

  const alerts = dashboard.recent_alerts || [];
  const myReports = dashboard.my_reports || [];
  const stats = dashboard.stats || MOCK_DASHBOARD.stats;
  const userName = dashboard.user_name || "Citizen";

  const criticalAlert = useMemo(
    () => alerts.find((alert) => alert.severity === "critical" || alert.severity === "emergency"),
    [alerts]
  );

  return (
    <div className="pb-24 md:pb-6">
      {criticalAlert && (
        <div className="flex items-center gap-3 bg-red-600 px-4 py-3 text-white">
          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
          <p className="flex-1 text-sm font-medium">{criticalAlert.message}</p>
          <Link href="/citizen/alerts">
            <Button size="sm" variant="secondary" className="h-7 text-xs">
              View
            </Button>
          </Link>
        </div>
      )}

      <div className="space-y-5 p-4 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 md:text-2xl">
              {getGreeting()}, {userName}
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">Stay informed. Stay safe.</p>
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end gap-1">
              <CloudRain className="h-6 w-6 text-blue-600" />
              <span className="text-2xl font-bold">{weather.temperature}deg</span>
            </div>
            <p className="text-xs text-slate-500">{weather.condition}</p>
            <div className="mt-0.5 flex justify-end gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-0.5">
                <Droplets className="h-3 w-3" />
                {weather.humidity}%
              </span>
              <span className="flex items-center gap-0.5">
                <Wind className="h-3 w-3" />
                {weather.wind_speed}km/h
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Link href="/citizen/safety">
            <Card className="h-full cursor-pointer border-l-4 border-l-blue-500 p-3 transition-shadow hover:shadow-md md:p-4">
              <div className="mb-2 inline-flex rounded-lg bg-blue-50 p-1.5">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-sm font-semibold">Am I Safe?</p>
              <p className="mt-0.5 text-xs text-slate-400">Check flood risk</p>
            </Card>
          </Link>

          <Link href="/citizen/report">
            <Card className="h-full cursor-pointer border-l-4 border-l-amber-500 p-3 transition-shadow hover:shadow-md md:p-4">
              <div className="mb-2 inline-flex rounded-lg bg-amber-50 p-1.5">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-sm font-semibold">Report Incident</p>
              <p className="mt-0.5 text-xs text-slate-400">Submit a report</p>
            </Card>
          </Link>

          <Link href="/citizen/evacuation">
            <Card className="h-full cursor-pointer border-l-4 border-l-green-500 p-3 transition-shadow hover:shadow-md md:p-4">
              <div className="mb-2 inline-flex rounded-lg bg-green-50 p-1.5">
                <Navigation className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-sm font-semibold">Safe Routes</p>
              <p className="mt-0.5 text-xs text-slate-400">Find evacuation path</p>
            </Card>
          </Link>

          <Link href="/citizen/assistant">
            <Card className="h-full cursor-pointer border-l-4 border-l-violet-500 p-3 transition-shadow hover:shadow-md md:p-4">
              <div className="mb-2 inline-flex rounded-lg bg-violet-50 p-1.5">
                <Mic className="h-5 w-5 text-violet-600" />
              </div>
              <p className="text-sm font-semibold">Voice Assistant</p>
              <p className="mt-0.5 text-xs text-slate-400">Talk with AI</p>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <Waves className="h-4 w-4 text-blue-500" />
              <span className="text-xl font-bold text-blue-600">{stats.active_flood_reports || 0}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Active Flood Reports</p>
          </Card>

          <Card className="p-3 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <Bell className="h-4 w-4 text-amber-500" />
              <span className="text-xl font-bold text-amber-600">{stats.active_alerts || 0}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Active Alerts</p>
          </Card>

          <Card className="p-3 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <FileText className="h-4 w-4 text-green-500" />
              <span className="text-xl font-bold text-green-600">{stats.reports_24h || 0}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Reports (24h)</p>
          </Card>
        </div>

        <Card className="flex items-center gap-3 border-blue-200 bg-blue-50 p-3">
          <CloudRain className="h-5 w-5 shrink-0 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-800">{weather.rainfall_forecast}</p>
            <p className="mt-0.5 text-xs text-blue-600">Stay alert and check safe routes in advance.</p>
          </div>
        </Card>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Radio className="h-4 w-4 text-slate-400" />
              Recent Alerts
            </h2>
            <Link href="/citizen/alerts" className="flex items-center gap-0.5 text-xs text-blue-600">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {alerts.length === 0 ? (
            <Card className="p-4 text-center text-sm text-slate-400">No recent alerts. All clear.</Card>
          ) : (
            <div className="space-y-2">
              {alerts.slice(0, 4).map((alert) => {
                const style = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.info;
                return (
                  <Card key={alert.id} className={`flex items-start gap-3 border p-3 ${style.bg}`}>
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${style.text}`}>{alert.message}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge className={`px-1.5 py-0 text-[10px] ${style.badge}`}>{alert.severity}</Badge>
                        <span className="text-[10px] text-slate-400">{timeAgo(alert.sent_at)}</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {myReports.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <FileText className="h-4 w-4 text-slate-400" />
                My Reports
              </h2>
              <Link href="/citizen/report" className="flex items-center gap-0.5 text-xs text-blue-600">
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {myReports.slice(0, 3).map((report) => {
                const category = CATEGORY_CONFIG[report.category] || CATEGORY_CONFIG.other;
                const status = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;
                const StatusIcon = status.icon;

                return (
                  <Card key={report.id} className="flex items-start gap-3 p-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600">
                      {category.label.slice(0, 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm text-slate-800">{report.description}</p>
                      <div className="mt-1 flex items-center gap-3">
                        <Badge className={`px-1.5 py-0 text-[10px] ${category.color}`}>{category.label}</Badge>
                        <span className={`flex items-center gap-0.5 text-[10px] ${status.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                        {report.verification_score !== null && report.verification_score !== undefined && (
                          <span className="text-[10px] text-slate-400">
                            AI: {Math.round(report.verification_score * 100)}%
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">{timeAgo(report.reported_at)}</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        <Card className="border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-red-100 p-3">
              <Phone className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-red-800">Emergency SOS</p>
              <p className="mt-0.5 text-xs text-red-600">One-tap call to disaster helpline: 011-24363260</p>
            </div>
            <a href="tel:01124363260">
              <Button size="sm" className="bg-red-600 text-white hover:bg-red-700">
                Call Now
              </Button>
            </a>
          </div>
        </Card>

        <SafetyTipCard />
      </div>
    </div>
  );
}
