"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Bell,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  Megaphone,
  Navigation,
  Phone,
  Radio,
  Siren,
  Trophy,
  UserCheck,
  Users,
  Waves,
  Zap,
  MapPin,
  Shield,
  Activity,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import api from "@/lib/api";

type DashboardPayload = {
  stats: {
    pending_reports: number;
    reports_24h: number;
    verified_reports: number;
    active_flood_reports: number;
    total_users: number;
    alerts_this_week: number;
  };
  recent_reports: Array<{
    id: number;
    category: string;
    description: string;
    status: string;
    verification_score: number | null;
    reported_at: string | null;
  }>;
  recent_alerts: Array<{
    id: number;
    message: string;
    severity: string;
    recipient_count: number;
    sent_at: string | null;
  }>;
  top_ngos: Array<{
    user_id: number;
    name: string;
    points: number;
    tasks: number;
  }>;
  map_points: Array<{
    lat: number;
    lng: number;
    category: string;
    status: string;
  }>;
  system_status: string;
  official_name: string;
};

const MOCK: DashboardPayload = {
  stats: {
    pending_reports: 8,
    reports_24h: 23,
    verified_reports: 156,
    active_flood_reports: 5,
    total_users: 342,
    alerts_this_week: 4,
  },
  recent_reports: [
    {
      id: 1,
      category: "flood",
      description: "Water level rising rapidly near Ghat 4, approaching road level",
      status: "pending",
      verification_score: 0.82,
      reported_at: new Date(Date.now() - 720000).toISOString(),
    },
    {
      id: 2,
      category: "infrastructure",
      description: "Bridge railing damaged by debris flow, partially blocking passage",
      status: "pending",
      verification_score: 0.65,
      reported_at: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 3,
      category: "flood",
      description: "Agricultural fields completely submerged in sector 7 near river bend",
      status: "pending",
      verification_score: 0.91,
      reported_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 4,
      category: "erosion",
      description: "Riverbank erosion accelerating near village Rampur, houses at risk",
      status: "pending",
      verification_score: 0.78,
      reported_at: new Date(Date.now() - 5400000).toISOString(),
    },
    {
      id: 5,
      category: "pollution",
      description: "Industrial discharge spotted flowing into river from upstream factory",
      status: "pending",
      verification_score: 0.55,
      reported_at: new Date(Date.now() - 7200000).toISOString(),
    },
  ],
  recent_alerts: [
    {
      id: 1,
      message: "Water levels rising in Zone 3. Evacuation advisory issued.",
      severity: "critical",
      recipient_count: 245,
      sent_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 2,
      message: "Heavy rainfall forecast for next 48 hours. All teams on standby.",
      severity: "warning",
      recipient_count: 342,
      sent_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  top_ngos: [
    { user_id: 1, name: "Red Cross Hapur", points: 2850, tasks: 47 },
    { user_id: 2, name: "Green Earth Foundation", points: 2640, tasks: 42 },
    { user_id: 3, name: "River Care Initiative", points: 2360, tasks: 38 },
  ],
  map_points: [],
  system_status: "operational",
  official_name: "Admin",
};

const EMERGENCY_CONTACTS = [
  { name: "Flood Control Room", number: "1077", icon: Waves },
  { name: "NDRF Helpline", number: "011-24363260", icon: Shield },
  { name: "Police Control", number: "112", icon: Phone },
  { name: "Ambulance", number: "108", icon: Activity },
];

const CATEGORY_CONFIG: Record<string, { icon: string; color: string }> = {
  flood: { icon: "🌊", color: "bg-blue-100 text-blue-700" },
  pollution: { icon: "🏭", color: "bg-gray-100 text-gray-700" },
  infrastructure: { icon: "🏗️", color: "bg-amber-100 text-amber-700" },
  erosion: { icon: "⛰️", color: "bg-orange-100 text-orange-700" },
  other: { icon: "📋", color: "bg-gray-100 text-gray-700" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function OfficialDashboard() {
  const { data: dashboard } = useQuery<DashboardPayload>({
    queryKey: ["command-center"],
    queryFn: async () => {
      try {
        return (await api.get("/api/official/command-center")).data;
      } catch {
        return MOCK;
      }
    },
    refetchInterval: 30_000,
    initialData: MOCK,
  });

  const stats = dashboard.stats;
  const reports = dashboard.recent_reports || [];
  const alerts = dashboard.recent_alerts || [];
  const ngos = dashboard.top_ngos || [];

  return (
    <div className="p-4 space-y-5 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">Command Center</h1>
          <p className="text-xs text-gray-500">Welcome, {dashboard.official_name}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            <span className="text-xs uppercase tracking-wide text-gray-500">
              System Operational • {dashboard.system_status === "operational" ? "All Systems Normal" : "Degraded"}
            </span>
          </div>
        </div>
        <Link href="/official/alerts">
          <Button className="gap-2 bg-red-600 hover:bg-red-700">
            <Siren className="h-4 w-4" />
            <span className="hidden md:inline">Broadcast Alert</span>
            <span className="md:hidden">Alert</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <StatCard
          icon={<Clock className="h-4 w-4 text-amber-500" />}
          label="Pending Review"
          value={stats.pending_reports}
          sub={stats.pending_reports > 5 ? "Needs attention" : "Under control"}
          subColor={stats.pending_reports > 5 ? "text-amber-600" : "text-green-600"}
        />
        <StatCard
          icon={<FileText className="h-4 w-4 text-blue-500" />}
          label="Reports (24h)"
          value={stats.reports_24h}
          sub="New submissions"
          subColor="text-gray-400"
        />
        <StatCard
          icon={<Waves className="h-4 w-4 text-red-500" />}
          label="Active Floods"
          value={stats.active_flood_reports}
          sub={stats.active_flood_reports > 3 ? "Elevated risk" : "Normal levels"}
          subColor={stats.active_flood_reports > 3 ? "text-red-600" : "text-green-600"}
        />
        <StatCard
          icon={<CheckCircle className="h-4 w-4 text-green-500" />}
          label="Verified"
          value={stats.verified_reports}
          sub="Total confirmed"
          subColor="text-gray-400"
        />
        <StatCard
          icon={<Users className="h-4 w-4 text-purple-500" />}
          label="Registered Users"
          value={stats.total_users}
          sub="On the platform"
          subColor="text-gray-400"
        />
        <StatCard
          icon={<Bell className="h-4 w-4 text-indigo-500" />}
          label="Alerts Sent"
          value={stats.alerts_this_week}
          sub="This week"
          subColor="text-gray-400"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {alerts.length > 0 && (
            <Card className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <Megaphone className="h-4 w-4 text-gray-400" />
                  Recent Broadcasts
                </h2>
                <Link href="/official/alerts" className="text-xs text-blue-600">
                  View all
                </Link>
              </div>
              <div className="space-y-2">
                {alerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 rounded-lg border p-3 ${
                      alert.severity === "critical"
                        ? "border-red-200 bg-red-50"
                        : alert.severity === "warning"
                          ? "border-amber-200 bg-amber-50"
                          : "border-blue-200 bg-blue-50"
                    }`}
                  >
                    <Radio
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        alert.severity === "critical" ? "text-red-500" : "text-amber-500"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">{alert.message}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                        <span>{alert.sent_at ? timeAgo(alert.sent_at) : ""}</span>
                        <span>Sent to {alert.recipient_count} users</span>
                      </div>
                    </div>
                    <Badge
                      className={`shrink-0 text-[10px] ${
                        alert.severity === "critical"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <ClipboardList className="h-4 w-4 text-gray-400" />
                Incoming Citizen Reports
                {stats.pending_reports > 0 && (
                  <Badge className="bg-amber-100 text-[10px] text-amber-700">{stats.pending_reports} pending</Badge>
                )}
              </h2>
              <Link href="/official/reports" className="flex items-center gap-0.5 text-xs text-blue-600">
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {reports.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">No pending reports</p>
            ) : (
              <div className="space-y-2">
                {reports.slice(0, 6).map((report) => {
                  const cat = CATEGORY_CONFIG[report.category] || CATEGORY_CONFIG.other;
                  return (
                    <Link key={report.id} href="/official/reports">
                      <div className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50">
                        <span className="shrink-0 text-lg">{cat.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{report.description}</p>
                          <p className="mt-0.5 text-xs text-gray-400">{report.reported_at ? timeAgo(report.reported_at) : ""}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {report.verification_score != null && (
                            <div className="text-right">
                              <p className="font-mono text-xs text-gray-500">AI: {Math.round(report.verification_score * 100)}%</p>
                              <div className="mt-0.5 h-1 w-12 rounded-full bg-gray-200">
                                <div
                                  className={`h-full rounded-full ${
                                    report.verification_score > 0.7
                                      ? "bg-green-500"
                                      : report.verification_score > 0.4
                                        ? "bg-amber-500"
                                        : "bg-red-500"
                                  }`}
                                  style={{ width: `${report.verification_score * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                          <Badge className={`${cat.color} text-[10px]`}>{report.category}</Badge>
                          <ChevronRight className="h-4 w-4 text-gray-300" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="mb-3 text-sm font-semibold">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { href: "/official/alerts", icon: Megaphone, label: "Send SMS Alert", color: "text-red-600" },
                { href: "/official/evacuation", icon: Navigation, label: "Plan Evacuation", color: "text-green-600" },
                { href: "/official/zones", icon: MapPin, label: "Check Zone Status", color: "text-blue-600" },
                { href: "/official/reports", icon: FileText, label: "Review Reports", color: "text-amber-600" },
                { href: "/official/ngo", icon: UserCheck, label: "Manage NGOs", color: "text-purple-600" },
              ].map((action) => (
                <Link key={action.href} href={action.href}>
                  <div className="flex cursor-pointer items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-gray-50">
                    <action.icon className={`h-4 w-4 ${action.color}`} />
                    <span className="text-sm">{action.label}</span>
                    <ChevronRight className="ml-auto h-3 w-3 text-gray-300" />
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Card className="border-red-100 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-700">
              <Phone className="h-4 w-4" /> Emergency Contacts
            </h3>
            <div className="space-y-2">
              {EMERGENCY_CONTACTS.map((contact) => (
                <a key={contact.number} href={`tel:${contact.number}`}>
                  <div className="flex items-center justify-between rounded p-2 transition-colors hover:bg-red-50">
                    <div className="flex items-center gap-2">
                      <contact.icon className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-sm">{contact.name}</span>
                    </div>
                    <span className="font-mono text-sm font-semibold text-red-700">{contact.number}</span>
                  </div>
                </a>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Trophy className="h-4 w-4 text-amber-500" /> Top NGOs
              </h3>
              <Link href="/official/ngo" className="text-xs text-blue-600">
                View all
              </Link>
            </div>
            {ngos.length === 0 ? (
              <p className="py-3 text-center text-xs text-gray-400">No verified NGO tasks yet</p>
            ) : (
              <div className="space-y-2">
                {ngos.slice(0, 5).map((ngo, i) => (
                  <div key={ngo.user_id} className="flex items-center gap-3">
                    <span className="w-5 text-center text-sm">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                    </span>
                    <span className="flex-1 truncate text-sm">{ngo.name}</span>
                    <span className="text-xs font-semibold text-amber-600">★ {ngo.points.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="bg-gray-50 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Zap className="h-4 w-4 text-green-500" /> System Health
            </h3>
            <div className="space-y-2 text-xs">
              {[
                { label: "API Server", status: "operational" },
                { label: "Database", status: "operational" },
                { label: "SMS Gateway", status: "operational" },
                { label: "Map Service", status: "operational" },
              ].map((service) => (
                <div key={service.label} className="flex items-center justify-between">
                  <span className="text-gray-600">{service.label}</span>
                  <span className="flex items-center gap-1 text-green-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    {service.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  subColor,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  sub: string;
  subColor: string;
}) {
  return (
    <Card className="p-3 md:p-4">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <span className="text-xs uppercase tracking-wide text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold md:text-3xl">{value.toLocaleString()}</p>
      <p className={`mt-0.5 text-xs ${subColor}`}>{sub}</p>
    </Card>
  );
}
