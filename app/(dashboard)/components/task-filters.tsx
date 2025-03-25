"use client"

import { X, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import type { Priority, CompletionStatus, FilterState } from "@/lib/types"

interface TaskFiltersProps {
  filterState: FilterState
  onTogglePriorityFilter: (priority: Priority) => void
  onToggleStatusFilter: (status: CompletionStatus) => void
  onClearFilters: () => void
}

/**
 * TaskFilters component provides UI for filtering tasks by priority and status
 * It manages the dropdown menu and active filter indicators
 */
export function TaskFilters({
  filterState,
  onTogglePriorityFilter,
  onToggleStatusFilter,
  onClearFilters,
}: TaskFiltersProps) {
  const { priorityFilter, statusFilter, searchQuery } = filterState

  // Calculate the total number of active filters
  const activeFiltersCount = priorityFilter.length + statusFilter.length + (searchQuery ? 1 : 0)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <Filter className="h-4 w-4 mr-2" />
          Filter
          {activeFiltersCount > 0 && (
            <span className="ml-1.5 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px]">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Priority</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={priorityFilter.includes("high")}
          onCheckedChange={() => onTogglePriorityFilter("high")}
        >
          <span className="text-[hsl(var(--priority-high-text))]">High Priority</span>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={priorityFilter.includes("medium")}
          onCheckedChange={() => onTogglePriorityFilter("medium")}
        >
          <span className="text-[hsl(var(--priority-medium-text))]">Medium Priority</span>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={priorityFilter.includes("low")}
          onCheckedChange={() => onTogglePriorityFilter("low")}
        >
          <span className="text-[hsl(var(--priority-low-text))]">Low Priority</span>
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>Status</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={statusFilter.includes("active")}
          onCheckedChange={() => onToggleStatusFilter("active")}
        >
          <span className="text-[hsl(var(--status-active-text))]">Active</span>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={statusFilter.includes("overdue")}
          onCheckedChange={() => onToggleStatusFilter("overdue")}
        >
          <span className="text-[hsl(var(--status-overdue-text))]">Overdue</span>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={statusFilter.includes("onTime")}
          onCheckedChange={() => onToggleStatusFilter("onTime")}
        >
          <span className="text-[hsl(var(--status-completed-text))]">Completed On Time</span>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={statusFilter.includes("late")}
          onCheckedChange={() => onToggleStatusFilter("late")}
        >
          <span className="text-[hsl(var(--status-late-text))]">Completed Late</span>
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator />

        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8 mt-1" onClick={onClearFilters}>
            <X className="h-3.5 w-3.5 mr-2" />
            Clear all filters
          </Button>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

