import { format, parse, isPast, isToday, isBefore, isSameDay } from "date-fns"
import type { Task, CompletionStatus, Priority } from "@/lib/types"

/**
 * Parse date string from dd-MM-yyyy format to JavaScript Date
 * @param dateString Date string in dd-MM-yyyy format
 * @returns JavaScript Date object
 */
export const parseDate = (dateString: string): Date => {
  return parse(dateString, "dd-MM-yyyy", new Date())
}

/**
 * Format JavaScript Date to dd-MM-yyyy string
 * @param date JavaScript Date object
 * @returns Date string in dd-MM-yyyy format
 */
export const formatDateToString = (date: Date): string => {
  return format(date, "dd-MM-yyyy")
}

/**
 * Get the completion status of a task
 * @param task Task object
 * @returns CompletionStatus (onTime, late, active, or overdue)
 */
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

/**
 * Filter tasks based on search query, priority, and status filters
 * @param tasks Array of tasks to filter
 * @param searchQuery Search query string
 * @param priorityFilter Array of priority filters
 * @param statusFilter Array of status filters
 * @returns Filtered array of tasks
 */
export const filterTasks = (
  tasks: Task[],
  searchQuery: string,
  priorityFilter: Priority[],
  statusFilter: CompletionStatus[],
): Task[] => {
  return tasks.filter((task) => {
    // Search filter
    const matchesSearch = searchQuery === "" || task.title.toLowerCase().includes(searchQuery.toLowerCase())

    // Priority filter
    const matchesPriority = priorityFilter.length === 0 || priorityFilter.includes(task.priority)

    // Status filter
    const taskStatus = getCompletionStatus(task)
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(taskStatus)

    return matchesSearch && matchesPriority && matchesStatus
  })
}

/**
 * Sort tasks based on sort criteria and direction
 * @param tasks Array of tasks to sort
 * @param sortBy Sort criteria
 * @param sortDirection Sort direction
 * @returns Sorted array of tasks
 */
export const sortTasks = (
  tasks: Task[],
  sortBy: "date" | "priority" | "title" | "status",
  sortDirection: "asc" | "desc",
): Task[] => {
  return [...tasks].sort((a, b) => {
    // Sort by selected criteria
    if (sortBy === "date") {
      const dateA = parseDate(a.date).getTime()
      const dateB = parseDate(b.date).getTime()
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA
    } else if (sortBy === "priority") {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const priorityA = priorityOrder[a.priority]
      const priorityB = priorityOrder[b.priority]
      return sortDirection === "asc" ? priorityA - priorityB : priorityB - priorityA
    } else if (sortBy === "status") {
      // Sort by completion status
      const statusOrder = { overdue: 4, active: 3, late: 2, onTime: 1 }
      const statusA = statusOrder[getCompletionStatus(a)]
      const statusB = statusOrder[getCompletionStatus(b)]
      return sortDirection === "asc" ? statusA - statusB : statusB - statusA
    } else {
      // Sort by title (default)
      return sortDirection === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
    }
  })
}

/**
 * Generate sample tasks for demonstration
 * @returns Array of sample tasks
 */
export const generateSampleTasks = (): Task[] => {
  return [
    {
      id: "task-1",
      title: "Review Q1 financial report",
      description:
        "Verify financial data, check compliance with regulations, and approve for distribution to stakeholders.",
      date: "10-06-2024",
      completed: false,
      priority: "high",
    },
    {
      id: "task-2",
      title: "Process vendor invoices",
      description: "Validate invoice details, match with purchase orders, and prepare for payment processing.",
      date: "12-06-2024",
      completed: false,
      priority: "medium",
    },
    {
      id: "task-3",
      title: "Update company policy documentation",
      description:
        "Incorporate recent changes to remote work policies and distribute updated documents to all departments.",
      date: "13-06-2024",
      completed: true,
      dateCompleted: "12-06-2024",
      priority: "low",
    },
    {
      id: "task-4",
      title: "Prepare meeting minutes",
      description: "Compile notes from the quarterly board meeting and format according to corporate standards.",
      date: "15-06-2024",
      completed: false,
      priority: "medium",
    },
    {
      id: "task-5",
      title: "Submit compliance documents",
      description: "Complete all required forms and submit to regulatory authorities before the deadline.",
      date: "15-06-2024",
      completed: false,
      priority: "high",
    },
    {
      id: "task-6",
      title: "Process expense reports",
      description: "Review receipts, validate expense claims, and approve for reimbursement.",
      date: "15-06-2024",
      completed: true,
      dateCompleted: "15-06-2024",
      priority: "low",
    },
    {
      id: "task-7",
      title: "Prepare weekly status report",
      description: "Compile project updates, milestone achievements, and outstanding issues for executive review.",
      date: "15-06-2024",
      completed: false,
      priority: "medium",
    },
    {
      id: "task-8",
      title: "Review client contract amendments",
      description:
        "Carefully review all changes to contract terms, consult with legal if necessary, and sign approved documents.",
      date: "16-06-2024",
      completed: false,
      priority: "high",
    },
    {
      id: "task-9",
      title: "Update product documentation",
      description: "Revise user manuals, technical specifications, and release notes for upcoming product version.",
      date: "18-06-2024",
      completed: false,
      priority: "medium",
    },
    {
      id: "task-10",
      title: "Submit Q2 marketing campaign documents",
      description: "Finalize all creative assets, campaign strategy documents, and budget allocations for approval.",
      date: "22-06-2024",
      completed: false,
      priority: "high",
    },
    {
      id: "task-11",
      title: "Compile department performance reports",
      description:
        "Gather KPI data from all departments, create summary visualizations, and prepare executive dashboard.",
      date: "29-06-2024",
      completed: false,
      priority: "medium",
    },
    {
      id: "task-12",
      title: "Process venue contracts",
      description: "Review venue terms, negotiate final details, and process contract paperwork for company retreat.",
      date: "05-07-2024",
      completed: false,
      priority: "low",
    },
  ]
}

