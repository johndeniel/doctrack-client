import { cn } from "@/lib/utils"
import type { Task, CompletionStatus } from "@/lib/types"
import { isPast, isToday, isBefore, isSameDay, parse } from "date-fns"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"

// Function to parse date string from MySQL format to JavaScript Date
const parseDate = (dateString: string): Date => {
  return parse(dateString, "dd-MM-yyyy", new Date())
}

// Function to get the completion status of a task
export const getCompletionStatus = (task: Task): CompletionStatus => {
  if (!task.completed) {
    // If task is not completed and due date is in the past, it's overdue
    return isPast(parseDate(task.date)) && !isToday(parseDate(task.date)) ? "overdue" : "active"
  }

  // If task is completed, check if it was completed before or after the due date
  if (task.dateCompleted) {
    const dueDate = parseDate(task.date)
    const completedDate = parseDate(task.dateCompleted)

    // If completed on or before due date, it's on time
    return isBefore(completedDate, dueDate) || isSameDay(completedDate, dueDate) ? "onTime" : "late"
  }

  // Default to on time if dateCompleted is missing but task is marked as completed
  return "onTime"
}

// Update the CompletionStatusBadge component to use the new premium styling
export const CompletionStatusBadge = ({ task }: { task: Task }) => {
  const status = getCompletionStatus(task)

  const statusConfig = {
    onTime: {
      label: "Completed On Time",
      className:
        "text-[hsl(var(--status-completed-text))] bg-[hsl(var(--status-completed-bg))] border-[hsl(var(--status-completed-border))]",
      icon: <CheckCircle className="h-2.5 w-2.5 mr-1" />,
    },
    late: {
      label: "Completed Late",
      className:
        "text-[hsl(var(--status-late-text))] bg-[hsl(var(--status-late-bg))] border-[hsl(var(--status-late-border))]",
      icon: <Clock className="h-2.5 w-2.5 mr-1" />,
    },
    active: {
      label: "Active",
      className:
        "text-[hsl(var(--status-active-text))] bg-[hsl(var(--status-active-bg))] border-[hsl(var(--status-active-border))]",
      icon: null,
    },
    overdue: {
      label: "Overdue",
      className:
        "text-[hsl(var(--status-overdue-text))] bg-[hsl(var(--status-overdue-bg))] border-[hsl(var(--status-overdue-border))]",
      icon: <AlertCircle className="h-2.5 w-2.5 mr-1" />,
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

