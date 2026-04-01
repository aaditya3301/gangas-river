"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Code,
  Cpu,
  Database,
  FlaskConical,
  Globe,
  Lightbulb,
  MapPin,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { researcherAPI } from "@/lib/api";

interface ResearcherStats {
  total_datasets: number;
  total_models: number;
  active_models: number;
  api_endpoints: number;
  total_reports: number;
  platform_version: string;
  data_coverage: string;
  temporal_coverage: string;
}

const QUICK_LINKS = [
  {
    href: "/researcher/data",
    icon: Database,
    label: "Data Catalog",
    description: "Curated datasets for rainfall, hydrology, flood events, terrain, and exposure.",
    style: "text-blue-600 bg-blue-50",
  },
  {
    href: "/researcher/models",
    icon: Cpu,
    label: "Model Lab",
    description: "Model registry with architecture metadata and live prediction testing.",
    style: "text-amber-600 bg-amber-50",
  },
  {
    href: "/researcher/api",
    icon: Code,
    label: "API Explorer",
    description: "Interactive endpoint catalog with request/response schemas and try-it runner.",
    style: "text-emerald-600 bg-emerald-50",
  },
  {
    href: "/researcher/insights",
    icon: BarChart3,
    label: "Insights",
    description: "Charts for trends, category distribution, verification quality, and hotspots.",
    style: "text-violet-600 bg-violet-50",
  },
];

const GETTING_STARTED = [
  "Browse Data Catalog and shortlist relevant datasets for your study.",
  "Review Model Lab details and run sample predictions for baseline checks.",
  "Use API Explorer to inspect payloads and test integrations quickly.",
  "Open Insights to compare trends, categories, and verification quality.",
  "Use Swagger docs for complete OpenAPI schema when building pipelines.",
];

const DEMO_REPORTS = [
  {
    id: "demo-rpt-001",
    title: "Ganga embankment overtopping alert",
    city: "Prayagraj",
    category: "flood",
    status: "verified",
    verification: 0.92,
    reportedAt: "2026-03-17 06:40",
  },
  {
    id: "demo-rpt-002",
    title: "Drainage choke near old market",
    city: "Varanasi",
    category: "infrastructure",
    status: "pending",
    verification: 0.79,
    reportedAt: "2026-03-20 14:05",
  },
  {
    id: "demo-rpt-003",
    title: "Riverbank erosion at school boundary",
    city: "Buxar",
    category: "erosion",
    status: "verified",
    verification: 0.87,
    reportedAt: "2026-03-23 09:15",
  },
  {
    id: "demo-rpt-004",
    title: "Flash waterlogging in low-lying ward",
    city: "Hapur",
    category: "flood",
    status: "resolved",
    verification: 0.84,
    reportedAt: "2026-03-28 18:30",
  },
];

const QUICK_INSIGHTS = [
  "Flood-related field reports spike during late monsoon windows.",
  "Verified incidents cluster along dense settlement belts near tributaries.",
  "Drainage and embankment interventions show highest immediate risk-reduction potential.",
];

const STATUS_STYLES: Record<string, string> = {
  verified: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  resolved: "bg-blue-100 text-blue-800",
};

export default function ResearcherDashboard() {
  const { data } = useQuery<ResearcherStats>({
    queryKey: ["researcher-stats"],
    queryFn: () => researcherAPI.getResearcherStats(),
  });

  const effectiveReportCount = Math.max(data?.total_reports ?? 0, DEMO_REPORTS.length);

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Research Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Unified workspace for datasets, models, APIs, and analytics on Ganga basin flood intelligence.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <p className="text-xs text-slate-500">Datasets</p>
          <p className="text-2xl font-bold mt-1">{data?.total_datasets ?? "-"}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-slate-500">Models</p>
          <p className="text-2xl font-bold mt-1">{data?.total_models ?? "-"}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-slate-500">API Endpoints</p>
          <p className="text-2xl font-bold mt-1">{data?.api_endpoints ?? "-"}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-slate-500">Community Reports</p>
          <p className="text-2xl font-bold mt-1">{effectiveReportCount}</p>
        </Card>
      </div>

      <Card className="p-4 bg-emerald-50 border-emerald-100">
        <div className="flex items-start gap-3">
          <FlaskConical className="w-5 h-5 text-emerald-700 mt-0.5" />
          <div className="text-sm text-emerald-900">
            <p className="font-semibold">Platform Coverage</p>
            <p className="mt-1">
              Region: {data?.data_coverage ?? "Ganga Basin"} - Temporal: {data?.temporal_coverage ?? "1967-2026"} - Version: {data?.platform_version ?? "1.0.0"}
            </p>
          </div>
        </div>
      </Card>

      <div>
        <h2 className="text-base md:text-lg font-semibold mb-3">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {QUICK_LINKS.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="p-4 hover:shadow-sm transition-shadow h-full">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded ${item.style}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm md:text-base">{item.label}</h3>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-xs md:text-sm text-slate-500 mt-1">{item.description}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Card className="p-4">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Getting Started
        </h2>
        <div className="space-y-2 text-sm text-slate-600">
          {GETTING_STARTED.map((item, index) => (
            <div key={item} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                {index + 1}
              </span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" /> Incident Reports
          </h2>
          <div className="space-y-3">
            {DEMO_REPORTS.map((report) => (
              <div key={report.id} className="rounded border bg-white p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">{report.title}</p>
                  <Badge className={STATUS_STYLES[report.status] ?? "bg-slate-100 text-slate-700"}>{report.status}</Badge>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {report.city}</span>
                  <span>Category: {report.category}</span>
                  <span>Verification: {Math.round(report.verification * 100)}%</span>
                  <span>{report.reportedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" /> Insights Snapshot
          </h2>
          <div className="space-y-2 text-sm text-slate-600">
            {QUICK_INSIGHTS.map((item) => (
              <div key={item} className="rounded border bg-white p-3">
                {item}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">Open API Specification</p>
          <p className="text-xs text-slate-500 mt-1">Use interactive OpenAPI docs for schema-level validation and payload examples.</p>
        </div>
        <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-blue-700 font-medium hover:underline">
          <Globe className="w-4 h-4" /> Swagger Docs
        </a>
      </Card>
    </div>
  );
}
