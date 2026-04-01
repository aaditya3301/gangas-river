"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Clock3, Filter, Loader2, MapPin, Search, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { reportsAPI } from "@/lib/api";

interface ReportRow {
  id: number;
  latitude: number;
  longitude: number;
  category: string;
  description: string;
  photo_url?: string;
  status: "pending" | "verified" | "rejected" | "resolved";
  verification_score: number;
  verification_notes?: string;
  reported_at: string;
  verified_at?: string;
  reporter_name?: string;
}

interface ReportStats {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
  resolved: number;
  by_status?: Record<string, number>;
  by_category?: Record<string, number>;
}

const categories = ["all", "flood", "pollution", "infrastructure", "erosion", "other"] as const;
const statuses = ["all", "pending", "verified", "rejected", "resolved"] as const;

const statusBadgeClass: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  verified: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  resolved: "bg-blue-100 text-blue-800",
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { detail?: string } } }).response;
    if (response?.data?.detail) {
      return response.data.detail;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

export default function OfficialReportsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<(typeof statuses)[number]>("all");
  const [categoryFilter, setCategoryFilter] = useState<(typeof categories)[number]>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const reportsQuery = useQuery<ReportRow[]>({
    queryKey: ["reports", statusFilter, categoryFilter],
    queryFn: () =>
      reportsAPI.getAll({
        status: statusFilter !== "all" ? statusFilter : undefined,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        limit: 100,
      }),
    refetchInterval: 30_000,
  });

  const statsQuery = useQuery<ReportStats>({
    queryKey: ["report-stats"],
    queryFn: reportsAPI.getStats,
    refetchInterval: 30_000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: number; status: "verified" | "rejected" | "resolved"; notes?: string }) =>
      reportsAPI.updateStatus(id, { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["report-stats"] });
      toast.success("Report status updated");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update report status"));
    },
  });

  const filteredReports = useMemo(() => {
    const rows = reportsQuery.data || [];
    if (!search.trim()) {
      return rows;
    }

    const query = search.toLowerCase();
    return rows.filter((report) => {
      return (
        report.description.toLowerCase().includes(query) ||
        report.category.toLowerCase().includes(query) ||
        (report.reporter_name || "").toLowerCase().includes(query)
      );
    });
  }, [reportsQuery.data, search]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Report Validation</h1>
        <p className="text-sm text-slate-500">Review incoming citizen reports and moderate their status.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-slate-500">Total</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{statsQuery.data?.total ?? 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Pending</p>
          <p className="mt-1 text-2xl font-semibold text-amber-600">{statsQuery.data?.pending ?? 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Verified</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600">{statsQuery.data?.verified ?? 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Rejected</p>
          <p className="mt-1 text-2xl font-semibold text-red-600">{statsQuery.data?.rejected ?? 0}</p>
        </Card>
      </div>

      <Card className="p-4 space-y-3">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
              placeholder="Search by text, category, or reporter"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value as (typeof categories)[number])}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as (typeof statuses)[number])}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === "all" ? "All Statuses" : status}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <div className="space-y-3">
        {reportsQuery.isLoading && (
          <Card className="p-5 text-sm text-slate-500 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading reports...
          </Card>
        )}

        {!reportsQuery.isLoading && filteredReports.length === 0 && (
          <Card className="p-5 text-sm text-slate-500">No reports found for the selected filters.</Card>
        )}

        {filteredReports.map((report) => {
          const scorePercent = Math.max(0, Math.min(100, Math.round((report.verification_score || 0) * 100)));
          const isExpanded = expandedId === report.id;

          return (
            <Card key={report.id} className="p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="capitalize bg-slate-100 text-slate-700">{report.category}</Badge>
                    <Badge className={statusBadgeClass[report.status] || "bg-slate-100 text-slate-700"}>{report.status}</Badge>
                    <span className="text-xs text-slate-400">#{report.id}</span>
                  </div>

                  <p className="text-sm text-slate-700">{isExpanded ? report.description : `${report.description.slice(0, 180)}${report.description.length > 180 ? "..." : ""}`}</p>

                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock3 className="h-3 w-3" /> {new Date(report.reported_at).toLocaleString()}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</span>
                    <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {report.reporter_name || "Anonymous"}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>AI Verification Score</span>
                      <span>{scorePercent}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${scorePercent >= 80 ? "bg-emerald-500" : scorePercent >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${scorePercent}%` }}
                      />
                    </div>
                  </div>

                  {isExpanded && report.verification_notes && (
                    <div className="rounded-md bg-slate-50 p-2 text-xs text-slate-600">
                      Notes: {report.verification_notes}
                    </div>
                  )}
                </div>

                <div className="flex w-full flex-col gap-2 md:w-52">
                  <Button variant="outline" size="sm" onClick={() => setExpandedId(isExpanded ? null : report.id)} className="gap-2">
                    <Filter className="h-4 w-4" /> {isExpanded ? "Collapse" : "Expand"}
                  </Button>

                  <Button
                    size="sm"
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                    disabled={updateStatusMutation.isPending || report.status === "verified"}
                    onClick={() => updateStatusMutation.mutate({ id: report.id, status: "verified" })}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Verify
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-2"
                    disabled={updateStatusMutation.isPending || report.status === "rejected"}
                    onClick={() => updateStatusMutation.mutate({ id: report.id, status: "rejected" })}
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </Button>

                  <Button
                    size="sm"
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                    disabled={updateStatusMutation.isPending || report.status === "resolved"}
                    onClick={() => updateStatusMutation.mutate({ id: report.id, status: "resolved", notes: "Resolved by field team" })}
                  >
                    <ShieldCheck className="h-4 w-4" /> Mark Resolved
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
