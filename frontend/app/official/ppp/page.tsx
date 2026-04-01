"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BarChart3, Calculator, Landmark, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { pppAPI } from "@/lib/api";

type EstimateResponse = {
  region: string;
  predicted_depth_m: number;
  risk_percentage: number;
  expected_annual_loss_crore: number;
  confidence_interval: { low: number; high: number };
  scenario_breakdown: Array<{
    scenario: string;
    return_period: number;
    probability: number;
    flood_depth_m: number;
    total_loss_crore: number;
    expected_loss_crore: number;
  }>;
  exposure_summary: {
    area_sqkm: number;
    total_asset_value_crore: number;
    total_residential_value_crore: number;
    total_agriculture_value_crore: number;
    total_infrastructure_value_crore: number;
  };
};

type CompareResponse = {
  without_infrastructure: { expected_annual_loss_crore: number };
  with_infrastructure: { expected_annual_loss_crore: number };
  avoided_annual_loss_crore: number;
  infrastructure_cost_crore: number;
  benefit_cost_ratio: number | null;
  payback_period_years: number | null;
  ppp_recommendation: {
    fixed_annuity_crore: number;
    performance_bonus_crore: number;
    total_annual_payment_crore: number;
  };
};

type SimilarityResponse = {
  matched_events: Array<{
    year: number;
    location: string;
    similarity_score: number;
    actual_damage_crore: number;
    flood_depth_m: number;
    rainfall_mm: number;
    source: string;
  }>;
};

type PPPModelInfo = {
  model_name: string;
  model_path: string;
  model_detected: boolean;
  inference_mode: string;
  engine: string;
};

function parseNumber(value: string, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeInfrastructureType(infraChange: string): string {
  const raw = infraChange.trim().toLowerCase();
  if (!raw) return "embankment";
  if (raw.includes("drain")) return "drainage_improvement";
  if (raw.includes("wall")) return "flood_wall";
  if (raw.includes("warning") || raw.includes("sensor") || raw.includes("alert")) {
    return "early_warning_system";
  }
  if (raw.includes("embank") || raw.includes("levee") || raw.includes("bund")) {
    return "embankment";
  }

  // Keep valid IDs as-is if user enters exact backend value.
  if (
    raw === "embankment" ||
    raw === "drainage_improvement" ||
    raw === "flood_wall" ||
    raw === "early_warning_system"
  ) {
    return raw;
  }

  return "embankment";
}

export default function OfficialPPPPage() {
  const [latitude, setLatitude] = useState("25.4358");
  const [longitude, setLongitude] = useState("81.8463");
  const [radiusKm, setRadiusKm] = useState("10");
  const [rainfallMm, setRainfallMm] = useState("220");

  const infraChangeLabel = "Infra Change";
  const [costCrore, setCostCrore] = useState("75");
  const [lengthKm, setLengthKm] = useState("15");
  const [heightM, setHeightM] = useState("3");
  const [depthReductionM, setDepthReductionM] = useState("1");

  const [estimateResult, setEstimateResult] = useState<EstimateResponse | null>(null);
  const [compareResult, setCompareResult] = useState<CompareResponse | null>(null);
  const [similarityResult, setSimilarityResult] = useState<SimilarityResponse | null>(null);

  const { data: modelInfo } = useQuery<PPPModelInfo>({
    queryKey: ["ppp-model-info"],
    queryFn: async () => {
      try {
        return await pppAPI.getModelInfo();
      } catch {
        return {
          model_name: "ppp.pkl",
          model_path: "backend/models/ppp/ppp.pkl",
          model_detected: false,
          inference_mode: "formula-engine",
          engine: "current_ppp_calculator",
        };
      }
    },
  });

  const estimateLoss = useMutation({
    mutationFn: async () => {
      return (await pppAPI.estimateLoss({
        latitude: parseNumber(latitude),
        longitude: parseNumber(longitude),
        radius_km: parseNumber(radiusKm, 10),
        rainfall_mm: parseNumber(rainfallMm, 0),
      })) as EstimateResponse;
    },
    onSuccess: (data) => {
      setEstimateResult(data);
      toast.success("Loss estimation completed");
    },
    onError: () => toast.error("Failed to estimate loss"),
  });

  const compareInfra = useMutation({
    mutationFn: async () => {
      const infrastructureParams: Record<string, number> = {
        cost_crore: parseNumber(costCrore, 0),
        length_km: parseNumber(lengthKm, 0),
        height_m: parseNumber(heightM, 0),
        depth_reduction_m: parseNumber(depthReductionM, 0),
      };

      return (await pppAPI.compare({
        latitude: parseNumber(latitude),
        longitude: parseNumber(longitude),
        radius_km: parseNumber(radiusKm, 10),
        rainfall_mm: parseNumber(rainfallMm, 0),
        infrastructure_type: normalizeInfrastructureType(infraChangeLabel),
        infrastructure_params: infrastructureParams,
      })) as CompareResponse;
    },
    onSuccess: (data) => {
      setCompareResult(data);
      toast.success("PPP comparison completed");
    },
    onError: () => toast.error("Failed to compare infrastructure scenarios"),
  });

  const similarity = useMutation({
    mutationFn: async () => {
      const depth = estimateResult?.predicted_depth_m ?? 2.0;
      return (await pppAPI.similarityMatch({
        latitude: parseNumber(latitude),
        longitude: parseNumber(longitude),
        predicted_depth_m: depth,
        rainfall_mm: parseNumber(rainfallMm, 0),
      })) as SimilarityResponse;
    },
    onSuccess: (data) => {
      setSimilarityResult(data);
      toast.success("Historical match generated");
    },
    onError: () => toast.error("Failed to generate similarity match"),
  });

  const savedLoss = useMemo(() => {
    if (!compareResult) return 0;
    return compareResult.avoided_annual_loss_crore;
  }, [compareResult]);

  const modelStatusText = useMemo(() => {
    if (!modelInfo) return "Model: runtime status unavailable";
    if (modelInfo.model_detected) {
      return `Model: ${modelInfo.model_name} connected`;
    }
    return "Model: built-in formula engine active";
  }, [modelInfo]);

  const modeLabel = useMemo(() => {
    if (!modelInfo) return "Unknown";
    return modelInfo.inference_mode === "formula-engine" ? "Formula Engine" : "Trained Model Wrapper";
  }, [modelInfo]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold md:text-2xl">
          <Landmark className="h-6 w-6 text-indigo-600" /> PPP Economic Loss Model
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Estimate expected annual flood loss and compare infrastructure investment outcomes.
        </p>
        {modelInfo && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={modelInfo.model_detected ? "text-emerald-700" : "text-slate-700"}>
              {modelStatusText}
            </Badge>
            <Badge variant="outline">Mode: {modeLabel}</Badge>
            <p className="text-xs text-slate-500">Engine: {modelInfo.engine}</p>
          </div>
        )}
      </div>

      <Card className="p-4 md:p-5">
        <h2 className="mb-3 font-semibold">Region Inputs</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Latitude</label>
            <Input value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="e.g. 25.4358" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Longitude</label>
            <Input value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="e.g. 81.8463" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Analysis Radius (km)</label>
            <Input value={radiusKm} onChange={(e) => setRadiusKm(e.target.value)} placeholder="e.g. 10" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Rainfall (mm)</label>
            <Input value={rainfallMm} onChange={(e) => setRainfallMm(e.target.value)} placeholder="e.g. 220" />
          </div>
        </div>
        <Button className="mt-4" onClick={() => estimateLoss.mutate()} disabled={estimateLoss.isPending}>
          <Calculator className="mr-2 h-4 w-4" />
          {estimateLoss.isPending ? "Estimating..." : "Estimate Annual Loss"}
        </Button>
      </Card>

      {estimateResult && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Expected Annual Loss</p>
            <p className="mt-1 text-3xl font-bold text-red-600">{estimateResult.expected_annual_loss_crore} cr</p>
            <p className="mt-1 text-xs text-slate-500">
              CI: {estimateResult.confidence_interval.low} - {estimateResult.confidence_interval.high} cr
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Predicted Flood Depth</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{estimateResult.predicted_depth_m} m</p>
            <p className="mt-1 text-xs text-slate-500">Risk: {estimateResult.risk_percentage}%</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total Exposed Assets</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{estimateResult.exposure_summary.total_asset_value_crore} cr</p>
            <p className="mt-1 text-xs text-slate-500">Area: {estimateResult.exposure_summary.area_sqkm} sq km</p>
          </Card>
        </div>
      )}

      <Card className="p-4 md:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Infrastructure Comparison</h2>
          <Badge variant="outline">With vs Without</Badge>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Infra Change</label>
            <div className="h-9 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 flex items-center">
              {infraChangeLabel}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Estimated Cost (crore)</label>
            <Input value={costCrore} onChange={(e) => setCostCrore(e.target.value)} placeholder="e.g. 75" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Project Length (km)</label>
            <Input value={lengthKm} onChange={(e) => setLengthKm(e.target.value)} placeholder="e.g. 15" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Structure Height (m)</label>
            <Input value={heightM} onChange={(e) => setHeightM(e.target.value)} placeholder="e.g. 3" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Depth Reduction (m)</label>
            <Input value={depthReductionM} onChange={(e) => setDepthReductionM(e.target.value)} placeholder="e.g. 1" />
          </div>
        </div>

        <Button className="mt-4" onClick={() => compareInfra.mutate()} disabled={compareInfra.isPending}>
          <BarChart3 className="mr-2 h-4 w-4" />
          {compareInfra.isPending ? "Comparing..." : "Run PPP Comparison"}
        </Button>

        {compareResult && (
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="p-4">
              <p className="text-xs text-slate-500">Without Infrastructure</p>
              <p className="text-2xl font-bold text-red-600">{compareResult.without_infrastructure.expected_annual_loss_crore} cr</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-500">With Infrastructure</p>
              <p className="text-2xl font-bold text-emerald-600">{compareResult.with_infrastructure.expected_annual_loss_crore} cr</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-500">Annual Avoided Loss</p>
              <p className="text-2xl font-bold text-indigo-600">{savedLoss} cr</p>
              <p className="mt-1 text-xs text-slate-500">
                BCR: {compareResult.benefit_cost_ratio ?? "-"} | Payback: {compareResult.payback_period_years ?? "-"} yrs
              </p>
            </Card>
          </div>
        )}
      </Card>

      <Card className="p-4 md:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Historical Similarity Match</h2>
          <Button variant="outline" onClick={() => similarity.mutate()} disabled={similarity.isPending}>
            <ShieldCheck className="mr-2 h-4 w-4" />
            {similarity.isPending ? "Matching..." : "Find Similar Events"}
          </Button>
        </div>

        {!similarityResult ? (
          <p className="text-sm text-slate-500">Run matching to compare current forecast with historical events.</p>
        ) : (
          <div className="space-y-2">
            {similarityResult.matched_events.map((event) => (
              <div key={`${event.year}-${event.location}`} className="rounded-md border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{event.year} - {event.location}</p>
                  <Badge variant="outline">Score: {event.similarity_score}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  Depth: {event.flood_depth_m} m | Rainfall: {event.rainfall_mm} mm | Damage: {event.actual_damage_crore} cr
                </p>
                <p className="text-xs text-slate-500">Source: {event.source}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
