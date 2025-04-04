"use client"

import React from "react"
import { X, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import type { Priority, CompletionStatus, FilterState } from "@/lib/types"

interface TaskFiltersProps {
  filterState: FilterState
  onTogglePriorityFilter: (priority: Priority) => void
  onToggleStatusFilter: (status: CompletionStatus) => void
  onClearFilters: () => void
}

// Define filter options for priority and status
const PRIORITY_OPTIONS: Priority[] = ["High", "Medium", "Low"]
const STATUS_OPTIONS: CompletionStatus[] = ["active", "overdue", "completed on time", "completed late"]

export function TaskFilters({
  filterState,
  onTogglePriorityFilter,
  onToggleStatusFilter,
  onClearFilters,
}: TaskFiltersProps) {
  const { priorityFilter, statusFilter, searchQuery } = filterState

  // Calculate the number of active filters to display
  const activeFiltersCount = React.useMemo(
    () => priorityFilter.length + statusFilter.length + (searchQuery ? 1 : 0),
    [priorityFilter, statusFilter, searchQuery]
  )

  // Format filter labels for display
  const formatFilterLabel = (filter: string) => {
    switch (filter) {
      case "completed on time":
        return "Completed On Time"
      case "completed late":
        return "Completed Late"
      default:
        return filter.charAt(0).toUpperCase() + filter.slice(1)
    }
  }

  return (
    <DropdownMenu>
      {/* Filter Button */}
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <Filter className="h-4 w-4 mr-2 opacity-70" />
          Filters
          {/* Display active filter count if filters are applied */}
          {activeFiltersCount > 0 && (
            <span
              className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px]"
              aria-label={`${activeFiltersCount} active filters`}
            >
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      {/* Dropdown Menu Content */}
      <DropdownMenuContent
        align="end"
        className="w-56 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700"
      >
        <div className="p-2">
          {/* Priority Filters */}
          <div className="mb-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Priority
          </div>
          {PRIORITY_OPTIONS.map((priority) => (
            <DropdownMenuCheckboxItem
              key={priority}
              checked={priorityFilter.includes(priority)}
              onCheckedChange={() => onTogglePriorityFilter(priority)}
              className="rounded-md"
            >
              {formatFilterLabel(priority)} Priority
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator className="my-2 bg-neutral-200 dark:bg-neutral-700" />

          {/* Status Filters */}
          <div className="mb-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Status
          </div>
          {STATUS_OPTIONS.map((status) => (
            <DropdownMenuCheckboxItem
              key={status}
              checked={statusFilter.includes(status)}
              onCheckedChange={() => onToggleStatusFilter(status)}
              className="rounded-md"
            >
              {formatFilterLabel(status)}
            </DropdownMenuCheckboxItem>
          ))}

          {/* Clear Filters Button (Visible only if filters are active) */}
          {activeFiltersCount > 0 && (
            <>
              <DropdownMenuSeparator className="my-2 bg-neutral-200 dark:bg-neutral-700" />
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="w-full justify-start text-xs h-8 rounded-md"
                aria-label="Clear all filters"
              >
                <X className="h-3.5 w-3.5 mr-2 opacity-70" />
                Clear all filters
              </Button>
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
