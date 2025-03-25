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
      const dateA = parseDate(a.date).getTime()
      const dateB = parseDate(b.date).getTime()
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
 */
export const generateSampleTasks = (): Task[] => {
  return [
    {
      id: "task-1",
      title: "Document 1: Authenticate Public Government Records",
      description: "Verify the authenticity of archived government documents and ensure compliance with legal standards.",
      date: "01-12-2024",
      completed: false,
      dateCompleted: undefined,
      priority: "high",
    },
    {
      id: "task-2",
      title: "Document 2: Digitize Historical Legislation Documents",
      description: "Scan and categorize historical legislative acts for inclusion in the public digital repository.",
      date: "04-12-2024",
      completed: true,
      dateCompleted: "02-12-2024",
      priority: "medium",
    },
    {
      id: "task-3",
      title: "Document 3: Review Public Access Policies",
      description: "Analyze and update policies governing public access to classified government files.",
      date: "07-12-2024",
      completed: false,
      dateCompleted: undefined,
      priority: "low",
    },
    {
      id: "task-4",
      title: "Document 4: Update Census Data Archives",
      description: "Ensure that the latest national census data is accurately documented and stored securely.",
      date: "10-12-2024",
      completed: true,
      dateCompleted: "08-12-2024",
      priority: "high",
    },
    {
      id: "task-5",
      title: "Document 5: Process Freedom of Information Requests",
      description: "Evaluate and fulfill requests for public government records under transparency laws.",
      date: "13-12-2024",
      completed: false,
      dateCompleted: undefined,
      priority: "medium",
    },
    {
      id: "task-6",
      title: "Document 6: Archive Court Rulings for Public Access",
      description: "Organize and catalog judicial decisions to facilitate legal research and transparency.",
      date: "16-12-2024",
      completed: true,
      dateCompleted: "14-12-2024",
      priority: "low",
    },
    {
      id: "task-7",
      title: "Document 7: Verify Land Registry Updates",
      description: "Cross-check and validate recent changes to government land ownership records.",
      date: "19-12-2024",
      completed: false,
      dateCompleted: undefined,
      priority: "high",
    },
    {
      id: "task-8",
      title: "Document 8: Audit Government Contracts Database",
      description: "Review procurement records to ensure accuracy and compliance with state regulations.",
      date: "22-12-2024",
      completed: true,
      dateCompleted: "20-12-2024",
      priority: "medium",
    },
    {
      id: "task-9",
      title: "Document 9: Update National Security Directives",
      description: "Analyze and revise classified government directives to reflect current policies.",
      date: "25-12-2024",
      completed: false,
      dateCompleted: undefined,
      priority: "low",
    },
    {
      id: "task-10",
      title: "Document 10: Publish Annual Government Expenditure Report",
      description: "Compile and release financial statements detailing national government spending.",
      date: "28-12-2024",
      completed: true,
      dateCompleted: "26-12-2024",
      priority: "high",
    },
    {
      id: "task-11",
      title: "Document 11: Process International Treaty Documentation",
      description: "Review and file official agreements signed between the national government and foreign entities.",
      date: "31-12-2024",
      completed: false,
      dateCompleted: undefined,
      priority: "medium",
    },
    {
      id: "task-12",
      title: "Document 12: Review Electoral Records for Accuracy",
      description: "Ensure all voter registration and election results are correctly recorded in the government database.",
      date: "03-01-2025",
      completed: true,
      dateCompleted: "01-01-2025",
      priority: "low",
    },
    {
      id: "task-13",
      title: "Document 13: Authenticate Public Government Records",
      description: "Verify the authenticity of archived government documents and ensure compliance with legal standards.",
      date: "06-01-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "high",
    },
    {
      id: "task-14",
      title: "Document 14: Digitize Historical Legislation Documents",
      description: "Scan and categorize historical legislative acts for inclusion in the public digital repository.",
      date: "09-01-2025",
      completed: true,
      dateCompleted: "07-01-2025",
      priority: "medium",
    },
    {
      id: "task-15",
      title: "Document 15: Review Public Access Policies",
      description: "Analyze and update policies governing public access to classified government files.",
      date: "12-01-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "low",
    },
    {
      id: "task-16",
      title: "Document 16: Update Census Data Archives",
      description: "Ensure that the latest national census data is accurately documented and stored securely.",
      date: "15-01-2025",
      completed: true,
      dateCompleted: "13-01-2025",
      priority: "high",
    },
    {
      id: "task-17",
      title: "Document 17: Process Freedom of Information Requests",
      description: "Evaluate and fulfill requests for public government records under transparency laws.",
      date: "18-01-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "medium",
    },
    {
      id: "task-18",
      title: "Document 18: Archive Court Rulings for Public Access",
      description: "Organize and catalog judicial decisions to facilitate legal research and transparency.",
      date: "21-01-2025",
      completed: true,
      dateCompleted: "19-01-2025",
      priority: "low",
    },
    {
      id: "task-19",
      title: "Document 19: Verify Land Registry Updates",
      description: "Cross-check and validate recent changes to government land ownership records.",
      date: "24-01-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "high",
    },
    {
      id: "task-20",
      title: "Document 20: Audit Government Contracts Database",
      description: "Review procurement records to ensure accuracy and compliance with state regulations.",
      date: "27-01-2025",
      completed: true,
      dateCompleted: "25-01-2025",
      priority: "medium",
    },
    {
      id: "task-21",
      title: "Document 21: Update National Security Directives",
      description: "Analyze and revise classified government directives to reflect current policies.",
      date: "30-01-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "low",
    },
    {
      id: "task-22",
      title: "Document 22: Publish Annual Government Expenditure Report",
      description: "Compile and release financial statements detailing national government spending.",
      date: "02-02-2025",
      completed: true,
      dateCompleted: "31-01-2025",
      priority: "high",
    },
    {
      id: "task-23",
      title: "Document 23: Process International Treaty Documentation",
      description: "Review and file official agreements signed between the national government and foreign entities.",
      date: "05-02-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "medium",
    },
    {
      id: "task-24",
      title: "Document 24: Review Electoral Records for Accuracy",
      description: "Ensure all voter registration and election results are correctly recorded in the government database.",
      date: "08-02-2025",
      completed: true,
      dateCompleted: "06-02-2025",
      priority: "low",
    },
    {
      id: "task-25",
      title: "Document 25: Authenticate Public Government Records",
      description: "Verify the authenticity of archived government documents and ensure compliance with legal standards.",
      date: "11-02-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "high",
    },
    {
      id: "task-26",
      title: "Document 26: Digitize Historical Legislation Documents",
      description: "Scan and categorize historical legislative acts for inclusion in the public digital repository.",
      date: "14-02-2025",
      completed: true,
      dateCompleted: "12-02-2025",
      priority: "medium",
    },
    {
      id: "task-27",
      title: "Document 27: Review Public Access Policies",
      description: "Analyze and update policies governing public access to classified government files.",
      date: "17-02-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "low",
    },
    {
      id: "task-28",
      title: "Document 28: Update Census Data Archives",
      description: "Ensure that the latest national census data is accurately documented and stored securely.",
      date: "20-02-2025",
      completed: true,
      dateCompleted: "18-02-2025",
      priority: "high",
    },
    {
      id: "task-29",
      title: "Document 29: Process Freedom of Information Requests",
      description: "Evaluate and fulfill requests for public government records under transparency laws.",
      date: "23-02-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "medium",
    },
    {
      id: "task-30",
      title: "Document 30: Archive Court Rulings for Public Access",
      description: "Organize and catalog judicial decisions to facilitate legal research and transparency.",
      date: "26-02-2025",
      completed: true,
      dateCompleted: "24-02-2025",
      priority: "low",
    },
    {
      id: "task-31",
      title: "Document 31: Verify Land Registry Updates",
      description: "Cross-check and validate recent changes to government land ownership records.",
      date: "01-03-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "high",
    },
    {
      id: "task-32",
      title: "Document 32: Audit Government Contracts Database",
      description: "Review procurement records to ensure accuracy and compliance with state regulations.",
      date: "04-03-2025",
      completed: true,
      dateCompleted: "02-03-2025",
      priority: "medium",
    },
    {
      id: "task-33",
      title: "Document 33: Update National Security Directives",
      description: "Analyze and revise classified government directives to reflect current policies.",
      date: "07-03-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "low",
    },
    {
      id: "task-34",
      title: "Document 34: Publish Annual Government Expenditure Report",
      description: "Compile and release financial statements detailing national government spending.",
      date: "10-03-2025",
      completed: true,
      dateCompleted: "08-03-2025",
      priority: "high",
    },
    {
      id: "task-35",
      title: "Document 35: Process International Treaty Documentation",
      description: "Review and file official agreements signed between the national government and foreign entities.",
      date: "13-03-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "medium",
    },
    {
      id: "task-36",
      title: "Document 36: Review Electoral Records for Accuracy",
      description: "Ensure all voter registration and election results are correctly recorded in the government database.",
      date: "16-03-2025",
      completed: true,
      dateCompleted: "14-03-2025",
      priority: "low",
    },
    {
      id: "task-37",
      title: "Document 37: Authenticate Public Government Records",
      description: "Verify the authenticity of archived government documents and ensure compliance with legal standards.",
      date: "19-03-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "high",
    },
    {
      id: "task-38",
      title: "Document 38: Digitize Historical Legislation Documents",
      description: "Scan and categorize historical legislative acts for inclusion in the public digital repository.",
      date: "22-03-2025",
      completed: true,
      dateCompleted: "20-03-2025",
      priority: "medium",
    },
    {
      id: "task-39",
      title: "Document 39: Review Public Access Policies",
      description: "Analyze and update policies governing public access to classified government files.",
      date: "25-03-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "low",
    },
    {
      id: "task-40",
      title: "Document 40: Update Census Data Archives",
      description: "Ensure that the latest national census data is accurately documented and stored securely.",
      date: "28-03-2025",
      completed: true,
      dateCompleted: "26-03-2025",
      priority: "high",
    },
    {
      id: "task-41",
      title: "Document 41: Process Freedom of Information Requests",
      description: "Evaluate and fulfill requests for public government records under transparency laws.",
      date: "31-03-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "medium",
    },
    {
      id: "task-42",
      title: "Document 42: Archive Court Rulings for Public Access",
      description: "Organize and catalog judicial decisions to facilitate legal research and transparency.",
      date: "03-04-2025",
      completed: true,
      dateCompleted: "01-04-2025",
      priority: "low",
    },
    {
      id: "task-43",
      title: "Document 43: Verify Land Registry Updates",
      description: "Cross-check and validate recent changes to government land ownership records.",
      date: "06-04-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "high",
    },
    {
      id: "task-44",
      title: "Document 44: Audit Government Contracts Database",
      description: "Review procurement records to ensure accuracy and compliance with state regulations.",
      date: "09-04-2025",
      completed: true,
      dateCompleted: "07-04-2025",
      priority: "medium",
    },
    {
      id: "task-45",
      title: "Document 45: Update National Security Directives",
      description: "Analyze and revise classified government directives to reflect current policies.",
      date: "12-04-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "low",
    },
    {
      id: "task-46",
      title: "Document 46: Publish Annual Government Expenditure Report",
      description: "Compile and release financial statements detailing national government spending.",
      date: "15-04-2025",
      completed: true,
      dateCompleted: "13-04-2025",
      priority: "high",
    },
    {
      id: "task-47",
      title: "Document 47: Process International Treaty Documentation",
      description: "Review and file official agreements signed between the national government and foreign entities.",
      date: "18-04-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "medium",
    },
    {
      id: "task-48",
      title: "Document 48: Review Electoral Records for Accuracy",
      description: "Ensure all voter registration and election results are correctly recorded in the government database.",
      date: "21-04-2025",
      completed: true,
      dateCompleted: "19-04-2025",
      priority: "low",
    },
    {
      id: "task-49",
      title: "Document 49: Authenticate Public Government Records",
      description: "Verify the authenticity of archived government documents and ensure compliance with legal standards.",
      date: "24-04-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "high",
    },
    {
      id: "task-50",
      title: "Document 50: Digitize Historical Legislation Documents",
      description: "Scan and categorize historical legislative acts for inclusion in the public digital repository.",
      date: "27-04-2025",
      completed: true,
      dateCompleted: "25-04-2025",
      priority: "medium",
    },
    {
      id: "task-51",
      title: "Document 51: Review Public Access Policies",
      description: "Analyze and update policies governing public access to classified government files.",
      date: "30-04-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "low",
    },
    {
      id: "task-52",
      title: "Document 52: Update Census Data Archives",
      description: "Ensure that the latest national census data is accurately documented and stored securely.",
      date: "03-05-2025",
      completed: true,
      dateCompleted: "01-05-2025",
      priority: "high",
    },
    {
      id: "task-53",
      title: "Document 53: Process Freedom of Information Requests",
      description: "Evaluate and fulfill requests for public government records under transparency laws.",
      date: "06-05-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "medium",
    },
    {
      id: "task-54",
      title: "Document 54: Archive Court Rulings for Public Access",
      description: "Organize and catalog judicial decisions to facilitate legal research and transparency.",
      date: "09-05-2025",
      completed: true,
      dateCompleted: "07-05-2025",
      priority: "low",
    },
    {
      id: "task-55",
      title: "Document 55: Verify Land Registry Updates",
      description: "Cross-check and validate recent changes to government land ownership records.",
      date: "12-05-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "high",
    },
    {
      id: "task-56",
      title: "Document 56: Audit Government Contracts Database",
      description: "Review procurement records to ensure accuracy and compliance with state regulations.",
      date: "15-05-2025",
      completed: true,
      dateCompleted: "13-05-2025",
      priority: "medium",
    },
    {
      id: "task-57",
      title: "Document 57: Update National Security Directives",
      description: "Analyze and revise classified government directives to reflect current policies.",
      date: "18-05-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "low",
    },
    {
      id: "task-58",
      title: "Document 58: Publish Annual Government Expenditure Report",
      description: "Compile and release financial statements detailing national government spending.",
      date: "21-05-2025",
      completed: true,
      dateCompleted: "19-05-2025",
      priority: "high",
    },
    {
      id: "task-59",
      title: "Document 59: Process International Treaty Documentation",
      description: "Review and file official agreements signed between the national government and foreign entities.",
      date: "24-05-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "medium",
    },
    {
      id: "task-60",
      title: "Document 60: Review Electoral Records for Accuracy",
      description: "Ensure all voter registration and election results are correctly recorded in the government database.",
      date: "27-05-2025",
      completed: true,
      dateCompleted: "25-05-2025",
      priority: "low",
    },
    {
      id: "task-61",
      title: "Document 61: Authenticate Public Government Records",
      description: "Verify the authenticity of archived government documents and ensure compliance with legal standards.",
      date: "30-05-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "high",
    },
    {
      id: "task-62",
      title: "Document 62: Digitize Historical Legislation Documents",
      description: "Scan and categorize historical legislative acts for inclusion in the public digital repository.",
      date: "02-06-2025",
      completed: true,
      dateCompleted: "31-05-2025",
      priority: "medium",
    },
    {
      id: "task-63",
      title: "Document 63: Review Public Access Policies",
      description: "Analyze and update policies governing public access to classified government files.",
      date: "05-06-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "low",
    },
    {
      id: "task-64",
      title: "Document 64: Update Census Data Archives",
      description: "Ensure that the latest national census data is accurately documented and stored securely.",
      date: "08-06-2025",
      completed: true,
      dateCompleted: "06-06-2025",
      priority: "high",
    },
    {
      id: "task-65",
      title: "Document 65: Process Freedom of Information Requests",
      description: "Evaluate and fulfill requests for public government records under transparency laws.",
      date: "11-06-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "medium",
    },
    {
      id: "task-66",
      title: "Document 66: Archive Court Rulings for Public Access",
      description: "Organize and catalog judicial decisions to facilitate legal research and transparency.",
      date: "14-06-2025",
      completed: true,
      dateCompleted: "12-06-2025",
      priority: "low",
    },
    {
      id: "task-67",
      title: "Document 67: Verify Land Registry Updates",
      description: "Cross-check and validate recent changes to government land ownership records.",
      date: "17-06-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "high",
    },
    {
      id: "task-68",
      title: "Document 68: Audit Government Contracts Database",
      description: "Review procurement records to ensure accuracy and compliance with state regulations.",
      date: "20-06-2025",
      completed: true,
      dateCompleted: "18-06-2025",
      priority: "medium",
    },
    {
      id: "task-69",
      title: "Document 69: Update National Security Directives",
      description: "Analyze and revise classified government directives to reflect current policies.",
      date: "23-06-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "low",
    },
    {
      id: "task-70",
      title: "Document 70: Publish Annual Government Expenditure Report",
      description: "Compile and release financial statements detailing national government spending.",
      date: "26-06-2025",
      completed: true,
      dateCompleted: "24-06-2025",
      priority: "high",
    },
    {
      id: "task-71",
      title: "Document 71: Process International Treaty Documentation",
      description: "Review and file official agreements signed between the national government and foreign entities.",
      date: "29-06-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "medium",
    },
    {
      id: "task-72",
      title: "Document 72: Review Electoral Records for Accuracy",
      description: "Ensure all voter registration and election results are correctly recorded in the government database.",
      date: "02-07-2025",
      completed: true,
      dateCompleted: "05-10-2025", // Adjusted manually; you may change to a valid date such as "01-07-2025" if needed.
      priority: "low",
    },
    {
      id: "task-73",
      title: "Document 73: Authenticate Public Government Records",
      description: "Verify the authenticity of archived government documents and ensure compliance with legal standards.",
      date: "05-07-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "high",
    },
    {
      id: "task-74",
      title: "Document 74: Digitize Historical Legislation Documents",
      description: "Scan and categorize historical legislative acts for inclusion in the public digital repository.",
      date: "08-07-2025",
      completed: true,
      dateCompleted: "06-07-2025",
      priority: "medium",
    },
    {
      id: "task-75",
      title: "Document 75: Review Public Access Policies",
      description: "Analyze and update policies governing public access to classified government files.",
      date: "11-07-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "low",
    },
    {
      id: "task-76",
      title: "Document 76: Update Census Data Archives",
      description: "Ensure that the latest national census data is accurately documented and stored securely.",
      date: "14-07-2025",
      completed: true,
      dateCompleted: "12-07-2025",
      priority: "high",
    },
    {
      id: "task-77",
      title: "Document 77: Process Freedom of Information Requests",
      description: "Evaluate and fulfill requests for public government records under transparency laws.",
      date: "17-07-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "medium",
    },
    {
      id: "task-78",
      title: "Document 78: Archive Court Rulings for Public Access",
      description: "Organize and catalog judicial decisions to facilitate legal research and transparency.",
      date: "20-07-2025",
      completed: true,
      dateCompleted: "18-07-2025",
      priority: "low",
    },
    {
      id: "task-79",
      title: "Document 79: Verify Land Registry Updates",
      description: "Cross-check and validate recent changes to government land ownership records.",
      date: "23-07-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "high",
    },
    {
      id: "task-80",
      title: "Document 80: Audit Government Contracts Database",
      description: "Review procurement records to ensure accuracy and compliance with state regulations.",
      date: "26-07-2025",
      completed: true,
      dateCompleted: "24-07-2025",
      priority: "medium",
    },
    {
      id: "task-81",
      title: "Document 81: Update National Security Directives",
      description: "Analyze and revise classified government directives to reflect current policies.",
      date: "29-07-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "low",
    },
    {
      id: "task-82",
      title: "Document 82: Publish Annual Government Expenditure Report",
      description: "Compile and release financial statements detailing national government spending.",
      date: "01-08-2025",
      completed: true,
      dateCompleted: "30-07-2025",
      priority: "high",
    },
    {
      id: "task-83",
      title: "Document 83: Process International Treaty Documentation",
      description: "Review and file official agreements signed between the national government and foreign entities.",
      date: "04-08-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "medium",
    },
    {
      id: "task-84",
      title: "Document 84: Review Electoral Records for Accuracy",
      description: "Ensure all voter registration and election results are correctly recorded in the government database.",
      date: "07-08-2025",
      completed: true,
      dateCompleted: "05-08-2025",
      priority: "low",
    },
    {
      id: "task-85",
      title: "Document 85: Authenticate Public Government Records",
      description: "Verify the authenticity of archived government documents and ensure compliance with legal standards.",
      date: "10-08-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "high",
    },
    {
      id: "task-86",
      title: "Document 86: Digitize Historical Legislation Documents",
      description: "Scan and categorize historical legislative acts for inclusion in the public digital repository.",
      date: "13-08-2025",
      completed: true,
      dateCompleted: "11-08-2025",
      priority: "medium",
    },
    {
      id: "task-87",
      title: "Document 87: Review Public Access Policies",
      description: "Analyze and update policies governing public access to classified government files.",
      date: "16-08-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "low",
    },
    {
      id: "task-88",
      title: "Document 88: Update Census Data Archives",
      description: "Ensure that the latest national census data is accurately documented and stored securely.",
      date: "19-08-2025",
      completed: true,
      dateCompleted: "17-08-2025",
      priority: "high",
    },
    {
      id: "task-89",
      title: "Document 89: Process Freedom of Information Requests",
      description: "Evaluate and fulfill requests for public government records under transparency laws.",
      date: "22-08-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "medium",
    },
    {
      id: "task-90",
      title: "Document 90: Archive Court Rulings for Public Access",
      description: "Organize and catalog judicial decisions to facilitate legal research and transparency.",
      date: "25-08-2025",
      completed: true,
      dateCompleted: "23-08-2025",
      priority: "low",
    },
    {
      id: "task-91",
      title: "Document 91: Verify Land Registry Updates",
      description: "Cross-check and validate recent changes to government land ownership records.",
      date: "28-08-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "high",
    },
    {
      id: "task-92",
      title: "Document 92: Audit Government Contracts Database",
      description: "Review procurement records to ensure accuracy and compliance with state regulations.",
      date: "31-08-2025",
      completed: true,
      dateCompleted: "29-08-2025",
      priority: "medium",
    },
    {
      id: "task-93",
      title: "Document 93: Update National Security Directives",
      description: "Analyze and revise classified government directives to reflect current policies.",
      date: "03-09-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "low",
    },
    {
      id: "task-94",
      title: "Document 94: Publish Annual Government Expenditure Report",
      description: "Compile and release financial statements detailing national government spending.",
      date: "06-09-2025",
      completed: true,
      dateCompleted: "04-09-2025",
      priority: "high",
    },
    {
      id: "task-95",
      title: "Document 95: Process International Treaty Documentation",
      description: "Review and file official agreements signed between the national government and foreign entities.",
      date: "09-09-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "medium",
    },
    {
      id: "task-96",
      title: "Document 96: Review Electoral Records for Accuracy",
      description: "Ensure all voter registration and election results are correctly recorded in the government database.",
      date: "12-09-2025",
      completed: true,
      dateCompleted: "10-09-2025",
      priority: "low",
    },
    {
      id: "task-97",
      title: "Document 97: Authenticate Public Government Records",
      description: "Verify the authenticity of archived government documents and ensure compliance with legal standards.",
      date: "15-09-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "high",
    },
    {
      id: "task-98",
      title: "Document 98: Digitize Historical Legislation Documents",
      description: "Scan and categorize historical legislative acts for inclusion in the public digital repository.",
      date: "18-09-2025",
      completed: true,
      dateCompleted: "16-09-2025",
      priority: "medium",
    },
    {
      id: "task-99",
      title: "Document 99: Review Public Access Policies",
      description: "Analyze and update policies governing public access to classified government files.",
      date: "21-09-2025",
      completed: false,
      dateCompleted: undefined,
      priority: "low",
    },
    {
      id: "task-100",
      title: "Document 100: Update Census Data Archives",
      description: "Ensure that the latest national census data is accurately documented and stored securely.",
      date: "24-09-2025",
      completed: true,
      dateCompleted: "22-09-2025",
      priority: "high",
    },
  ];
};
