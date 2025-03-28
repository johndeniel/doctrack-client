import { cn } from "@/lib/utils"
import type { Priority, Task, CompletionStatus } from "@/lib/types"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"
import { isPast, isToday, isBefore, isSameDay, parse } from "date-fns"

// Function to parse date string from MySQL format to JavaScript Date
const parseDate = (dateString: string): Date => {
  return parse(dateString, "dd-MM-yyyy", new Date())
}

// Function to get the completion status of a task
export const getCompletionStatus = (task: Task): CompletionStatus => {
  if (!task.dateCompleted) {
    // If task is not completed and due date is in the past, it's overdue
    return isPast(parseDate(task.dueDate)) && !isToday(parseDate(task.dueDate)) ? "overdue" : "active"
  }

  // If task is completed, check if it was completed before or after the due date
  if (task.dateCompleted) {
    const dueDate = parseDate(task.dueDate)
    const completedDate = parseDate(task.dateCompleted)

    // If completed on or before due date, it's on time
    return isBefore(completedDate, dueDate) || isSameDay(completedDate, dueDate) ? "completed on time" : "completed late"
  }

  // Default to on time if dateCompleted is missing but task is marked as completed
  return "completed on time"
}

// Update the PriorityBadge component to use the new premium styling
export const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const priorityConfig = {
    high: {
      label: "High",
      className:
        "text-[hsl(var(--priority-high-text))] bg-[hsl(var(--priority-high-bg))] border-[hsl(var(--priority-high-border))]",
    },
    medium: {
      label: "Medium",
      className:
        "text-[hsl(var(--priority-medium-text))] bg-[hsl(var(--priority-medium-bg))] border-[hsl(var(--priority-medium-border))]",
    },
    low: {
      label: "Low",
      className:
        "text-[hsl(var(--priority-low-text))] bg-[hsl(var(--priority-low-bg))] border-[hsl(var(--priority-low-border))]",
    },
  }

  const { label, className } = priorityConfig[priority]

  return (
    <div className={cn("border whitespace-nowrap badge", className)}>
      <span className="inline-block">{label}</span>
    </div>
  )
}

export const CompletionStatusBadge = ({ task }: { task: Task }) => {
  const status = getCompletionStatus(task)

  const statusConfig = {
    active: {
      label: "Active",
      className:
        "bg-[hsl(var(--status-active-bg))] text-[hsl(var(--status-active-text))] border-[hsl(var(--status-active-border))]",
      icon: null,
    },
    overdue: {
      label: "Overdue",
      className:
        "bg-[hsl(var(--status-overdue-bg))] text-[hsl(var(--status-overdue-text))] border-[hsl(var(--status-overdue-border))]",
      icon: <AlertCircle className="h-2.5 w-2.5 mr-1" />,
    },
    "completed on time": {
      label: "Completed",
      className:
        "bg-[hsl(var(--status-completed-bg))] text-[hsl(var(--status-completed-text))] border-[hsl(var(--status-completed-border))]",
      icon: <CheckCircle className="h-2.5 w-2.5 mr-1" />,
    },
    "completed late": {
      label: "Completed Late",
      className:
        "bg-[hsl(var(--status-late-bg))] text-[hsl(var(--status-late-text))] border-[hsl(var(--status-late-border))]",
      icon: <Clock className="h-2.5 w-2.5 mr-1" />,
    },
  }

  const { label, className, icon } = statusConfig[status]

  return (
    <span className={cn("border flex items-center whitespace-nowrap badge", "leading-none", className)}>
      {icon}
      {label}
    </span>
  )
}