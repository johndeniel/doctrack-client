import { cn } from "@/lib/utils";
import type { Task, CompletionStatus } from "@/lib/types";
import { isPast, isToday, isBefore, isSameDay, parse } from "date-fns";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

/**
 * Parses a date string in "dd-MM-yyyy" format into a JavaScript Date object.
 * @param dateString - The date string in MySQL format (dd-MM-yyyy).
 * @returns A Date object.
 */
const parseDate = (dateString: string): Date => {
  return parse(dateString, "dd-MM-yyyy", new Date());
};

/**
 * Determines the completion status of a task.
 * Uses the existence of dateCompleted to decide if a task is complete.
 *
 * @param task - The task object.
 * @returns A CompletionStatus value ("active", "overdue", "completed on time", or "completed late").
 */
export const getCompletionStatus = (task: Task): CompletionStatus => {
  // Determine if the task is completed by checking if dateCompleted exists
  const isCompleted = task.dateCompleted !== undefined;

  // If the task is not completed, check if it's overdue.
  if (!isCompleted) {
    const dueDate = parseDate(task.dueDate);
    return isPast(dueDate) && !isToday(dueDate) ? "overdue" : "active";
  }

  // If the task is completed, compare the completion date with the due date.
  const dueDate = parseDate(task.dueDate);
  const completedDate = parseDate(task.dateCompleted!);

  return isBefore(completedDate, dueDate) || isSameDay(completedDate, dueDate)
    ? "completed on time"
    : "completed late";
};

/**
 * StatusBadge component renders a badge showing the task's completion status.
 *
 * @param task - The task object.
 */
export const StatusBadge = ({ task }: { task: Task }) => {
  const status = getCompletionStatus(task);

  const statusConfig = {
    "completed on time": {
      label: "Completed On Time",
      className:
        "text-[hsl(var(--status-completed-text))] bg-[hsl(var(--status-completed-bg))] border-[hsl(var(--status-completed-border))]",
      icon: <CheckCircle className="h-2.5 w-2.5 mr-1" />,
    },
    "completed late": {
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
  };

  const { label, className, icon } = statusConfig[status];

  return (
    <span
      className={cn(
        "border flex items-center whitespace-nowrap badge leading-none",
        className
      )}
    >
      {icon}
      {label}
    </span>
  );
};
