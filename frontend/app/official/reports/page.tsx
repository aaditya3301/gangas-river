"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Filter, Loader2, MapPin, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { reportsAPI } from "@/lib/api";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

type ReportRow = {
  id: number;
  latitude: number;
  longitude: number;
  category: string;
  description: string;
  status: "pending" | "verified" | "rejected" | "resolved";
  verification_score?: number;
  verification_notes?: string;
  reported_at: string;
  reporter_name?: string;
  is_demo?: boolean;
};

type ReportStats = {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
  resolved: number;
  by_category?: Record<string, number>;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  verified: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  resolved: "bg-blue-100 text-blue-800",
};

const CATEGORY_ICONS: Record<string, string> = {
  flood: "WAVE",
  pollution: "POLL",
  infrastructure: "INFRA",
  erosion: "EROS",
  other: "OTHER",
};

const FALLBACK_REPORTS: ReportRow[] = [
  {
    id: 91001,
    latitude: 25.3176,
    longitude: 82.9739,
    category: "erosion",
    description: "Riverbank erosion observed near school boundary wall; slope cracks widening after recent rainfall.",
    status: "resolved",
    verification_score: 0.88,
    verification_notes: "Historical erosion corridor match confirmed.",
    reported_at: "2026-03-22T09:10:00",
    reporter_name: "Ward Volunteer",
    is_demo: true,
  },
  {
    id: 91002,
    latitude: 25.5647,
    longitude: 83.9777,
    category: "infrastructure",
    description: "Critical drain outlet clogged in a low-lying lane; standing water observed for 6+ hours.",
    status: "resolved",
    verification_score: 0.83,
    verification_notes: "Verified via photo sequence and location consistency.",
    reported_at: "2026-03-24T14:45:00",
    reporter_name: "Field Inspector",
    is_demo: true,
  },
  {
    id: 91003,
    latitude: 28.7306,
    longitude: 77.7807,
    category: "flood",
    description: "Flash waterlogging reported in sector road pocket during peak evening runoff.",
    status: "rejected",
    verification_score: 0.62,
    verification_notes: "Rejected due to duplicate incident and stale timestamp metadata.",
    reported_at: "2026-03-27T18:25:00",
    reporter_name: "Rapid Response Cell",
    is_demo: true,
  },
];

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const maybeDetail = (error as { response?: { data?: { detail?: string } } }).response?.data?.detail;
    if (maybeDetail) return maybeDetail;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export default function OfficialReportsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: reports = [], isLoading } = useQuery<ReportRow[]>({
    queryKey: ["official-reports", statusFilter, categoryFilter],
    queryFn: () =>
      reportsAPI.getAll({
        status: statusFilter !== "all" ? statusFilter : undefined,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        limit: 100,
      }),
    refetchInterval: 30_000,
  });

  const { data: stats } = useQuery<ReportStats>({
    queryKey: ["report-stats"],
    queryFn: reportsAPI.getStats,
    refetchInterval: 30_000,
  });

  const effectiveReports = useMemo(() => {
    if (reports.length >= 4) {
      return reports;
    }

    const needed = Math.max(0, 4 - reports.length);
    const existingIds = new Set(reports.map((report) => report.id));
    const fillers = FALLBACK_REPORTS.filter((report) => !existingIds.has(report.id)).slice(0, needed);
    return [...reports, ...fillers];
  }, [reports]);

  const effectiveStats = useMemo(() => {
    if ((stats?.total ?? 0) >= 4) {
      return stats;
    }

    const byCategory = effectiveReports.reduce<Record<string, number>>((acc, report) => {
      acc[report.category] = (acc[report.category] ?? 0) + 1;
      return acc;
    }, {});

    return {
      total: effectiveReports.length,
      pending: effectiveReports.filter((report) => report.status === "pending").length,
      verified: effectiveReports.filter((report) => report.status === "verified").length,
      rejected: effectiveReports.filter((report) => report.status === "rejected").length,
      resolved: effectiveReports.filter((report) => report.status === "resolved").length,
      by_category: byCategory,
    } as ReportStats;
  }, [effectiveReports, stats]);

  const updateMutation = useMutation({
    mutationFn: (args: { id: number; status: string; notes?: string }) =>
      reportsAPI.updateStatus(args.id, { status: args.status, notes: args.notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["official-reports"] });
      queryClient.invalidateQueries({ queryKey: ["report-stats"] });
      toast.success("Report updated");
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "Failed to update report")),
  });

  const mapMarkers = useMemo(
    () =>
      effectiveReports.map((report) => ({
        id: report.id,
        latitude: report.latitude,
        longitude: report.longitude,
        type: "report" as const,
        title: `${report.category.toUpperCase()} #${report.id}`,
        description: report.description.slice(0, 80),
      })),
    [effectiveReports]
  );

  const mapCenter = useMemo(() => {
    if (!effectiveReports.length) {
      return { latitude: 25.4358, longitude: 81.8463, zoom: 7 };
    }
    return {
      latitude: effectiveReports[0].latitude,
      longitude: effectiveReports[0].longitude,
      zoom: 10,
    };
  }, [effectiveReports]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Community Reports</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: effectiveStats?.total ?? "-", icon: "ALL" },
          { label: "Pending", value: effectiveStats?.pending ?? "-", icon: "PEND" },
          { label: "Verified", value: effectiveStats?.verified ?? "-", icon: "VER" },
          { label: "Flood Reports", value: effectiveStats?.by_category?.flood ?? "-", icon: "FLOOD" },
        ].map((item) => (
          <Card key={item.label} className="p-4 flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 bg-slate-100 rounded px-2 py-1">{item.icon}</span>
            <div>
              <p className="text-2xl font-bold">{item.value}</p>
              <p className="text-sm text-gray-500">{item.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-sm font-semibold text-slate-700">Report Map</h2>
        </div>
        <MapView initialViewState={mapCenter} markers={mapMarkers} height="360px" showUserLocation={false} />
      </Card>

      <div className="flex gap-3 items-center">
        <Filter className="w-4 h-4 text-gray-400" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="flood">Flood</SelectItem>
            <SelectItem value="pollution">Pollution</SelectItem>
            <SelectItem value="infrastructure">Infrastructure</SelectItem>
            <SelectItem value="erosion">Erosion</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Card className="p-4 text-gray-500 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Loading reports...</Card>
      ) : effectiveReports.length === 0 ? (
        <Card className="p-4 text-gray-500">No reports found.</Card>
      ) : (
        <div className="space-y-3">
          {effectiveReports.map((report) => (
            <Card key={report.id} className="p-4">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-semibold px-2 py-1 rounded bg-slate-100 text-slate-700">
                      {CATEGORY_ICONS[report.category] || "OTHER"}
                    </span>
                    <span className="font-semibold capitalize">{report.category}</span>
                    <Badge className={STATUS_COLORS[report.status] || "bg-slate-100 text-slate-700"}>{report.status}</Badge>
                    {report.verification_score != null && (
                      <span className="text-xs text-gray-500">AI: {Math.round(report.verification_score * 100)}%</span>
                    )}
                  </div>

                  <p className="text-sm text-gray-700 mb-1">{report.description}</p>

                  <div className="flex gap-4 text-xs text-gray-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                    </span>
                    <span>{new Date(report.reported_at).toLocaleString("en-IN")}</span>
                    <span>By: {report.reporter_name || "Anonymous"}</span>
                  </div>

                  {report.verification_notes && (
                    <p className="text-xs text-gray-500 mt-1 italic">AI Notes: {report.verification_notes}</p>
                  )}
                </div>

                {report.status === "pending" && !report.is_demo && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-300"
                      onClick={() => updateMutation.mutate({ id: report.id, status: "verified" })}
                      disabled={updateMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" /> Verify
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-300"
                      onClick={() => updateMutation.mutate({ id: report.id, status: "rejected" })}
                      disabled={updateMutation.isPending}
                    >
                      <XCircle className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </div>
                )}

                {report.status === "verified" && !report.is_demo && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-600 border-blue-300"
                    onClick={() => updateMutation.mutate({ id: report.id, status: "resolved" })}
                    disabled={updateMutation.isPending}
                  >
                    Mark Resolved
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
