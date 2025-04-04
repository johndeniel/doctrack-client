// View mode options for task display
export type ViewMode = "list" | "grid"

// Task sort options
export type TaskSortOption = "date" | "priority" | "title" | "status"

// Sort direction options
export type SortDirection = "asc" | "desc"

// Priority levels for tasks
export type Priority = "High" | "Medium" | "Low"

// Task completion status types
export type CompletionStatus = "active" | "overdue" | "completed on time" | "completed late" 
// Task interface
export interface Task {
  id: string
  title: string
  description: string
  priority: Priority
  dueDate: string // Format: dd-MM-yyyy
  dateCompleted?: string // Format: dd-MM-yyyy
}

// Filter state interface
export interface FilterState {
  priorityFilter: Priority[]
  statusFilter: CompletionStatus[]
  searchQuery: string
}

// Sort state interface
export interface SortState {
  sortBy: TaskSortOption
  sortDirection: SortDirection
}
