import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 819 200"
      className={cn("h-10 w-auto", className)}
    >
      <defs>
        <style>
          {`.logo-st0 { fill: #232073; } .logo-st1 { fill: #ceecf2; }`}
        </style>
      </defs>
      <g>
        <polygon className="logo-st1" points="0 90.3 54.2 200 80.4 147 93 172.6 133.7 90.3 0 90.3"/>
        <polygon className="logo-st1" points="53.3 59 48.3 66.2 58.3 66.2 53.3 59"/>
      </g>
      <g>
        <path className="logo-st0" d="M54.2,200l26.2-53,12.7,25.6,40.7-82.2H0l54.2,109.6ZM93,145.4l-1.8-3.8-10.8-21.8-10.8,21.8-15.4,31.1L19.4,102.4h94.9l-21.2,43h0Z"/>
        <path className="logo-st0" d="M53.3,37.8l-12.6-18.2L0,78.3h133.8L79.5,0l-26.2,37.8ZM33.6,66.2h-10.6l17.6-25.5,5.3,7.7-12.4,17.9h0ZM48.3,66.2l5-7.2,5,7.2h-10,0ZM73,66.2l-12.3-17.8,18.9-27.2,31.2,45.1h-37.8Z"/>
        <rect className="logo-st0" x="404.8" y="93.5" width="55.5" height="21.6"/>
        <path className="logo-st0" d="M529,49.5h-36.6v109.3h36.6c39,0,59-25.7,59-54.7s-20-54.7-59-54.6ZM528.5,136.9h-11.4v-65.6h11.4c22,0,33.8,13.8,33.8,32.8s-11.8,32.8-33.8,32.8h0Z"/>
        <polygon className="logo-st0" points="659.2 98.3 659 98.3 613.4 48.5 603.1 48.5 603.1 158.8 627.4 158.8 627.4 98.2 656.8 129.8 660.2 129.8 688.8 98 688.8 158.8 713.4 158.8 713.4 48.5 703.1 48.5 659.2 98.3"/>
        <polygon className="logo-st0" points="818.9 49.5 730.9 49.5 730.9 71.3 781.8 71.3 729.4 150.6 729.4 158.8 818.9 158.8 818.9 136.9 766.7 136.9 818.9 57.8 818.9 49.5"/>
        <polygon className="logo-st0" points="238 98.3 237.8 98.3 192.2 48.5 181.9 48.5 181.9 158.8 206.2 158.8 206.2 98.2 235.6 129.8 239 129.8 267.6 98 267.6 158.8 292.1 158.8 292.1 48.5 281.9 48.5 238 98.3"/>
        <polygon className="logo-st0" points="334.9 114.1 372.7 114.1 372.7 93.5 334.9 93.5 334.9 71.3 379.6 71.3 375.6 49.5 310.1 49.5 310.1 158.8 377 158.8 381 136.9 334.9 136.9 334.9 114.1"/>
      </g>
    </svg>
  );
}
