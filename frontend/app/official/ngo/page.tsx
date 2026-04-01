"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, CheckCircle, Heart, MapPin, Send, Trophy, Users } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";

type LeaderboardEntry = {
  user_id: number;
  name: string;
  points: number;
  tasks: number;
  last_active: string | null;
};

type LeaderboardResponse = {
  leaderboard: LeaderboardEntry[];
};

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    user_id: 1,
    name: "Red Cross Hapur",
    points: 2850,
    tasks: 47,
    last_active: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    user_id: 2,
    name: "Green Earth Foundation",
    points: 2640,
    tasks: 42,
    last_active: new Date(Date.now() - 18000000).toISOString(),
  },
  {
    user_id: 3,
    name: "River Care Initiative",
    points: 2360,
    tasks: 38,
    last_active: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    user_id: 4,
    name: "Community First",
    points: 2180,
    tasks: 35,
    last_active: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    user_id: 5,
    name: "Hope Foundation",
    points: 1920,
    tasks: 31,
    last_active: new Date(Date.now() - 172800000).toISOString(),
  },
];

const GUIDELINES = [
  "Registration & verification process",
  "Reporting requirements & deadlines",
  "Safety protocols to follow",
  "Points system explained",
  "Resource allocation guidelines",
  "Code of conduct & ethics",
];

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "-";
  const diff = Date.now() - new Date(dateStr).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return "Just now";
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NGOPortalPage() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    ngo_name: "",
    contact_person: "",
    location: "",
    people_helped: "",
    resources_provided: "",
    activity_description: "",
  });

  const { data: lbData } = useQuery<LeaderboardResponse>({
    queryKey: ["ngo-leaderboard-detailed"],
    queryFn: async () => {
      try {
        return (await api.get("/api/ngo/leaderboard-detailed")).data;
      } catch {
        return { leaderboard: MOCK_LEADERBOARD };
      }
    },
    initialData: { leaderboard: MOCK_LEADERBOARD },
  });

  const leaderboard = lbData?.leaderboard || [];

  const submitReport = useMutation({
    mutationFn: async () => {
      const res = await api.post("/api/ngo/activity-report", {
        ...form,
        people_helped: parseInt(form.people_helped, 10) || 0,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Activity report submitted successfully!");
      setForm({
        ngo_name: "",
        contact_person: "",
        location: "",
        people_helped: "",
        resources_provided: "",
        activity_description: "",
      });
      queryClient.invalidateQueries({ queryKey: ["ngo-leaderboard-detailed"] });
    },
    onError: (err: unknown) => {
      if (typeof err === "object" && err !== null && "response" in err) {
        const maybeDetail = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail;
        toast.error(maybeDetail || "Failed to submit report");
      } else {
        toast.error("Failed to submit report");
      }
    },
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold md:text-2xl">
          <Users className="h-6 w-6 text-purple-600" /> NGO Portal
        </h1>
        <p className="mt-1 text-sm text-gray-500">Track performance and submit activity reports</p>
      </div>

      <Card className="p-4 md:p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold">
            <Trophy className="h-5 w-5 text-amber-500" /> NGO Leaderboard
          </h2>
          <Badge variant="outline" className="text-xs text-gray-400">
            Updated in real-time
          </Badge>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="w-16 pb-3">Rank</th>
                <th className="pb-3">NGO Name</th>
                <th className="pb-3 text-right">Points</th>
                <th className="pb-3 text-right">Reports</th>
                <th className="pb-3 text-right">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((ngo, i) => (
                <tr key={ngo.user_id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3">
                    <span className="text-sm font-semibold text-slate-500">#{i + 1}</span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{ngo.name}</span>
                      <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                    </div>
                  </td>
                  <td className="py-3 text-right font-semibold text-amber-600">{ngo.points.toLocaleString()} pts</td>
                  <td className="py-3 text-right text-gray-500">{ngo.tasks} reports</td>
                  <td className="py-3 text-right text-xs text-gray-400">{timeAgo(ngo.last_active)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-2 md:hidden">
          {leaderboard.map((ngo, i) => (
            <div key={ngo.user_id} className="flex items-center gap-3 rounded-lg border p-2">
              <span className="w-8 text-center text-xs font-semibold text-slate-500">#{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{ngo.name}</p>
                <p className="text-xs text-gray-400">
                  {ngo.tasks} reports • {timeAgo(ngo.last_active)}
                </p>
              </div>
              <span className="text-sm font-semibold text-amber-600">{ngo.points.toLocaleString()} pts</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <Card className="p-4 md:p-5 lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <BookOpen className="h-5 w-5 text-blue-600" /> NGO Guidelines
          </h2>
          <div className="space-y-3">
            {GUIDELINES.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
          <Button asChild variant="outline" className="mt-4 w-full gap-2">
            <a
              href="/Hapur_Community_Based_Flood_Adaptation_Guidelines_2026.pdf"
              download="NGO_Documentation_Guidelines_2026.pdf"
            >
              <BookOpen className="h-4 w-4" /> Download Full Documentation
            </a>
          </Button>
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs text-amber-700">
              <strong>Note:</strong> All NGOs must follow these guidelines to maintain their verification status.
            </p>
          </div>
        </Card>

        <Card className="p-4 md:p-5 lg:col-span-3">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <Send className="h-5 w-5 text-green-600" /> Submit Activity Report
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">NGO Name *</label>
                <Input
                  placeholder="Enter your NGO name"
                  value={form.ngo_name}
                  onChange={(e) => updateField("ngo_name", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Contact Person *</label>
                <Input
                  placeholder="Your name"
                  value={form.contact_person}
                  onChange={(e) => updateField("contact_person", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500">
                  <MapPin className="h-3 w-3" /> Location
                </label>
                <Input
                  placeholder="Area/ward where activity was done"
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500">
                  <Users className="h-3 w-3" /> People Helped
                </label>
                <Input
                  type="number"
                  placeholder="Number of people"
                  value={form.people_helped}
                  onChange={(e) => updateField("people_helped", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500">
                <Heart className="h-3 w-3" /> Resources Provided
              </label>
              <Input
                placeholder="e.g., Food packets, Blankets, Medical supplies"
                value={form.resources_provided}
                onChange={(e) => updateField("resources_provided", e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Activity Description *</label>
              <Textarea
                placeholder="Describe what activities your NGO performed, impact created, and any challenges faced..."
                rows={4}
                value={form.activity_description}
                onChange={(e) => updateField("activity_description", e.target.value)}
              />
            </div>

            <Button
              className="w-full gap-2"
              onClick={() => submitReport.mutate()}
              disabled={
                submitReport.isPending ||
                !form.ngo_name ||
                !form.contact_person ||
                !form.activity_description
              }
            >
              <Send className="h-4 w-4" />
              {submitReport.isPending ? "Submitting..." : "Submit Activity Report"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
