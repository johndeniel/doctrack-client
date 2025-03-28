import { parse, format, isPast, isToday, isBefore, isSameDay } from "date-fns"
import type { Task, CompletionStatus } from "@/lib/types"

/**
 * Utility functions for calendar and task operations
 */

/**
 * Parses a date string from MySQL format to JavaScript Date
 * @param dateString - Date string in dd-MM-yyyy format
 * @returns JavaScript Date object
 */
export const parseDate = (dateString: string): Date => {
  return parse(dateString, "dd-MM-yyyy", new Date())
}

/**
 * Formats a JavaScript Date to MySQL format string
 * @param date - JavaScript Date object
 * @returns Date string in dd-MM-yyyy format
 */
export const formatDateToString = (date: Date): string => {
  return format(date, "dd-MM-yyyy")
}

/**
 * Determines the completion status of a task based on its dates.
 * It uses the existence of dateCompleted to decide if a task is complete.
 *
 * @param task - The task object to evaluate
 * @returns CompletionStatus - The status of the task (active, overdue, completed on time, or completed late)
 */
export const getCompletionStatus = (task: Task): CompletionStatus => {
  // Determine if the task is completed by checking if dateCompleted exists
  const isCompleted = task.dateCompleted !== undefined

  if (!isCompleted) {
    // If the task is not completed and its due date is in the past (and not today), it's overdue; otherwise, it's active
    return isPast(parseDate(task.dueDate)) && !isToday(parseDate(task.dueDate))
      ? "overdue"
      : "active"
  }

  // If the task is completed, compare the completion date with the due date
  const dueDate = parseDate(task.dueDate)
  const completedDate = parseDate(task.dateCompleted!)

  // If completed on or before the due date, it's on time; otherwise, it's completed late
  return isBefore(completedDate, dueDate) || isSameDay(completedDate, dueDate)
    ? "completed on time"
    : "completed late"
}

/**
 * Checks if a task's due date is the same as the given day.
 *
 * @param task - The task to check.
 * @param day - The day to compare against.
 * @returns Boolean indicating if the task is on the given day.
 */
export const isTaskOnDay = (task: Task, day: Date): boolean => {
  const taskDate = parseDate(task.dueDate)
  return (
    taskDate.getDate() === day.getDate() &&
    taskDate.getMonth() === day.getMonth() &&
    taskDate.getFullYear() === day.getFullYear()
  )
}

/**
 * Checks if a date is today or in the future.
 *
 * @param day - The date to check.
 * @returns Boolean indicating if the date is today or in the future.
 */
export const isCurrentOrFuture = (day: Date): boolean => {
  return isToday(day) || day > new Date()
}
