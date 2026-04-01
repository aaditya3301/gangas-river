"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ExternalLink,
  Clock,
  Grid3X3,
  FileText,
  Database,
  CloudRain,
  Waves,
  AlertTriangle,
  Mountain,
  Building2,
  ShieldAlert,
} from "lucide-react";
import { researcherAPI } from "@/lib/api";

interface DatasetItem {
  id: string;
  name: string;
  category: string;
  provider: string;
  description: string;
  time_range: string;
  spatial_resolution: string;
  temporal_resolution?: string;
  format: string;
  size: string;
  license: string;
  access_url: string;
  access_method: string;
  used_in: string[];
  tags?: string[];
  notes?: string;
}

interface CategoryMeta {
  label: string;
  icon: string;
  color: string;
}

interface DatasetCatalogResponse {
  datasets: DatasetItem[];
  categories: Record<string, CategoryMeta>;
}

const iconMap = {
  "cloud-rain": CloudRain,
  waves: Waves,
  "alert-triangle": AlertTriangle,
  mountain: Mountain,
  building: Building2,
  "shield-alert": ShieldAlert,
} as const;

export default function DataCatalogPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery<DatasetCatalogResponse>({
    queryKey: ["research-datasets", activeCategory],
    queryFn: async () => {
      return researcherAPI.getDatasets(activeCategory ? { category: activeCategory } : undefined);
    },
  });

  const datasets = useMemo(() => {
    const items = data?.datasets ?? [];
    if (!search.trim()) {
      return items;
    }
    const q = search.toLowerCase();
    return items.filter((d) => {
      const inName = d.name.toLowerCase().includes(q);
      const inDescription = d.description.toLowerCase().includes(q);
      const inTags = d.tags?.some((t) => t.toLowerCase().includes(q)) ?? false;
      return inName || inDescription || inTags;
    });
  }, [data?.datasets, search]);

  const categories = data?.categories ?? {};

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Data Catalog</h1>
        <p className="text-sm text-slate-500 mt-1">
          Curated datasets used by AquaGuardians for flood intelligence and research workflows.
        </p>
      </div>

      <Card className="p-3 md:p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by dataset name, description, or tags..."
            className="pl-9"
          />
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveCategory(null)}
        >
          All ({data?.datasets?.length ?? 0})
        </Button>
        {Object.entries(categories).map(([key, cat]) => {
          const Icon = iconMap[cat.icon as keyof typeof iconMap] ?? Database;
          return (
            <Button
              key={key}
              variant={activeCategory === key ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(key)}
              className="gap-1.5"
            >
              <Icon className="h-3.5 w-3.5" /> {cat.label}
            </Button>
          );
        })}
      </div>

      {isLoading && <p className="text-sm text-slate-500">Loading dataset catalog...</p>}
      {isError && (
        <p className="text-sm text-red-600">Failed to load dataset catalog. Please check backend API.</p>
      )}

      {!isLoading && !isError && datasets.length === 0 && (
        <Card className="p-8 text-center text-slate-500">No datasets found for the current filter.</Card>
      )}

      <div className="space-y-4">
        {datasets.map((d) => {
          const catMeta = categories[d.category];
          const CatIcon = catMeta ? (iconMap[catMeta.icon as keyof typeof iconMap] ?? Database) : Database;

          return (
            <Card key={d.id} className="p-4 md:p-5">
              <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <CatIcon className="h-4 w-4 text-slate-500" />
                    <h3 className="font-semibold text-base md:text-lg">{d.name}</h3>
                  </div>
                  <p className="text-xs md:text-sm text-slate-500 mb-1">{d.provider}</p>
                  <p className="text-sm text-slate-700 mb-3">{d.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs text-slate-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{d.time_range}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Grid3X3 className="h-3 w-3" />
                      <span>{d.spatial_resolution}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span>{d.format}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Database className="h-3 w-3" />
                      <span>{d.size}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {d.tags?.map((tag) => (
                      <Badge key={`${d.id}-${tag}`} variant="secondary" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-500">License: {d.license}</p>
                  {d.notes && <p className="text-[11px] text-amber-700 mt-1">Note: {d.notes}</p>}
                </div>

                <a href={d.access_url} target="_blank" rel="noopener noreferrer" className="md:pt-1">
                  <Button size="sm" className="gap-1.5 w-full md:w-auto">
                    <ExternalLink className="h-3.5 w-3.5" /> Access
                  </Button>
                </a>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
