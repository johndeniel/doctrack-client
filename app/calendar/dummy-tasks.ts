import type { Task } from "@/lib/types"

/**
 * Generates dummy tasks for demonstration purposes
 * Includes a variety of tasks with different priorities, completion statuses, and dates
 * @returns Array of Task objects
 */
export const generateDummyTasks = (): Task[] => {
  const dummyTasks: Task[] = [
// Past tasks (some completed, some not)
{
  id: "task-1",
  title: "Review and approve Q1 financial report",
  description:
    "Verify all financial data, check compliance with regulations, and approve for distribution to stakeholders.",
  dueDate: "10-06-2024", // June 10, 2024
  completed: false,
  priority: "high",
},
{
  id: "task-2",
  title: "Process vendor invoices for IT department",
  description: "Validate invoice details, match with purchase orders, and prepare for payment processing.",
  dueDate: "12-06-2024", // June 12, 2024
  completed: false,
  priority: "medium",
},
{
  id: "task-3",
  title: "Update company policy documentation",
  description:
    "Incorporate recent changes to remote work policies and distribute updated documents to all departments.",
  dueDate: "13-06-2024", // June 13, 2024
  completed: true,
  dateCompleted: "12-06-2024", // Completed on time (before due date)
  priority: "low",
},

// Today and upcoming tasks
{
  id: "task-4",
  title: "Prepare meeting minutes for board review",
  description: "Compile notes from the quarterly board meeting and format according to corporate standards.",
  dueDate: "15-06-2024", // June 15, 2024
  completed: false,
  priority: "medium",
},
{
  id: "task-5",
  title: "Submit regulatory compliance documents",
  description: "Complete all required forms and submit to regulatory authorities before the deadline.",
  dueDate: "15-06-2024", // June 15, 2024
  completed: false,
  priority: "high",
},
{
  id: "task-6",
  title: "Process employee expense reports",
  description: "Review receipts, validate expense claims, and approve for reimbursement.",
  dueDate: "15-06-2024", // June 15, 2024
  completed: true,
  dateCompleted: "15-06-2024", // Completed on time (on due date)
  priority: "low",
},

// Additional tasks omitted for brevity
// The full list would include all the tasks from the original code

// Example of a completed task with late completion
{
  id: "task-35",
  title: "Update vendor payment processing documentation",
  description: "Revise payment procedures, update approval workflows, and distribute to finance team.",
  dueDate: "01-03-2025", // March 1, 2025
  completed: true,
  dateCompleted: "05-03-2025", // Completed late (after due date)
  priority: "medium",
},

// Example of a completed task with early completion
{
  id: "task-36",
  title: "Process quarterly tax documentation",
  description: "Prepare tax forms, verify calculations, and submit to accounting department.",
  dueDate: "15-03-2025", // March 15, 2025
  completed: true,
  dateCompleted: "10-03-2025", // Completed early (before due date)
  priority: "high",
},
]

  return dummyTasks
}

