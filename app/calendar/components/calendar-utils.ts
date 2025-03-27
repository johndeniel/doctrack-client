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
 * Checks if a task's date is the same as the given day
 * @param task - The task to check
 * @param day - The day to compare against
 * @returns Boolean indicating if the task is on the given day
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
 * Checks if a date is today or in the future
 * @param day - The date to check
 * @returns Boolean indicating if the date is today or in the future
 */
export const isCurrentOrFuture = (day: Date): boolean => {
  return isToday(day) || day > new Date()
}

