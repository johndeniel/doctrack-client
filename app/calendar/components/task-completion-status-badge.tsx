import { cn } from "@/lib/utils"
import type { Task, CompletionStatus } from "@/lib/types"
import { isPast, isToday, isBefore, isSameDay, parse } from "date-fns"
import { JSX } from "react"

/**
 * Parses a date string from MySQL format to JavaScript Date
 * @param dateString - Date string in dd-MM-yyyy format
 * @returns JavaScript Date object
 */
const parseDate = (dateString: string): Date => {
  return parse(dateString, "dd-MM-yyyy", new Date())
}

/**
 * Determines the completion status of a task based on its completion state and dates
 * @param task - The task object to evaluate
 * @returns CompletionStatus - The status of the task (active, overdue, completed on time, completed late)
 */
export const getCompletionStatus = (task: Task): CompletionStatus => {
  if (!task.completed) {
    // If task is not completed and due date is in the past, it's overdue
    return isPast(parseDate(task.dueDate)) && !isToday(parseDate(task.dueDate)) ? "overdue" : "active"
  }

  // If task is completed, check if it was completed before or after the due date
  if (task.dateCompleted) {
    const dueDate = parseDate(task.dueDate)
    const completedDate = parseDate(task.dateCompleted)

    // If completed on or before due date, it's on time
    return isBefore(completedDate, dueDate) || isSameDay(completedDate, dueDate)
      ? "completed on time"
      : "completed late"
  }

  // Default to on time if dateCompleted is missing but task is marked as completed
  return "completed on time"
}

/**
 * Props for the TaskCompletionStatusBadge component
 */
interface TaskCompletionStatusBadgeProps {
  task: Task
}

/**
 * Displays a badge indicating the completion status of a task
 * Uses custom styling based on the task's status
 */
export const TaskCompletionStatusBadge = ({ task }: TaskCompletionStatusBadgeProps): JSX.Element => {
  const status = getCompletionStatus(task)

  // Configuration for different status types with appropriate styling
  const statusConfig = {
    "completed on time": {
      label: "Completed On Time",
      className:
        "text-[hsl(var(--status-completed-text))] bg-[hsl(var(--status-completed-bg))] border-[hsl(var(--status-completed-border))]",
    },
    "completed late": {
      label: "Completed Late",
      className:
        "text-[hsl(var(--status-late-text))] bg-[hsl(var(--status-late-bg))] border-[hsl(var(--status-late-border))]",
    },
    active: {
      label: "Active",
      className:
        "text-[hsl(var(--status-active-text))] bg-[hsl(var(--status-active-bg))] border-[hsl(var(--status-active-border))]",
    },
    overdue: {
      label: "Overdue",
      className:
        "text-[hsl(var(--status-overdue-text))] bg-[hsl(var(--status-overdue-bg))] border-[hsl(var(--status-overdue-border))]",
    },
  }

  const { label, className } = statusConfig[status]

  return (
    <div className={cn("border whitespace-nowrap text-center badge", className)}>
      <span className="inline-block">{label}</span>
    </div>
  )
}

