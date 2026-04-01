"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Megaphone, Send, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { alertsAPI } from "@/lib/api";

type AlertHistoryRow = {
  id: number;
  message: string;
  severity: "info" | "warning" | "critical" | "emergency";
  region?: string | null;
  recipient_count?: number;
  sent_count?: number;
  failed_count?: number;
  sent_at?: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const maybeDetail = (error as { response?: { data?: { detail?: string } } }).response?.data?.detail;
    if (maybeDetail) return maybeDetail;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export default function AlertsPage() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<"info" | "warning" | "critical" | "emergency">("warning");
  const [region, setRegion] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: history = [], isLoading: historyLoading } = useQuery<AlertHistoryRow[]>({
    queryKey: ["alert-history"],
    queryFn: () => alertsAPI.history(),
    refetchInterval: 30_000,
  });

  const { data: recipients } = useQuery<{ count: number }>({
    queryKey: ["alert-recipients"],
    queryFn: alertsAPI.recipientsCount,
    refetchInterval: 30_000,
  });

  const sendAlert = useMutation({
    mutationFn: () =>
      alertsAPI.sendSMS({
        message,
        severity,
        region: region.trim() || undefined,
      }),
    onSuccess: (data: { sent_count: number; failed_count: number }) => {
      toast.success(`Alert sent to ${data.sent_count} users`);
      if (data.failed_count > 0) {
        toast.warning(`${data.failed_count} deliveries failed`);
      }
      setMessage("");
      setShowConfirm(false);
      queryClient.invalidateQueries({ queryKey: ["alert-history"] });
      queryClient.invalidateQueries({ queryKey: ["alert-recipients"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to send alert"));
    },
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Emergency SMS Alerts</h1>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-700">
          <Megaphone className="h-5 w-5" />
          <h2 className="font-semibold">Compose Alert</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm text-slate-600">Message</label>
            <Textarea
              placeholder="Type emergency instruction..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="min-h-28"
            />
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm text-slate-600">Severity</label>
              <Select value={severity} onValueChange={(val) => setSeverity(val as typeof severity)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-600">Region (optional)</label>
              <input
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                placeholder="District/Zone"
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
              />
            </div>

            <div className="rounded-md border bg-slate-50 p-3 text-xs text-slate-600">
              Estimated recipients: <span className="font-semibold">{recipients?.count ?? 0}</span>
            </div>
          </div>
        </div>

        <Button
          onClick={() => setShowConfirm(true)}
          disabled={message.trim().length < 10}
          className="bg-red-600 hover:bg-red-700"
        >
          <Send className="h-4 w-4 mr-2" />
          Send Alert
        </Button>
      </Card>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-600" />
              Confirm Alert Blast
            </DialogTitle>
            <DialogDescription>
              This will send SMS to approximately {recipients?.count ?? 0} active users. Continue?
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border bg-slate-50 p-3 text-sm text-slate-700">
            <p><span className="font-semibold">Severity:</span> {severity}</p>
            <p className="mt-1"><span className="font-semibold">Message:</span> {message}</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button
              onClick={() => sendAlert.mutate()}
              className="bg-red-600 hover:bg-red-700"
              disabled={sendAlert.isPending}
            >
              {sendAlert.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="p-6 space-y-3">
        <h2 className="font-semibold text-slate-800">Alert History</h2>

        {historyLoading ? (
          <p className="text-sm text-slate-500">Loading history...</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-slate-500">No alerts sent yet.</p>
        ) : (
          <div className="space-y-2">
            {history.map((row) => (
              <div key={row.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs uppercase font-semibold text-slate-500">{row.severity}</span>
                  <span className="text-xs text-slate-400">
                    {row.sent_at ? new Date(row.sent_at).toLocaleString("en-IN") : "-"}
                  </span>
                </div>
                <p className="text-sm text-slate-800 mt-1">{row.message}</p>
                <div className="text-xs text-slate-500 mt-2 flex gap-4 flex-wrap">
                  <span>Sent: {row.sent_count ?? 0}</span>
                  <span>Failed: {row.failed_count ?? 0}</span>
                  <span>Recipients: {row.recipient_count ?? 0}</span>
                  <span>Region: {row.region || "All"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
