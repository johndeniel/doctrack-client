// Shared types for the application

// Priority levels for tasks
export type Priority = "high" | "medium" | "low"

// File types for document management
export type FileType = "document" | "spreadsheet" | "presentation" | "pdf" | "image" | "folder" | "other"

// Sort options for task lists
export type SortOption = "name" | "modified" | "created" | "size" | "type"

// View mode options for task display
export type ViewMode = "list" | "grid"

// Task sort options
export type TaskSortOption = "date" | "priority" | "title" | "status"

// Sort direction options
export type SortDirection = "asc" | "desc"

// File item interface
export interface FileItem {
  id: string
  name: string
  type: FileType
  size: number // in bytes
  createdAt: string // ISO date string
  modifiedAt: string // ISO date string
  starred: boolean
  shared: boolean
  owner: string
  description?: string
  priority?: Priority
  parentId?: string // For folder structure
  color?: string // For folder color
}

// Task completion status types
export type CompletionStatus = "onTime" | "late" | "active" | "overdue"

// Task interface
export interface Task {
  id: string
  title: string
  description?: string
  date: string // Format: dd-MM-yyyy
  completed: boolean
  dateCompleted?: string // Format: dd-MM-yyyy
  priority: Priority
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

