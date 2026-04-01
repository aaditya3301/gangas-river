"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, ChevronDown, ChevronUp, Copy, Globe, Lock, Play } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import api, { apiDocsAPI } from "@/lib/api";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

interface CatalogEndpoint {
  method: HttpMethod;
  path: string;
  summary: string;
  auth_required: boolean;
  query_params?: Record<string, string>;
  request_body?: Record<string, unknown> | null;
  response_example?: unknown;
  status_codes?: Record<string, string>;
}

interface CatalogGroup {
  name: string;
  prefix: string;
  description: string;
  endpoints: CatalogEndpoint[];
}

interface CatalogResponse {
  base_url: string;
  version: string;
  groups: CatalogGroup[];
}

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "bg-green-100 text-green-800",
  POST: "bg-blue-100 text-blue-800",
  PATCH: "bg-amber-100 text-amber-800",
  DELETE: "bg-red-100 text-red-800",
};

function parseParamExample(value: string): string {
  const trimmed = value.trim();
  if (trimmed.includes("|")) {
    return trimmed.split("|")[0].trim();
  }
  if (trimmed.includes("(")) {
    return trimmed.split("(")[0].trim();
  }
  if (trimmed.includes(" ")) {
    return trimmed.split(" ")[0].trim();
  }
  return trimmed;
}

export default function APIExplorerPage() {
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [liveResponses, setLiveResponses] = useState<Record<string, unknown>>({});

  const { data, isLoading, isError } = useQuery<CatalogResponse>({
    queryKey: ["api-catalog"],
    queryFn: () => apiDocsAPI.getCatalog(),
  });

  const totalEndpoints = useMemo(
    () => (data?.groups ?? []).reduce((acc, group) => acc + group.endpoints.length, 0),
    [data?.groups]
  );

  const tryIt = useMutation<unknown, Error, CatalogEndpoint>({
    mutationFn: async (endpoint) => {
      const config: {
        method: string;
        url: string;
        data?: Record<string, unknown>;
        params?: Record<string, string>;
      } = {
        method: endpoint.method.toLowerCase(),
        url: endpoint.path,
      };

      if (endpoint.query_params && endpoint.method === "GET") {
        config.params = Object.fromEntries(
          Object.entries(endpoint.query_params).map(([key, value]) => [key, parseParamExample(value)])
        );
      }

      if (endpoint.request_body && endpoint.method !== "GET") {
        config.data = endpoint.request_body;
      }

      const response = await api(config);
      return response.data;
    },
    onSuccess: (response, endpoint) => {
      const endpointId = `${endpoint.method}-${endpoint.path}`;
      setLiveResponses((prev) => ({ ...prev, [endpointId]: response }));
      toast.success("Live API call completed");
    },
    onError: () => {
      toast.error("API call failed. Check backend status and auth requirements.");
    },
  });

  const copyJson = (value: unknown, id: string) => {
    const text = JSON.stringify(value, null, 2);
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied JSON");
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">API Explorer</h1>
        <p className="text-sm text-slate-500 mt-1">
          Interactive documentation for AquaGuardians endpoints with live test execution.
        </p>
      </div>

      <Card className="p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900">Base URL:</span> {data?.base_url ?? "http://localhost:8000"}
          <span className="mx-2">-</span>
          <span>Version: {data?.version ?? "1.0.0"}</span>
          <span className="mx-2">-</span>
          <span>{totalEndpoints} endpoints</span>
        </div>
        <a href={`${data?.base_url ?? "http://localhost:8000"}/docs`} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Globe className="w-3.5 h-3.5" /> Open Swagger
          </Button>
        </a>
      </Card>

      {isLoading && <p className="text-sm text-slate-500">Loading API catalog...</p>}
      {isError && <p className="text-sm text-red-600">Failed to load API catalog.</p>}

      <div className="space-y-5">
        {(data?.groups ?? []).map((group) => (
          <div key={group.name} className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base md:text-lg font-semibold">{group.name}</h2>
              <Badge variant="outline" className="font-mono text-[11px]">
                {group.prefix}
              </Badge>
            </div>
            <p className="text-xs md:text-sm text-slate-500">{group.description}</p>

            <div className="space-y-2">
              {group.endpoints.map((endpoint) => {
                const endpointId = `${endpoint.method}-${endpoint.path}`;
                const isExpanded = expandedEndpoint === endpointId;

                return (
                  <Card key={endpointId} className="overflow-hidden">
                    <div
                      className="p-3 md:p-4 cursor-pointer hover:bg-slate-50 flex items-center gap-3"
                      onClick={() => setExpandedEndpoint(isExpanded ? null : endpointId)}
                    >
                      <Badge className={`${METHOD_COLORS[endpoint.method]} font-mono text-[11px] w-14 justify-center`}>
                        {endpoint.method}
                      </Badge>
                      <code className="text-xs md:text-sm font-mono flex-1 truncate text-slate-700">
                        {endpoint.path}
                      </code>
                      {endpoint.auth_required && (
                        <Badge variant="outline" className="text-[10px]">
                          <Lock className="w-3 h-3 mr-1" /> Auth
                        </Badge>
                      )}
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>

                    {isExpanded && (
                      <div className="border-t p-4 space-y-4 bg-slate-50/40">
                        <p className="text-sm text-slate-700">{endpoint.summary}</p>

                        {endpoint.query_params !== undefined && (
                          <div>
                            <h4 className="text-[11px] font-semibold uppercase text-slate-400 mb-1">Query Parameters</h4>
                            <div className="bg-white rounded border p-3 text-xs font-mono space-y-1">
                              {Object.entries(endpoint.query_params).map(([key, value]) => (
                                <p key={key}>
                                  <span className="text-blue-700">{key}</span>: {value}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {endpoint.request_body !== null && endpoint.request_body !== undefined && (
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <h4 className="text-[11px] font-semibold uppercase text-slate-400">Request Body</h4>
                              <button
                                onClick={() => copyJson(endpoint.request_body, `req-${endpointId}`)}
                                className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                              >
                                {copiedId === `req-${endpointId}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                Copy
                              </button>
                            </div>
                            <pre className="bg-slate-900 text-emerald-300 rounded p-3 text-xs overflow-x-auto">
                              {JSON.stringify(endpoint.request_body, null, 2)}
                            </pre>
                          </div>
                        )}

                        {endpoint.response_example !== null && endpoint.response_example !== undefined && (
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <h4 className="text-[11px] font-semibold uppercase text-slate-400">Response Example</h4>
                              <button
                                onClick={() => copyJson(endpoint.response_example, `res-${endpointId}`)}
                                className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                              >
                                {copiedId === `res-${endpointId}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                Copy
                              </button>
                            </div>
                            <pre className="bg-slate-900 text-amber-300 rounded p-3 text-xs overflow-x-auto max-h-64 overflow-y-auto">
                              {JSON.stringify(endpoint.response_example, null, 2)}
                            </pre>
                          </div>
                        )}

                        {endpoint.status_codes !== undefined && (
                          <div>
                            <h4 className="text-[11px] font-semibold uppercase text-slate-400 mb-1">Status Codes</h4>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(endpoint.status_codes).map(([code, desc]) => (
                                <Badge key={code} className={code.startsWith("2") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                                  {code}: {desc}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <Button
                          size="sm"
                          className="gap-1.5"
                          disabled={tryIt.isPending}
                          onClick={() => tryIt.mutate(endpoint)}
                        >
                          <Play className="w-3.5 h-3.5" /> {tryIt.isPending ? "Running..." : "Try It"}
                        </Button>

                        {Object.prototype.hasOwnProperty.call(liveResponses, endpointId) && (
                          <div>
                            <h4 className="text-[11px] font-semibold uppercase text-emerald-600 mb-1">Live Response</h4>
                            <pre className="bg-slate-900 text-cyan-300 rounded p-3 text-xs overflow-x-auto max-h-64 overflow-y-auto">
                              {JSON.stringify(liveResponses[endpointId], null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
