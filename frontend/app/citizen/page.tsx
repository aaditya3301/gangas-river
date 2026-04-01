"use client";

import React from "react";
import Link from "next/link";
import {
  Bell,
  CloudRain,
  MapPin,
  Mic,
  Phone,
  ShieldCheck,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/language-context";

export default function CitizenDashboard() {
  const { t } = useLanguage();
  
  const smsAlerts = [
    {
      id: 1,
      sender: "GANGA-ALERT",
      message: t("alertCritical"),
      time: "10:30 AM",
      status: "critical",
    },
    {
      id: 2,
      sender: "GANGA-INFO",
      message: t("alertWarning"),
      time: "09:15 AM",
      status: "warning",
    },
    {
      id: 3,
      sender: "GANGA-SAFE",
      message: t("alertSuccess"),
      time: "Yesterday",
      status: "success",
    },
  ];

  const alerts = smsAlerts;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">
          {t("greeting")}
        </h1>
        <p className="text-sm md:text-base text-gray-500">
          {t("updateMessage")}
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardHeader className="p-3 md:p-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("floodRisk")}</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-4 md:pt-0">
            <div className="text-lg md:text-2xl font-bold text-green-600">{t("low")}</div>
            <p className="text-xs text-gray-500">{t("normalLevels")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 md:p-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("activeAlerts")}</CardTitle>
            <Bell className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-4 md:pt-0">
            <div className="text-lg md:text-2xl font-bold text-orange-600">2</div>
            <p className="text-xs text-gray-500">{t("recentNotifications")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 md:p-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("safeZones")}</CardTitle>
            <MapPin className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-4 md:pt-0">
            <div className="text-lg md:text-2xl font-bold text-blue-600">5</div>
            <p className="text-xs text-gray-500">{t("sheltersOpen")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 md:p-4 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("emergency")}</CardTitle>
            <Phone className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-4 md:pt-0">
            <div className="text-lg md:text-2xl font-bold text-red-600">SOS</div>
            <p className="text-xs text-gray-500">{t("oneTapConnect")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:gap-4 grid-cols-1 lg:grid-cols-7">
        {/* SMS Alerts Section */}
        <Card className="col-span-4 lg:col-span-4 transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle>{t("recentSMS")}</CardTitle>
            <CardDescription>
              {t("officialBroadcast")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none text-gray-900">
                      {alert.sender}
                    </p>
                    <p className="text-sm text-gray-500">
                      {alert.message}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-gray-400">{alert.time}</span>
                    <Badge 
                        variant={alert.status === 'critical' ? 'destructive' : alert.status === 'warning' ? 'secondary' : 'default'}
                        className={`
                            ${alert.status === 'success' ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200' : ''}
                            ${alert.status === 'warning' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200' : ''}
                        `}
                    >
                        {alert.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="p-3 md:p-6 pt-0">
            <Button variant="outline" className="w-full h-10 md:h-11">
              {t("viewAllAlerts")} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-4 lg:col-span-3 transition-all hover:shadow-md">
            <CardHeader>
                <CardTitle>{t("quickActions")}</CardTitle>
                <CardDescription>
                    {t("featureShortcuts")}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <Link href="/citizen/predict"> 
                  <Button variant="secondary" className="w-full justify-start h-10 md:h-11">
                        <CloudRain className="mr-2 h-5 w-5 text-blue-500" />
                        {t("checkFloodPrediction")}
                    </Button>
                </Link>
                <Link href="/citizen/evacuation">
                  <Button variant="secondary" className="w-full justify-start h-10 md:h-11">
                        <MapPin className="mr-2 h-5 w-5 text-green-500" />
                        {t("findSafeRoute")}
                    </Button>
                </Link>
                <Link href="/citizen/report">
                  <Button variant="secondary" className="w-full justify-start h-10 md:h-11">
                        <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
                        {t("reportAnIncident")}
                    </Button>
                </Link>
                <Link href="/citizen/assistant">
                  <Button variant="secondary" className="w-full justify-start h-10 md:h-11">
                        <Mic className="mr-2 h-5 w-5 text-purple-500" />
                        {t("voiceAssistant")}
                    </Button>
                </Link>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
