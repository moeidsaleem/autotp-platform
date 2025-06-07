import React from "react";
import { cn } from "@/lib/utils";

export interface DotBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

export function DotBackground({ className, children }: DotBackgroundProps) {
  const isDark = true; // For now, assume dark mode since your app defaults to dark
  
  const dotStyle = {
    backgroundImage: isDark 
      ? 'radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px)'
      : 'radial-gradient(rgba(0, 0, 0, 0.3) 1px, transparent 1px)',
    backgroundSize: '15px 15px',
  };

  return (
    <div
      className={cn(
        "h-full w-full dark:bg-black bg-white relative flex items-center justify-center",
        className
      )}
      style={dotStyle}
    >
      {/* Radial gradient for the container to give a faded look */}
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      {children}
    </div>
  );
}

export function DotBackgroundDemo() {
  return (
    <DotBackground className="h-[50rem]">
      <p className="text-4xl sm:text-7xl font-bold relative z-20 bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 py-8">
        Backgrounds
      </p>
    </DotBackground>
  );
} 