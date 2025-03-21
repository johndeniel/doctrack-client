"use client"

import * as React from "react"

import {
  TooltipProvider as ShadcnTooltipProvider,
  TooltipContent as ShadcnTooltipContent,
} from "@/components/ui/tooltip"

// Custom TooltipContent with white background
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof ShadcnTooltipContent>,
  React.ComponentPropsWithoutRef<typeof ShadcnTooltipContent>
>(({ className, ...props }, ref) => (
  <ShadcnTooltipContent
    ref={ref}
    className={`bg-white text-black border border-border/20 shadow-md rounded-md ${className}`}
    {...props}
  />
))
TooltipContent.displayName = "TooltipContent"

// Custom TooltipProvider that uses white tooltips by default
export function CustomTooltipProvider({ children }: { children: React.ReactNode }) {
  return <ShadcnTooltipProvider>{children}</ShadcnTooltipProvider>
}

export { TooltipContent }

