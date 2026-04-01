"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets, ArrowUpRight, Brain, Database, Activity, CheckCircle2, Terminal, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import { Badge } from "@/components/ui/badge";

const SYSTEM_LOGS = [
    "[INFO] Initializing XGBoost Classifier v1.4.2...",
  "[INFO] Connecting to telemetry gateway (IoT-Gateway-01)...",
  "[SUCCESS] Telemetry link established for water-level stream.",
    "[INFO] Fetching upstream telemetry data...",
    "[INFO] Loading terrain topology map...",
    "[INFO] Model artifact connected: flood.pkl",
    "[INFO] Stream processing started. Polling rate: 15m",
];

export default function FloodPredictionPage() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<string[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [waterLevel, setWaterLevel] = useState(213.4);
  const [dataPoints, setDataPoints] = useState<number[]>([213.36, 213.37, 213.37, 213.38, 213.39, 213.39, 213.40]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Simulate Boot Sequence
  useEffect(() => {
    let delay = 0;
    SYSTEM_LOGS.forEach((log, index) => {
        delay += Math.random() * 800; // Random delay between logs
        setTimeout(() => {
            setLogs(prev => [...prev, log]);
            if (index === SYSTEM_LOGS.length - 1) setIsLive(true);
        }, delay);
    });
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Simulate Live Data Feed
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // Slow and small changes to reflect stable river-level behavior.
      const change = (Math.random() - 0.5) * 0.02;
        setWaterLevel(prev => {
        const target = prev + change;
        const newVal = Math.max(210, Math.min(215, prev * 0.8 + target * 0.2));
            
            // Add to data points for graph
            setDataPoints(prevData => {
                const newData = [...prevData.slice(1), newVal];
                return newData;
            });

            return newVal;
        });
        
        // Add random log occasionally
        if (Math.random() > 0.82) {
          const actions = ["Calibrating telemetry stream...", "Inference run: NORMAL", "Upstream discharge steady", "Heartbeat received"];
            const randomLog = `[INFO] ${actions[Math.floor(Math.random() * actions.length)]}`;
            setLogs(prev => [...prev.slice(-10), randomLog]); // Keep last 10 logs
        }

      }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isLive]);

  // Simple Graph Generator
  const generatePath = () => {
    const max = 214.0;
    const min = 212.0;
    const width = 100; // percent
    const height = 60; // pixels
    
    const points = dataPoints.map((val, i) => {
        const x = (i / (dataPoints.length - 1)) * 100;
        const normalizedY = (val - min) / (max - min); 
        const y = height - (normalizedY * height);
        return `${x},${y}`;
    });

    return `M ${points.join(" L ")}`;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">{t("floodPredictionTitle")}</h1>
                <p className="text-sm md:text-base text-gray-500">{t("floodPredictionDesc")}</p>
            </div>
            {isLive && (
                <Badge variant="outline" className="animate-pulse border-green-500 text-green-600 flex gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Live Connection
                </Badge>
            )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Status - Animated */}
        <Card className="col-span-1 border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="text-blue-700 flex items-center gap-2 text-lg font-semibold">
              <Droplets className="h-5 w-5" />
              {t("currentWaterLevel")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 mb-2">
                <div className="text-4xl font-bold text-blue-900 min-w-30">
                   {waterLevel.toFixed(2)} m
                </div>
                <div className="text-sm text-blue-600 font-medium mb-1.5 flex items-center gap-1 animate-pulse">
                     {waterLevel > 213.3 ? <ArrowUpRight className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4"/>}
                     {waterLevel > 213.3 ? t("risingSlowly") : "Stable"}
                </div>
            </div>
            
            {/* Live Mini Graph */}
            <div className="h-15 w-full mt-4 bg-blue-100/50 rounded-md relative overflow-hidden">
                <svg className="absolute inset-0 w-full h-full p-1" preserveAspectRatio="none" viewBox="0 0 100 60">
                    <path 
                        d={generatePath()} 
                        fill="none" 
                        stroke="#2563eb" 
                        strokeWidth="2" 
                        vectorEffect="non-scaling-stroke"
                        className="transition-all duration-500"
                    />
                </svg>
            </div>
            <p className="text-[10px] text-right text-gray-400 mt-1">Trend view updated every 15 minutes</p>
          </CardContent>
        </Card>

        {/* System Logs (The "Real" Look) */}
        <Card className="col-span-1 bg-black text-green-400 font-mono text-xs border-gray-800 shadow-inner">
          <CardHeader className="py-3 border-b border-gray-800 bg-gray-900/50">
            <CardTitle className="flex items-center gap-2 text-sm font-normal text-gray-400">
              <Terminal className="h-4 w-4" />
              System Diagnostics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-50 overflow-hidden relative">
                <div ref={scrollRef} className="absolute inset-0 overflow-y-auto p-4 space-y-1 scrollbar-none">
                    {logs.map((log, i) => (
                        <div key={i} className="opacity-90 border-l-2 border-transparent hover:border-green-500 pl-1">
                            <span className="text-gray-500 mr-2">
                                {new Date().toLocaleTimeString('en-US', {hour12: false})} 
                            </span>
                            {log}
                        </div>
                    ))}
                    {!isLive && <div className="animate-pulse">_</div>}
                </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Model Performance (Simulated) */}
      <Card className="border-green-100 bg-linear-to-br from-green-50 to-white">
        <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-green-600" />
                    {t("modelPerformance")}
                </CardTitle>
                <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-white/50">{t("lastUpdated")}: {new Date().toLocaleTimeString()}</Badge>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex flex-col space-y-2 p-4 bg-white rounded-lg border shadow-sm">
                   <div className="flex items-center text-sm text-gray-500 gap-2">
                     <CheckCircle2 className="h-4 w-4 text-green-500" />
                     {t("modelAccuracy")}
                   </div>
                      <div className="text-2xl font-bold text-gray-900">82.4%</div>
                   <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '82.4%' }}></div>
                   </div>
                </div>

                <div className="flex flex-col space-y-2 p-4 bg-white rounded-lg border shadow-sm">
                   <div className="flex items-center text-sm text-gray-500 gap-2">
                     <Database className="h-4 w-4 text-blue-500" />
                     {t("trainingDataPoints")}
                   </div>
                   <div className="text-2xl font-bold text-gray-900">8,420</div>
                   <p className="text-xs text-green-600">+9 new today</p>
                </div>

                <div className="flex flex-col space-y-2 p-4 bg-white rounded-lg border shadow-sm">
                   <div className="flex items-center text-sm text-gray-500 gap-2">
                     <Activity className="h-4 w-4 text-purple-500" />
                     {t("modelType")}
                   </div>
                   <div className="text-2xl font-bold text-gray-900">XGBoost</div>
                   <p className="text-xs text-gray-400">Gradient Boosting Baseline</p>
                </div>

                <div className="flex flex-col space-y-2 p-4 bg-white rounded-lg border shadow-sm">
                   <div className="flex items-center text-sm text-gray-500 gap-2">
                     <Server className="h-4 w-4 text-orange-500" />
                     Latency
                   </div>
                   <div className="text-2xl font-bold text-gray-900">110ms</div>
                   <p className="text-xs text-gray-400">Cloud Inference</p>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
