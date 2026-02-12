"use client";

import React from "react";
import { Droplets } from "lucide-react";

export function RiverTheme() {
  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none opacity-20 hover:opacity-100 transition-opacity duration-500">
      <div className="relative flex items-center justify-center animate-bounce-slow">
         {/* Outer Ripple */}
         <div className="absolute w-20 h-20 bg-blue-400 rounded-full animate-ping opacity-20"></div>
         {/* Inner Drop */}
         <div className="relative bg-gradient-to-br from-blue-400 to-blue-600 w-12 h-12 rounded-full rounded-tr-none rotate-45 flex items-center justify-center shadow-lg border-2 border-white/50">
            <div className="-rotate-45">
                <Droplets className="text-white w-6 h-6" />
            </div>
         </div>
      </div>
    </div>
  );
}
