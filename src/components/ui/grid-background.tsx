import React from "react";
import { cn } from "@/lib/utils";

export interface GridBackgroundProps {
  className?: string;
  size?: "small" | "large";
  children?: React.ReactNode;
}

export function GridBackground({ 
  className, 
  size = "large",
  children 
}: GridBackgroundProps) {
  return (
    <div
      className={cn(
        "h-full w-full dark:bg-black bg-white relative flex items-center justify-center",
        className
      )}
    >
      <div
        className={cn(
          "absolute pointer-events-none inset-0",
          size === "small" 
            ? "[mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-grid-small-white-dark bg-grid-small-black"
            : "[mask-image:radial-gradient(ellipse_at_center,transparent_0%,black)] dark:bg-grid-white-dark bg-grid-black"
        )}
      ></div>
      {children}
    </div>
  );
}


export function GridSmallBackgroundDemo() {
  return (
    <GridBackground size="small" className="h-[50rem]">
      <p className="text-4xl sm:text-7xl font-bold relative z-20 bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 py-8">
        Backgrounds
      </p>
    </GridBackground>
  );
} 