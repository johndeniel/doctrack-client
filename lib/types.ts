
export type Priority = "high" | "medium" | "low"

export interface Task {
  id: string
  title: string
  date: string // Format: "DD-MM-YYYY"
  completed: boolean
  description?: string
  priority: Priority
}
