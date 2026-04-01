"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  Play,
  TreePine,
  Brain,
  ChartLine,
} from "lucide-react";
import { researcherAPI } from "@/lib/api";

interface ModelArchitecture {
  type: string;
  library: string;
  learning_method?: string;
  typical_params?: Record<string, string>;
}

interface ModelItem {
  id: string;
  name: string;
  category: string;
  status: "active" | "available" | "experimental";
  task: string;
  description: string;
  architecture?: ModelArchitecture;
  input_features?: string[] | string;
  output?: string;
  strengths?: string[];
  weaknesses?: string[];
  best_for?: string;
  expected_metrics?: Record<string, string>;
  paper_reference?: string;
}

interface CategoryItem {
  label: string;
  icon: string;
  description: string;
}

interface StatusItem {
  label: string;
  color: string;
  description: string;
}

interface ModelRegistryResponse {
  models: ModelItem[];
  categories: Record<string, CategoryItem>;
  status_info: Record<string, StatusItem>;
}

interface PredictionResponse {
  model_used: string;
  prediction: {
    risk_level: string;
    risk_percentage: number;
    predicted_depth_m: number;
    confidence: number;
    contributing_factors: string[];
  };
}

const categoryIcon = {
  tree: TreePine,
  brain: Brain,
  "chart-line": ChartLine,
} as const;

const statusBadgeClass: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  available: "bg-blue-100 text-blue-800",
  experimental: "bg-amber-100 text-amber-800",
};

export default function ModelsPage() {
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  const [testLat, setTestLat] = useState("25.4358");
  const [testLng, setTestLng] = useState("81.8463");
  const [testRainfall, setTestRainfall] = useState("100");

  const { data, isLoading, isError } = useQuery<ModelRegistryResponse>({
    queryKey: ["model-registry"],
    queryFn: () => researcherAPI.getModelRegistry(),
  });

  const testPredict = useMutation<PredictionResponse, Error, string>({
    mutationFn: async (modelId: string) => {
      return researcherAPI.runPrediction({
        latitude: parseFloat(testLat),
        longitude: parseFloat(testLng),
        rainfall_mm: parseFloat(testRainfall),
        model_id: modelId,
      });
    },
    onSuccess: (res) => {
      toast.success(
        `Prediction: ${res.prediction.risk_level.toUpperCase()} (${res.prediction.risk_percentage}%)`
      );
    },
    onError: () => {
      toast.error("Prediction request failed. Check backend API.");
    },
  });

  const models = data?.models ?? [];
  const categories = data?.categories ?? {};
  const statusInfo = data?.status_info ?? {};

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Model Lab</h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore flood models and run live test inference against the deployed predictor.
        </p>
      </div>

      <Card className="p-4 bg-slate-50">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm md:text-base">
          <Play className="w-4 h-4" /> Test Prediction
        </h3>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-slate-500">Latitude</label>
            <Input value={testLat} onChange={(e) => setTestLat(e.target.value)} className="w-32" />
          </div>
          <div>
            <label className="text-xs text-slate-500">Longitude</label>
            <Input value={testLng} onChange={(e) => setTestLng(e.target.value)} className="w-32" />
          </div>
          <div>
            <label className="text-xs text-slate-500">Rainfall (mm)</label>
            <Input value={testRainfall} onChange={(e) => setTestRainfall(e.target.value)} className="w-32" />
          </div>
          <Button
            onClick={() => testPredict.mutate("lightgbm-classifier")}
            disabled={testPredict.isPending}
          >
            {testPredict.isPending ? "Running..." : "Run Prediction"}
          </Button>
        </div>

        {testPredict.data && (
          <div className="mt-3 p-3 bg-white rounded border text-sm">
            <span className="font-semibold">Result: </span>
            <Badge
              className={
                testPredict.data.prediction.risk_level === "low"
                  ? "bg-green-100 text-green-800"
                  : testPredict.data.prediction.risk_level === "medium"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }
            >
              {testPredict.data.prediction.risk_level}
            </Badge>
            <span className="ml-2">
              Depth: {testPredict.data.prediction.predicted_depth_m}m | Confidence: {testPredict.data.prediction.confidence}%
            </span>
          </div>
        )}
      </Card>

      {isLoading && <p className="text-sm text-slate-500">Loading model registry...</p>}
      {isError && <p className="text-sm text-red-600">Failed to load model registry.</p>}

      {Object.entries(categories).map(([catKey, cat]) => {
        const catModels = models.filter((m) => m.category === catKey);
        if (catModels.length === 0) {
          return null;
        }

        const CatIcon = categoryIcon[cat.icon as keyof typeof categoryIcon] ?? Brain;

        return (
          <div key={catKey}>
            <h2 className="text-base md:text-lg font-semibold mb-3 flex items-center gap-2">
              <CatIcon className="h-4 w-4" /> {cat.label}
              <span className="text-xs md:text-sm font-normal text-slate-400">- {cat.description}</span>
            </h2>

            <div className="space-y-3">
              {catModels.map((model) => {
                const isExpanded = expandedModel === model.id;
                const statusMeta = statusInfo[model.status];
                return (
                  <Card key={model.id} className="overflow-hidden">
                    <div
                      className="p-4 cursor-pointer hover:bg-slate-50 flex justify-between items-center"
                      onClick={() => setExpandedModel(isExpanded ? null : model.id)}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm md:text-base">{model.name}</h3>
                          <Badge className={statusBadgeClass[model.status] ?? "bg-slate-100 text-slate-700"}>
                            {statusMeta?.label ?? model.status}
                          </Badge>
                        </div>
                        <p className="text-xs md:text-sm text-slate-500 mt-0.5">{model.task}</p>
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 border-t pt-4 space-y-4 text-sm">
                        <p className="text-slate-700">{model.description}</p>

                        {model.architecture && (
                          <div>
                            <h4 className="font-semibold text-xs uppercase text-slate-400 mb-1">Architecture</h4>
                            <div className="bg-slate-50 rounded p-3 text-xs font-mono">
                              <p>Type: {model.architecture.type}</p>
                              <p>Library: {model.architecture.library}</p>
                              {model.architecture.learning_method && (
                                <p>Method: {model.architecture.learning_method}</p>
                              )}
                              {model.architecture.typical_params && (
                                <div className="mt-1 space-y-0.5">
                                  {Object.entries(model.architecture.typical_params).map(([k, v]) => (
                                    <p key={`${model.id}-${k}`}>{k}: {String(v)}</p>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-4">
                          {model.strengths && (
                            <div>
                              <h4 className="font-semibold text-xs uppercase text-green-600 mb-1">Strengths</h4>
                              <ul className="space-y-1">
                                {model.strengths.map((s, i) => (
                                  <li key={`${model.id}-s-${i}`} className="text-slate-600">+ {s}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {model.weaknesses && (
                            <div>
                              <h4 className="font-semibold text-xs uppercase text-red-600 mb-1">Weaknesses</h4>
                              <ul className="space-y-1">
                                {model.weaknesses.map((w, i) => (
                                  <li key={`${model.id}-w-${i}`} className="text-slate-600">- {w}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {model.best_for && (
                          <div className="bg-blue-50 p-3 rounded text-blue-800 text-sm">
                            <span className="font-semibold">Best for: </span>
                            {model.best_for}
                          </div>
                        )}

                        {model.expected_metrics && (
                          <div>
                            <h4 className="font-semibold text-xs uppercase text-slate-400 mb-1">Expected Performance</h4>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(model.expected_metrics).map(([k, v]) => (
                                <div key={`${model.id}-m-${k}`} className="bg-slate-50 px-3 py-1 rounded text-xs">
                                  <span className="text-slate-400">{k}: </span>
                                  <span className="font-semibold">{String(v)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {model.paper_reference && (
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <BookOpen className="w-3 h-3" /> {model.paper_reference}
                          </p>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
