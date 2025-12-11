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
        <polygon className="logo-st1" points="0 90.4 54.2 200 80.4 147 93.1 172.6 133.7 90.4 0 90.4"/>
        <polygon className="logo-st1" points="53.3 59 48.3 66.3 58.3 66.3 53.3 59"/>
      </g>
      <g>
        <path className="logo-st0" d="M54.2,200l26.2-53,12.7,25.6,40.7-82.2H0l54.2,109.6ZM93.1,145.4l-1.9-3.7-10.8-21.8-10.8,21.8-15.4,31.2L19.4,102.4h94.9l-21.3,43Z"/>
        <path className="logo-st0" d="M53.3,37.9l-12.7-18.3L0,78.3h133.7L79.5,0l-26.2,37.9ZM33.6,66.3h-10.6l17.7-25.5,5.3,7.7-12.3,17.8ZM48.3,66.3l5-7.2,5,7.2h-10ZM73,66.3l-12.3-17.8,18.9-27.3,31.2,45.1h-37.8Z"/>
        <rect className="logo-st0" x="404.8" y="93.5" width="55.4" height="21.5"/>
        <path className="logo-st0" d="M529,49.5h-36.6v109.3h36.6c39.1,0,59-25.7,59-54.6s-19.9-54.6-59-54.6ZM528.5,136.9h-11.4v-65.6h11.4c22,0,33.7,13.8,33.7,32.8s-11.7,32.8-33.7,32.8Z"/>
        <polygon className="logo-st0" points="659.2 98.3 659.1 98.3 613.4 48.5 603.1 48.5 603.1 158.7 627.4 158.7 627.4 98.2 656.8 129.8 660.2 129.8 688.8 98 688.8 158.7 713.4 158.7 713.4 48.5 703.1 48.5 659.2 98.3"/>
        <polygon className="logo-st0" points="819 49.5 730.9 49.5 730.9 71.3 781.8 71.3 729.4 150.5 729.4 158.7 819 158.7 819 136.9 766.7 136.9 819 57.8 819 49.5"/>
        <polygon className="logo-st0" points="238 98.3 237.8 98.3 192.2 48.5 181.9 48.5 181.9 158.7 206.2 158.7 206.2 98.2 235.6 129.8 239 129.8 267.6 98 267.6 158.7 292.2 158.7 292.2 48.5 281.9 48.5 238 98.3"/>
        <polygon className="logo-st0" points="334.9 114.1 372.7 114.1 372.7 93.5 334.9 93.5 334.9 71.3 379.6 71.3 375.6 49.5 310.2 49.5 310.2 158.7 377 158.7 381 136.9 334.9 136.9 334.9 114.1"/>
      </g>
    </svg>
  );
}
