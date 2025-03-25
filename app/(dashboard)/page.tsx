"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Plus, X } from "lucide-react"

// UI Component Imports
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

// Task-specific Component Imports
import { TaskList } from "@/app/(dashboard)/components/task-list"
import { TaskGrid } from "@/app/(dashboard)/components/task-grid"
import { TaskFilters } from "@/app/(dashboard)/components/task-filters"
import { TaskSort } from "@/app/(dashboard)/components/task-sort"
import { TaskSearch } from "@/app/(dashboard)/components/task-search"
import { ViewToggle } from "@/app/(dashboard)/components/view-toggle"
import { EmptyState } from "@/app/(dashboard)/components/empty-state"

// Utility and Type Imports
import { 
  filterTasks, 
  sortTasks, 
  generateSampleTasks, 
  formatDateToString 
} from "@/app/(dashboard)/task-utils"
import type { 
  Task, 
  Priority, 
  CompletionStatus, 
  ViewMode, 
  TaskSortOption, 
  SortDirection 
} from "@/lib/types"

/**
 * Main TasksView component for task management application
 * Manages state, data handling, and UI interactions
 */
export default function TasksView() {
  const router = useRouter()

  // State Management
  const [tasks, setTasks] = useState<Task[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  // Filter State
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<Priority[]>([])
  const [statusFilter, setStatusFilter] = useState<CompletionStatus[]>([])

  // Sorting State
  const [sortBy, setSortBy] = useState<TaskSortOption>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  // Load Sample Tasks on Component Mount
  useEffect(() => {
    const sampleTasks = generateSampleTasks()
    setTasks(sampleTasks)
    localStorage.setItem("calendarTasks", JSON.stringify(sampleTasks))
  }, [])

  // Memoized Task Filtering and Sorting
  const filteredAndSortedTasks = useMemo(() => {
    const filteredTasks = filterTasks(tasks, searchQuery, priorityFilter, statusFilter)
    return sortTasks(filteredTasks, sortBy, sortDirection)
  }, [tasks, searchQuery, priorityFilter, statusFilter, sortBy, sortDirection])

  // Toggle Priority Filter with Optimization
  const handleTogglePriorityFilter = useCallback((priority: Priority) => {
    setPriorityFilter(prev => 
      prev.includes(priority) 
        ? prev.filter(p => p !== priority) 
        : [...prev, priority]
    )
  }, [])

  // Toggle Status Filter with Optimization
  const handleToggleStatusFilter = useCallback((status: CompletionStatus) => {
    setStatusFilter(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    )
  }, [])

  // Clear All Filters
  const handleClearFilters = useCallback(() => {
    setPriorityFilter([])
    setStatusFilter([])
    setSearchQuery("")
  }, [])

  // Intelligent Sorting Logic
  const handleToggleSort = useCallback((sortType: TaskSortOption) => {
    setSortBy(current => sortType !== current ? sortType : current)
    setSortDirection(prev => 
      sortBy === sortType 
        ? (prev === "asc" ? "desc" : "asc") 
        : "asc"
    )
  }, [sortBy])

  // Navigation Handlers
  const handleTaskClick = useCallback((taskId: string) => {
    router.push(`/task-info?id=${taskId}`)
  }, [router])

  const handleAddTask = useCallback(() => {
    router.push("/add-task")
  }, [router])

  // Task Completion Toggle with Immutable Update
  const handleToggleTaskCompletion = useCallback((taskId: string, event: React.MouseEvent) => {
    event.stopPropagation()

    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? {
            ...task, 
            completed: !task.completed,
            dateCompleted: !task.completed ? formatDateToString(new Date()) : undefined
          } 
        : task
    )

    setTasks(updatedTasks)
    localStorage.setItem("calendarTasks", JSON.stringify(updatedTasks))
  }, [tasks])

  // Calculate Active Filters
  const activeFiltersCount = useMemo(() => 
    priorityFilter.length + statusFilter.length + (searchQuery ? 1 : 0), 
    [priorityFilter, statusFilter, searchQuery]
  )

  return (
    <div className="container mx-auto py-6 px-4 h-screen flex flex-col">
      <div className="flex flex-col space-y-4 flex-grow">
        {/* Header with title and actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl font-medium tracking-tight">Tasks</h1>
          </div>
        </div>

       {/* Search, filter, and sort controls */}
<div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
  <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
    {/* Search input - increased width */}
    <TaskSearch 
      searchQuery={searchQuery} 
      onSearchChange={setSearchQuery}
    />

    <div className="flex items-center gap-2">
      {/* Filter dropdown */}
      <TaskFilters
        filterState={{ priorityFilter, statusFilter, searchQuery }}
        onTogglePriorityFilter={handleTogglePriorityFilter}
        onToggleStatusFilter={handleToggleStatusFilter}
        onClearFilters={handleClearFilters}
      />

      {/* Sort dropdown */}
      <TaskSort 
        sortState={{ sortBy, sortDirection }} 
        onToggleSort={handleToggleSort} 
      />
    </div>
  </div>

  <div className="flex flex-col items-end gap-2">
    <div className="flex items-center gap-2">
      {/* Add Task button */}
      <Button 
        variant="default" 
        size="sm" 
        onClick={handleAddTask} 
        className="h-8"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Task
      </Button>
      
      {/* View mode toggle */}
      <ViewToggle 
        viewMode={viewMode} 
        onViewModeChange={(mode) => setViewMode(mode)} 
      />
    </div>
  </div>
</div>

        {/* Active filters display */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <span>Filters:</span>
            {searchQuery && (
              <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                <span>Title: {searchQuery}</span>
                <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => setSearchQuery("")}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            {priorityFilter.map((priority) => (
              <div key={priority} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                <span>{priority.charAt(0).toUpperCase() + priority.slice(1)} Priority</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0"
                  onClick={() => handleTogglePriorityFilter(priority)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {statusFilter.map((status) => (
              <div key={status} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                <span>
                  {status === "onTime"
                    ? "Completed On Time"
                    : status === "late"
                      ? "Completed Late"
                      : status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0"
                  onClick={() => handleToggleStatusFilter(status)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleClearFilters}>
              Clear all
            </Button>
          </div>
        )}

        {/* Task list/grid container */}    
        <ScrollArea className="h-[670px] pr-4 overflow-y-auto">
          {filteredAndSortedTasks.length === 0 ? (
            <EmptyState
              hasActiveFilters={activeFiltersCount > 0}
              onClearFilters={handleClearFilters}
              onAddTask={handleAddTask}
            />
          ) : viewMode === "list" ? (
            <TaskList
              tasks={filteredAndSortedTasks}
              onTaskClick={handleTaskClick}
              onToggleTaskCompletion={handleToggleTaskCompletion}
            />
          ) : (
            <TaskGrid
              tasks={filteredAndSortedTasks}
              onTaskClick={handleTaskClick}
              onToggleTaskCompletion={handleToggleTaskCompletion}
            />
          )}
        </ScrollArea>
        <ThemeToggle />
      </div>
    </div>
  )
}

