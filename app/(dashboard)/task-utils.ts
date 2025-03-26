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
      const dateA = parseDate(a.dueDate).getTime()
      const dateB = parseDate(b.dueDate).getTime()
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA
    } else if (sortBy === "priority") {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const priorityA = priorityOrder[a.priority]
      const priorityB = priorityOrder[b.priority]
      return sortDirection === "asc" ? priorityA - priorityB : priorityB - priorityA
    } else if (sortBy === "status") {
      // Updated mapping to match CompletionStatus values
      const statusOrder = { overdue: 4, active: 3, "completed late": 2, "completed on time": 1 }
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
//  */
// export const generateSampleTasks = (): Task[] => {
//   return [
//     {
//       id: "task-1",
//       title: "Document 1: Authenticate Public Government Records",
//       description: "Verify the authenticity of archived government documents and ensure compliance with legal standards.",
//       dueDate: "01-12-2024",
//       completed: false,
//       dateCompleted: undefined,
//       priority: "high",
//     },
//     {
//       id: "task-2",
//       title: "Document 2: Digitize Historical Legislation Documents",
//       description: "Scan and categorize historical legislative acts for inclusion in the public digital repository.",
//       dueDate: "04-12-2024",
//       completed: true,
//       dateCompleted: "02-12-2024",
//       priority: "medium",
//     },
//     {
//       id: "task-3",
//       title: "Document 3: Review Public Access Policies",
//       description: "Analyze and update policies governing public access to classified government files.",
//       dueDate: "07-12-2024",
//       completed: false,
//       dateCompleted: undefined,
//       priority: "low",
//     },
//     {
//       id: "task-4",
//       title: "Document 4: Update Census Data Archives",
//       description: "Ensure that the latest national census data is accurately documented and stored securely.",
//       dueDate: "10-12-2024",
//       completed: true,
//       dateCompleted: "08-12-2024",
//       priority: "high",
//     },
//     {
//       id: "task-5",
//       title: "Document 5: Process Freedom of Information Requests",
//       description: "Evaluate and fulfill requests for public government records under transparency laws.",
//       dueDate: "13-12-2024",
//       completed: false,
//       dateCompleted: undefined,
//       priority: "medium",
//     },
//     {
//       id: "task-6",
//       title: "Document 6: Archive Court Rulings for Public Access",
//       description: "Organize and catalog judicial decisions to facilitate legal research and transparency.",
//       dueDate: "16-12-2024",
//       completed: true,
//       dateCompleted: "14-12-2024",
//       priority: "low",
//     },
//     {
//       id: "task-7",
//       title: "Document 7: Verify Land Registry Updates",
//       description: "Cross-check and validate recent changes to government land ownership records.",
//       dueDate: "19-12-2024",
//       completed: false,
//       dateCompleted: undefined,
//       priority: "high",
//     },
//     {
//       id: "task-8",
//       title: "Document 8: Audit Government Contracts Database",
//       description: "Review procurement records to ensure accuracy and compliance with state regulations.",
//       dueDate: "22-12-2024",
//       completed: true,
//       dateCompleted: "20-12-2024",
//       priority: "medium",
//     },
//     {
//       id: "task-9",
//       title: "Document 9: Update National Security Directives",
//       description: "Analyze and revise classified government directives to reflect current policies.",
//       dueDate: "25-12-2024",
//       completed: false,
//       dateCompleted: undefined,
//       priority: "low",
//     },
//     {
//       id: "task-10",
//       title: "Document 10: Publish Annual Government Expenditure Report",
//       description: "Compile and release financial statements detailing national government spending.",
//       dueDate: "28-12-2024",
//       completed: true,
//       dateCompleted: "26-12-2024",
//       priority: "high",
//     },
//     {
//       id: "task-100",
//       title: "Document 100: Update Census Data Archives",
//       description: "Ensure that the latest national census data is accurately documented and stored securely.",
//       dueDate: "24-09-2025",
//       completed: true,
//       dateCompleted: "22-09-2025",
//       priority: "high",
//     },
//   ];
// };
