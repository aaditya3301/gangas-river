"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, LocateFixed, MapPin, Send, ShieldCheck, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { reportsAPI } from "@/lib/api";

interface ReportItem {
  id: number;
  latitude: number;
  longitude: number;
  category: string;
  description?: string;
  photo_url?: string;
  status: string;
  verification_score: number;
  verification_notes?: string;
  reported_at: string;
  verified_at?: string;
  reporter_name?: string;
}

const CATEGORIES = [
  { value: "flood", label: "Flood" },
  { value: "pollution", label: "Pollution" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "erosion", label: "Erosion" },
  { value: "other", label: "Other" },
] as const;

const statusStyles: Record<string, string> = {
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

export default function ReportIssuePage() {
  const queryClient = useQueryClient();

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [altitude, setAltitude] = useState<number | null>(null);
  const [category, setCategory] = useState<string>("flood");
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    score: number;
    notes?: string;
    status: string;
  } | null>(null);

  const isAuthed = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return Boolean(localStorage.getItem("token"));
  }, []);

  const myReportsQuery = useQuery<ReportItem[]>({
    queryKey: ["my-reports"],
    queryFn: () => reportsAPI.getMyReports(),
    enabled: isAuthed,
    retry: false,
  });

  const submitMutation = useMutation({
    mutationFn: reportsAPI.submit,
    onSuccess: (result: ReportItem) => {
      toast.success(`Report submitted. Current status: ${result.status.toUpperCase()}`);
      setVerificationResult({
        score: result.verification_score,
        notes: result.verification_notes,
        status: result.status,
      });
      setDescription("");
      setPhotoUrl("");
      queryClient.invalidateQueries({ queryKey: ["my-reports"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["report-stats"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to submit report"));
    },
  });

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported on this browser.");
      return;
    }

    setFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setAltitude(position.coords.altitude ?? null);
        toast.success("Location captured successfully.");
        setFetchingLocation(false);
      },
      (error) => {
        toast.error(error.message || "Unable to fetch location.");
        setFetchingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const handleSubmit = () => {
    if (latitude === null || longitude === null) {
      toast.error("Please capture your location first.");
      return;
    }
    if (description.trim().length < 10) {
      toast.error("Description must be at least 10 characters.");
      return;
    }

    submitMutation.mutate({
      latitude,
      longitude,
      altitude: altitude ?? undefined,
      category,
      description: description.trim(),
      photo_url: photoUrl.trim() || undefined,
    });
  };

  return (
    <div className="bg-slate-50 pb-20 md:pb-8">
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center gap-3">
          <Link href="/citizen" className="p-2 -ml-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg md:text-xl font-bold text-slate-900">Report Incident</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 md:py-8 space-y-4 md:space-y-6">
        <Card className="p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="font-semibold text-slate-900">Submit New Report</h2>
            <Button type="button" variant="outline" onClick={getLocation} disabled={fetchingLocation} className="gap-2">
              {fetchingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
              Capture Location
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input readOnly value={latitude ?? ""} placeholder="Latitude" />
            <Input readOnly value={longitude ?? ""} placeholder="Longitude" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
            >
              {CATEGORIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <Input
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="Photo URL (optional)"
            />
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-28 p-3 rounded-md border border-slate-200 text-sm"
            placeholder="Describe the incident in detail (minimum 10 characters)."
          />

          <Button onClick={handleSubmit} disabled={submitMutation.isPending} className="w-full gap-2">
            {submitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit Report
          </Button>

          {verificationResult && (
            <div className="rounded-lg border bg-slate-50 p-3 text-sm space-y-1">
              <p className="font-medium text-slate-800 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                AI Verification Score: {(verificationResult.score * 100).toFixed(0)}%
              </p>
              <p className="text-slate-600">Status: {verificationResult.status.toUpperCase()}</p>
              {verificationResult.notes && <p className="text-slate-500">{verificationResult.notes}</p>}
            </div>
          )}
        </Card>

        <Card className="p-4 md:p-6 space-y-3">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" /> My Reports
          </h2>

          {!isAuthed && (
            <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 flex items-start gap-2">
              <TriangleAlert className="h-4 w-4 mt-0.5" />
              Login is required to fetch personal report history.
            </div>
          )}

          {isAuthed && myReportsQuery.isLoading && <p className="text-sm text-slate-500">Loading your reports...</p>}

          {isAuthed && myReportsQuery.data && myReportsQuery.data.length === 0 && (
            <p className="text-sm text-slate-500">No reports submitted yet.</p>
          )}

          <div className="space-y-2">
            {(myReportsQuery.data ?? []).slice(0, 6).map((report) => (
              <div key={report.id} className="rounded-md border p-3 bg-white">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-sm capitalize">{report.category}</p>
                  <Badge className={statusStyles[report.status] ?? "bg-slate-100 text-slate-700"}>{report.status}</Badge>
                </div>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{report.description}</p>
                <p className="text-[11px] text-slate-400 mt-2">
                  {new Date(report.reported_at).toLocaleString()} - Score {(report.verification_score * 100).toFixed(0)}%
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
