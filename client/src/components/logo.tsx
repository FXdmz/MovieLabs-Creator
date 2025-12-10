import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "horizontal" | "vertical" | "mark";
}

export function Logo({ className, variant = "horizontal" }: LogoProps) {
  // FX-DMZ Logo reconstruction based on brand guidelines
  // Dark Blue: #232073
  // Light Blue: #CEECF2
  
  return (
    <div className={cn("flex items-center gap-2 font-sans font-bold select-none", className)}>
      {/* Mark - Iceberg abstract shape */}
      <div className="relative w-8 h-8 flex items-center justify-center bg-[#232073] rounded-sm overflow-hidden shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full p-2" fill="none">
           <path d="M20,80 L50,20 L80,80 L20,80" fill="#CEECF2" />
           <path d="M20,80 L50,50 L80,80" fill="white" opacity="0.3" />
        </svg>
      </div>
      
      {variant !== "mark" && (
        <div className="flex flex-col leading-none">
          <span className="text-[#232073] dark:text-[#CEECF2] text-xl tracking-tighter">ME-DMZ</span>
        </div>
      )}
    </div>
  );
}
