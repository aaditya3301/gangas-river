"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CloudRain,
  AlertTriangle,
  Bell,
  Navigation,
  MessageCircle,
  Menu,
  X,
  Languages,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button"; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useLanguage } from "@/lib/language-context";

export default function CitizenLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    {
      title: t("dashboard"),
      href: "/citizen",
      icon: LayoutDashboard,
    },
    {
      title: t("floodPrediction"),
      href: "/citizen/predict",
      icon: CloudRain,
    },
    {
      title: t("reportIncident"),
      href: "/citizen/report",
      icon: AlertTriangle,
    },
    {
      title: t("safeRoutes"),
      href: "/citizen/evacuation",
      icon: Navigation,
    },
    {
      title: "Alerts",
      href: "/citizen/alerts",
      icon: Bell,
    },
    {
      title: t("voiceAssistant"),
      href: "/citizen/assistant",
      icon: MessageCircle,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Drawer Overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Sidebar (Desktop) + Drawer (Mobile) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-sm transition-transform duration-300 md:translate-x-0 flex flex-col ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <Link href="/" className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
            Gangas-River
          </Link>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="md:hidden p-2 text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsDrawerOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-700 shadow-sm"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <item.icon
                  className={`h-5 w-5 ${
                    isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"
                  }`}
                />
                {item.title}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t">
            <div className="flex items-center gap-3 px-3 py-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                    U
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium text-gray-900">{t("userProfile")}</p>
                    <p className="truncate text-xs text-gray-500">{t("roleCitizen")}</p>
                </div>
                <Link href="/" title={t("signOut")}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50">
                        <LogOut className="h-4 w-4" />
                    </Button>
                </Link>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:pl-64">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-white px-4">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-sm font-semibold text-gray-800">{t("citizenPortal")}</h1>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                <Languages className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage("English")}>English</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("Hindi")}>Hindi (हिंदी)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm z-30">
          <h1 className="text-lg font-semibold text-gray-800">{t("citizenPortal")}</h1>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="items-center gap-2 h-10 px-4">
                  <Languages className="h-4 w-4" />
                  <span>{language}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t("selectLanguage")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLanguage("English")}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("Hindi")}>
                  Hindi (हिंदी)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="bg-gray-50 p-4 md:p-6 lg:p-8 pb-24 md:pb-8 relative">
          {/* Decorative River Watermark - Blue Drop Theme */}
          <div className="fixed bottom-0 right-0 w-125 h-125 z-0 opacity-[0.03] pointer-events-none text-blue-600 translate-x-1/4 translate-y-1/4">
             <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-current animate-pulse-slow">
                <path d="M42.7,-72.8C56.1,-66.8,68.3,-58.5,77.4,-47.9C86.5,-37.3,92.5,-24.4,91.8,-11.7C91.1,1,83.7,13.5,75.8,25.2C67.9,36.9,59.5,47.9,49.5,57.1C39.5,66.3,27.9,73.7,15.6,76.9C3.3,80.1,-9.6,79.1,-21.9,75.4C-34.2,71.7,-45.8,65.3,-56.3,56.6C-66.8,47.9,-76.2,36.9,-81.4,24.4C-86.6,11.9,-87.6,-2.1,-84.6,-15.5C-81.6,-28.9,-74.6,-41.7,-64.3,-50.8C-54,-59.9,-40.4,-65.3,-27.6,-71.7C-14.8,-78.1,-2.8,-85.5,8.3,-83.8C19.4,-82.1,30.8,-71.3,42.7,-72.8Z" transform="translate(100 100)" />
             </svg>
          </div>

          <div className="mx-auto max-w-7xl relative z-10">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Tabs */}
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t md:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="grid grid-cols-5 h-16">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center text-xs ${
                    isActive ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  <item.icon className="h-5 w-5 mb-0.5" />
                  <span className="truncate max-w-14">{item.title}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
