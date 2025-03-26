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

import { fetchTask } from "@/server/queries/fetch-task"

// Utility and Type Imports
import { 
  filterTasks, 
  sortTasks, 
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
 * Main TasksView component for task management application.
 * Manages state, data handling, and UI interactions.
 */
export default function TasksView() {
  const router = useRouter()

  // State Management: Tasks data and view mode
  const [tasks, setTasks] = useState<Task[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  // Filter State: Search query, priority and status filters
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<Priority[]>([])
  const [statusFilter, setStatusFilter] = useState<CompletionStatus[]>([])

  // Sorting State: Sorting by option and direction
  const [sortBy, setSortBy] = useState<TaskSortOption>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  // Load Sample Tasks on Component Mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        // Await the promise returned by fetchTask
        const sampleTasks = await fetchTask()
        
        // Ensure sampleTasks is an array, even if it's empty
        const tasksArray = Array.isArray(sampleTasks) ? sampleTasks : []
        
        setTasks(tasksArray)
  
        console.log(tasksArray)
  
        localStorage.setItem("calendarTasks", JSON.stringify(tasksArray))
      } catch (error) {
        console.error("Failed to fetch tasks:", error)
        // Explicitly set an empty array
        setTasks([])
      }
    }
  
    loadTasks()
  }, [])

  // Memoized Task Filtering and Sorting
  // This recalculates only when dependencies change
  const filteredAndSortedTasks = useMemo(() => {
    // Ensure tasks is an array before filtering
    const safeTasksArray = Array.isArray(tasks) ? tasks : []
    
    const filteredTasks = filterTasks(safeTasksArray, searchQuery, priorityFilter, statusFilter)
    return sortTasks(filteredTasks, sortBy, sortDirection)
  }, [tasks, searchQuery, priorityFilter, statusFilter, sortBy, sortDirection])

  // Toggle Priority Filter with Optimization using useCallback
  const handleTogglePriorityFilter = useCallback((priority: Priority) => {
    setPriorityFilter(prev =>
      prev.includes(priority)
        ? prev.filter(p => p !== priority) // Remove filter if already included
        : [...prev, priority]               // Add filter if not included
    )
  }, [])

  // Toggle Status Filter with Optimization using useCallback
  const handleToggleStatusFilter = useCallback((status: CompletionStatus) => {
    setStatusFilter(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status) // Remove filter if already included
        : [...prev, status]              // Add filter if not included
    )
  }, [])

  // Clear All Filters
  const handleClearFilters = useCallback(() => {
    setPriorityFilter([])
    setStatusFilter([])
    setSearchQuery("")
  }, [])

  // Intelligent Sorting Logic to toggle sort direction
  const handleToggleSort = useCallback((sortType: TaskSortOption) => {
    setSortBy(current => sortType !== current ? sortType : current)
    setSortDirection(prev =>
      sortBy === sortType
        ? (prev === "asc" ? "desc" : "asc")
        : "asc"
    )
  }, [sortBy])

  // Navigation handler when a task is clicked
  const handleTaskClick = useCallback((taskId: string) => {
    router.push(`/task-info?id=${taskId}`)
  }, [router])

  // Navigation handler for adding a new task
  const handleAddTask = useCallback(() => {
    router.push("/add-task")
  }, [router])

  // Task Completion Toggle with Immutable Update pattern
  const handleToggleTaskCompletion = useCallback((taskId: string, event: React.MouseEvent) => {
    // Prevent event bubbling
    event.stopPropagation()

    // Map through tasks to toggle the completion state
    const updatedTasks = tasks.map(task =>
      task.id === taskId
        ? {
            ...task,
            completed: !task.completed,
            dateCompleted: !task.completed ? formatDateToString(new Date()) : undefined
          }
        : task
    )

    // Update state and localStorage with the updated tasks
    setTasks(updatedTasks)
    localStorage.setItem("calendarTasks", JSON.stringify(updatedTasks))
  }, [tasks])

  // Calculate count of active filters for display
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

        {/* Search, Filter, and Sort Controls */}
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
            {/* Search Input */}
            <TaskSearch
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
            <div className="flex items-center gap-2">
              {/* Filter Dropdown */}
              <TaskFilters
                filterState={{ priorityFilter, statusFilter, searchQuery }}
                onTogglePriorityFilter={handleTogglePriorityFilter}
                onToggleStatusFilter={handleToggleStatusFilter}
                onClearFilters={handleClearFilters}
              />
              {/* Sort Dropdown */}
              <TaskSort
                sortState={{ sortBy, sortDirection }}
                onToggleSort={handleToggleSort}
              />
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              {/* Add Task Button */}
              <Button
                variant="default"
                size="sm"
                onClick={handleAddTask}
                className="h-8"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
              {/* View Mode Toggle */}
              <ViewToggle
                viewMode={viewMode}
                onViewModeChange={(mode) => setViewMode(mode)}
              />
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <span>Filters:</span>
            {/* Display active search filter */}
            {searchQuery && (
              <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                <span>Title: {searchQuery}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            {/* Display active priority filters */}
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
            {/* Display active status filters */}
            {statusFilter.map((status) => (
              <div key={status} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                <span>
                  {status === "completed on time"
                    ? "Completed On Time"
                    : status === "completed late"
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
            {/* Button to clear all active filters */}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={handleClearFilters}
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Task List/Grid Container */}
        <ScrollArea className="h-[670px] pr-4 overflow-y-auto mt-2">
          {filteredAndSortedTasks.length === 0 ? (
            // Display empty state if no tasks match filters
            <EmptyState
              hasActiveFilters={activeFiltersCount > 0}
              onClearFilters={handleClearFilters}
              onAddTask={handleAddTask}
            />
          ) : viewMode === "list" ? (
            // Render tasks in list view
            <TaskList
              tasks={filteredAndSortedTasks}
              onTaskClick={handleTaskClick}
              onToggleTaskCompletion={handleToggleTaskCompletion}
            />
          ) : (
            // Render tasks in grid view
            <TaskGrid
              tasks={filteredAndSortedTasks}
              onTaskClick={handleTaskClick}
              onToggleTaskCompletion={handleToggleTaskCompletion}
            />
          )}
        </ScrollArea>

        {/* Theme Toggle Button */}
        <div className="flex justify-end mt-">
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
