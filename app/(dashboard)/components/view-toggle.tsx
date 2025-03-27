"use client"

import { Grid, List } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { ViewMode } from "@/lib/types"

interface ViewToggleProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

/**
 * ViewToggle component provides UI for switching between list and grid views
 * It highlights the currently active view mode
 */
export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex border rounded-md">
      <Button
        variant={viewMode === "list" ? "default" : "outline"}
        size="sm"
        className={cn("h-8 w-8 p-0", viewMode === "list" ? "" : "")}
        onClick={() => onViewModeChange("list")}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "grid" ? "default" : "outline"}
        size="sm"
        className={cn("h-8 w-8 p-0", viewMode === "grid" ? "" : "")}
        onClick={() => onViewModeChange("grid")}
      >
        <Grid className="h-4 w-4" />
      </Button>
    </div>
  )
}

