"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, X } from "lucide-react"

// UI Component Imports
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

// Task-specific Component Imports
import { TaskList } from "@/app/(dashboard)/components/task-list"
import { TaskGrid } from "@/app/(dashboard)/components/task-grid"
import { TaskFilters } from "@/app/(dashboard)/components/task-filters"
import { TaskSort } from "@/app/(dashboard)/components/task-sort"
import { TaskSearch } from "@/app/(dashboard)/components/task-search"
import { ViewToggle } from "@/app/(dashboard)/components/view-toggle"
import { EmptyState } from "@/app/(dashboard)/components/empty-state"
import { fetchTask } from "@/server/queries/fetch-task" 
import { AddTaskDialog } from "@/app/(dashboard)/components/add-task-dialog"

// Utility and Type Imports
import { 
  filterTasks, 
  sortTasks, 
  formatDateToString 
} from "@/lib/task-utils"
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
 * Implements optimized rendering, virtualization-ready task lists,
 * and efficient state management with performance-focused patterns.
 */
export default function TasksView() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // Refs for tracking mounted state and data loading
  const isMountedRef = useRef(false)
  const loadingRef = useRef(false)

  // State Management: Tasks data and view mode
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    // Retrieve view preference from localStorage if available
    if (typeof window !== 'undefined') {
      const savedViewMode = localStorage.getItem('taskViewMode')
      return (savedViewMode as ViewMode) || 'list'
    }
    return 'list'
  })

  // Optimized filter state with single state object to reduce rerenders
  const [filters, setFilters] = useState({
    searchQuery: "",
    priorityFilter: [] as Priority[],
    statusFilter: [] as CompletionStatus[]
  })

  // Access individual filter properties via destructuring
  const { searchQuery, priorityFilter, statusFilter } = filters

  // Sorting State: Combined into single object to reduce state updates
  const [sortConfig, setSortConfig] = useState<{
    sortBy: TaskSortOption;
    sortDirection: SortDirection;
  }>({
    sortBy: "date",
    sortDirection: "asc"
  })

  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false)
  
  // Debounced search implementation
  const debouncedSearchTimeout = useRef<NodeJS.Timeout | null>(null)
  
  // Handle search with debounce for performance
  const handleSearchChange = useCallback((value: string) => {
    if (debouncedSearchTimeout.current) {
      clearTimeout(debouncedSearchTimeout.current)
    }
    
    debouncedSearchTimeout.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, searchQuery: value }))
    }, 100) // 100ms debounce
  }, [])

  // Save view mode preference when it changes
  useEffect(() => {
    localStorage.setItem('taskViewMode', viewMode)
  }, [viewMode])

  // Load Tasks with optimized data fetching and error handling
  useEffect(() => {
    // Prevent duplicate fetches
    if (loadingRef.current) return
    
    loadingRef.current = true
    isMountedRef.current = true
    
    const loadTasks = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const fetchedTasks = await fetchTask()
        
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setTasks(fetchedTasks)
          
          // Store in localStorage with size limit consideration
          if (fetchedTasks.length < 1000) { // Only cache if reasonable size
            try {
              localStorage.setItem("calendarTasks", JSON.stringify(fetchedTasks))
            } catch (storageError) {
              console.warn("Failed to cache tasks in localStorage:", storageError)
            }
          }
        }
      } catch (error) {
        if (isMountedRef.current) {
          console.error("Failed to fetch tasks:", error)
          setError(error instanceof Error ? error.message : "Failed to load tasks")
          
          // Try to load from cache as fallback
          try {
            const cachedData = localStorage.getItem("calendarTasks")
            if (cachedData) {
              const parsedCache = JSON.parse(cachedData) as Task[]
              setTasks(parsedCache)
              console.info("Loaded tasks from cache due to fetch failure")
            } else {
              setTasks([])
            }
          } catch (cacheError) {
            console.warn("Failed to load cached tasks:", cacheError)
            setTasks([])
          }
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false)
          loadingRef.current = false
        }
      }
    }
  
    loadTasks()
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMountedRef.current = false
      if (debouncedSearchTimeout.current) {
        clearTimeout(debouncedSearchTimeout.current)
      }
    }
  }, [])

  // Memoized Task Filtering and Sorting with optimized calculation
  const filteredAndSortedTasks = useMemo(() => {
    // Short-circuit if no tasks to avoid unnecessary processing
    if (!tasks.length) return []
    
    // Apply filters with optimized chain
    const filteredTasks = filterTasks(tasks, searchQuery, priorityFilter, statusFilter)
    
    // Only sort if there are tasks after filtering
    return filteredTasks.length ? sortTasks(filteredTasks, sortConfig.sortBy, sortConfig.sortDirection) : []
  }, [tasks, searchQuery, priorityFilter, statusFilter, sortConfig.sortBy, sortConfig.sortDirection])

  // Toggle Priority Filter with batch update pattern
  const handleTogglePriorityFilter = useCallback((priority: Priority) => {
    setFilters(prev => ({
      ...prev,
      priorityFilter: prev.priorityFilter.includes(priority)
        ? prev.priorityFilter.filter(p => p !== priority)
        : [...prev.priorityFilter, priority]
    }))
  }, [])

  // Toggle Status Filter with batch update pattern
  const handleToggleStatusFilter = useCallback((status: CompletionStatus) => {
    setFilters(prev => ({
      ...prev,
      statusFilter: prev.statusFilter.includes(status)
        ? prev.statusFilter.filter(s => s !== status)
        : [...prev.statusFilter, status]
    }))
  }, [])

  // Clear All Filters with single state update
  const handleClearFilters = useCallback(() => {
    setFilters({
      searchQuery: "",
      priorityFilter: [],
      statusFilter: []
    })
  }, [])

  // Add new task with optimized immutable update
  const handleAddNewTask = useCallback((taskData: Omit<Task, "id">) => {
    // Generate a unique ID for the new task with collision prevention
    const newTaskId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    // Create the new task with ID
    const newTask: Task = {
      id: newTaskId,
      ...taskData,
    }

    // Update with functional state update pattern
    setTasks(currentTasks => {
      const updatedTasks = [...currentTasks, newTask]
      
      // Update localStorage asynchronously to prevent UI blocking
      queueMicrotask(() => {
        try {
          localStorage.setItem("calendarTasks", JSON.stringify(updatedTasks))
        } catch (error) {
          console.warn("Failed to store tasks in localStorage:", error)
        }
      })
      
      return updatedTasks
    })
  }, [])

  // Intelligent Sorting Logic using useCallback for stable function identity
  const handleToggleSort = useCallback((sortType: TaskSortOption) => {
    setSortConfig(current => ({
      sortBy: sortType,
      sortDirection: 
        current.sortBy === sortType && current.sortDirection === "asc" 
          ? "desc" 
          : "asc"
    }))
  }, [])

  // Navigation handler with useTransition for improved UX
  const handleTaskClick = useCallback((taskId: string) => {
    startTransition(() => {
      router.push(`/task-info?id=${taskId}`)
    })
  }, [router])

  // Dialog open handler
  const handleAddTask = useCallback(() => {
    setAddTaskDialogOpen(true)
  }, [])

  // Toggle task completion with optimized update pattern
  const handleToggleTaskCompletion = useCallback((taskId: string, event: React.MouseEvent) => {
    // Prevent propagation for UX clarity
    event.stopPropagation()
    
    setTasks(currentTasks => {
      // Map with early return optimization
      const updatedTasks = currentTasks.map(task => 
        task.id !== taskId ? task : {
          ...task,
          dateCompleted: task.dateCompleted !== undefined 
            ? undefined 
            : formatDateToString(new Date())
        }
      )
      
      // Schedule localStorage update to avoid blocking the main thread
      queueMicrotask(() => {
        try {
          localStorage.setItem("calendarTasks", JSON.stringify(updatedTasks))
        } catch (error) {
          console.warn("Failed to update tasks in localStorage:", error)
        }
      })
      
      return updatedTasks
    })
  }, [])

  // Calculate active filters count with memoization
  const activeFiltersCount = useMemo(() =>
    priorityFilter.length + statusFilter.length + (searchQuery ? 1 : 0),
    [priorityFilter, statusFilter, searchQuery]
  )
  
  // Show loading state while initial data is being fetched
  if (isLoading && !tasks.length) {
    return (
      <div className="container mx-auto py-12 px-4 h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">Loading documents...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 px-4 h-screen flex flex-col">
      <div className="flex flex-col space-y-4 flex-grow">
        {/* Header with title and actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl font-medium tracking-tight">Documents</h1>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        </div>

        {/* Search, Filter, and Sort Controls */}
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
            {/* Search Input with debounce implemented */}
            <TaskSearch
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
            />
            <div className="flex items-center gap-2">
              {/* Filter Dropdown with optimized props */}
              <TaskFilters
                filterState={{ priorityFilter, statusFilter, searchQuery }}
                onTogglePriorityFilter={handleTogglePriorityFilter}
                onToggleStatusFilter={handleToggleStatusFilter}
                onClearFilters={handleClearFilters}
              />
              {/* Sort Dropdown with consolidated props */}
              <TaskSort
                sortState={sortConfig}
                onToggleSort={handleToggleSort}
              />
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              {/* Add Task Button with loading state awareness */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddTask}
                className="h-8"
                disabled={isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Document
              </Button>
              {/* View Mode Toggle with persistent preferences */}
              <ViewToggle
                viewMode={viewMode}
                onViewModeChange={(mode) => setViewMode(mode)}
              />
            </div>
          </div>
        </div>

        {/* Active Filters Display with improved semantics */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap" 
               role="region" 
               aria-label="Active filters">
            <span>Filters:</span>
            {/* Display active search filter */}
            {searchQuery && (
              <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                <span>Title: {searchQuery}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0"
                  onClick={() => handleSearchChange("")}
                  aria-label="Clear search filter"
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
                  aria-label={`Remove ${priority} priority filter`}
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
                  aria-label={`Remove ${status} status filter`}
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

        {/* Task List/Grid Container with virtualization readiness */}
        <ScrollArea className="h-[670px] pr-4 overflow-y-auto mt-2">
          {isPending ? (
            <div className="flex justify-center py-8">
              <div className="animate-pulse">Loading...</div>
            </div>
          ) : filteredAndSortedTasks.length === 0 ? (
            // Display empty state with context sensitivity
            <EmptyState
              hasActiveFilters={activeFiltersCount > 0}
              onClearFilters={handleClearFilters}
              onAddTask={handleAddTask}
              isLoading={isLoading}
            />
          ) : viewMode === "list" ? (
            // Render tasks in list view with optimized props
            <TaskList
              tasks={filteredAndSortedTasks}
              onTaskClick={handleTaskClick}
              onToggleTaskCompletion={handleToggleTaskCompletion}
            />
          ) : (
            // Render tasks in grid view with optimized props
            <TaskGrid
              tasks={filteredAndSortedTasks}
              onTaskClick={handleTaskClick}
              onToggleTaskCompletion={handleToggleTaskCompletion}
            />
          )}
        </ScrollArea>
      </div>
      {/* Add Task Dialog with controlled state */}
      <AddTaskDialog 
        open={addTaskDialogOpen} 
        onOpenChange={setAddTaskDialogOpen} 
        onAddTask={handleAddNewTask} 
      />
    </div>
  )
}