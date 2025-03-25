"use client"

import { Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  hasActiveFilters: boolean
  onClearFilters: () => void
  onAddTask: () => void
}

/**
 * EmptyState component displays when no tasks are found
 * It provides different actions based on whether filters are active
 */
export function EmptyState({ hasActiveFilters, onClearFilters, onAddTask }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12">
      <div className="bg-muted/20 p-4 rounded-full mb-4">
        <Search className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-1">No tasks found</h3>
      <p className="text-muted-foreground text-sm mb-4">
        {hasActiveFilters ? "Try adjusting your filters or search query" : "Add a new task to get started"}
      </p>
      {hasActiveFilters ? (
        <Button variant="outline" size="sm" onClick={onClearFilters}>
          Clear all filters
        </Button>
      ) : (
        <Button variant="default" size="sm" onClick={onAddTask}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      )}
    </div>
  )
}

