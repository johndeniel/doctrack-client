"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  isPast,
  parse,
  isFuture,
} from "date-fns"
import { ChevronLeft, ChevronRight, Calendar, Plus, ArrowLeft } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PriorityBadge } from "@/components/priority-badge"
import type { Task, Priority } from "@/lib/types"
import { TasksContext } from "@/lib/context"

// Function to parse date string from MySQL format to JavaScript Date
const parseDate = (dateString: string): Date => {
  return parse(dateString, "dd-MM-yyyy", new Date())
}

// Function to format JavaScript Date to MySQL format string
const formatDateToString = (date: Date): string => {
  return format(date, "dd-MM-yyyy")
}

// Update the generateDummyTasks function to include tasks from March to August 2025
const generateDummyTasks = (): Task[] => {
  const dummyTasks: Task[] = [
    // Past tasks (some completed, some not)
    {
      id: "task-1",
      title: "Review and approve Q1 financial report",
      description:
        "Verify all financial data, check compliance with regulations, and approve for distribution to stakeholders.",
      date: "10-06-2024", // June 10, 2024
      completed: false,
      priority: "high",
    },
    {
      id: "task-2",
      title: "Process vendor invoices for IT department",
      description: "Validate invoice details, match with purchase orders, and prepare for payment processing.",
      date: "12-06-2024", // June 12, 2024
      completed: false,
      priority: "medium",
    },
    {
      id: "task-3",
      title: "Update company policy documentation",
      description:
        "Incorporate recent changes to remote work policies and distribute updated documents to all departments.",
      date: "13-06-2024", // June 13, 2024
      completed: true,
      priority: "low",
    },

    // Today and upcoming tasks
    {
      id: "task-4",
      title: "Prepare meeting minutes for board review",
      description: "Compile notes from the quarterly board meeting and format according to corporate standards.",
      date: "15-06-2024", // June 15, 2024
      completed: false,
      priority: "medium",
    },
    {
      id: "task-5",
      title: "Submit regulatory compliance documents",
      description: "Complete all required forms and submit to regulatory authorities before the deadline.",
      date: "15-06-2024", // June 15, 2024
      completed: false,
      priority: "high",
    },
    {
      id: "task-6",
      title: "Process employee expense reports",
      description: "Review receipts, validate expense claims, and approve for reimbursement.",
      date: "15-06-2024", // June 15, 2024
      completed: true,
      priority: "low",
    },
    {
      id: "task-7",
      title: "Prepare weekly status report for management",
      description: "Compile project updates, milestone achievements, and outstanding issues for executive review.",
      date: "15-06-2024", // June 15, 2024
      completed: false,
      priority: "medium",
    },
    {
      id: "task-8",
      title: "Review and sign client contract amendments",
      description:
        "Carefully review all changes to contract terms, consult with legal if necessary, and sign approved documents.",
      date: "16-06-2024", // June 16, 2024
      completed: false,
      priority: "high",
    },
    {
      id: "task-9",
      title: "Update product documentation for new release",
      description: "Revise user manuals, technical specifications, and release notes for upcoming product version.",
      date: "18-06-2024", // June 18, 2024
      completed: false,
      priority: "medium",
    },
    {
      id: "task-10",
      title: "Submit final Q2 marketing campaign documents",
      description: "Finalize all creative assets, campaign strategy documents, and budget allocations for approval.",
      date: "22-06-2024", // June 22, 2024
      completed: false,
      priority: "high",
    },
    {
      id: "task-11",
      title: "Compile monthly department performance reports",
      description:
        "Gather KPI data from all departments, create summary visualizations, and prepare executive dashboard.",
      date: "29-06-2024", // June 29, 2024
      completed: false,
      priority: "medium",
    },
    {
      id: "task-12",
      title: "Process venue contracts for company event",
      description: "Review venue terms, negotiate final details, and process contract paperwork for company retreat.",
      date: "05-07-2024", // July 5, 2024
      completed: false,
      priority: "low",
    },
    {
      id: "task-13",
      title: "Prepare quarterly budget planning documents",
      description: "Create budget templates, compile departmental requests, and prepare summary for executive review.",
      date: "10-07-2024", // July 10, 2024
      completed: false,
      priority: "high",
    },

    // 2025 Tasks - March to August
    // March 2025
    {
      id: "task-14",
      title: "Process annual compliance certification documents",
      description:
        "Collect signed compliance forms from all employees, verify completeness, and file according to regulations.",
      date: "05-03-2025", // March 5, 2025
      completed: false,
      priority: "high",
    },
    {
      id: "task-15",
      title: "Review and approve product roadmap documentation",
      description:
        "Evaluate product strategy documents, provide feedback on timeline feasibility, and approve final version.",
      date: "12-03-2025", // March 12, 2025
      completed: false,
      priority: "high",
    },
    {
      id: "task-16",
      title: "Prepare conference presentation materials",
      description: "Create slides, handouts, and supporting documentation for industry conference presentation.",
      date: "20-03-2025", // March 20, 2025
      completed: false,
      priority: "medium",
    },
    {
      id: "task-17",
      title: "Process Q1 financial closing documents",
      description: "Verify all accounting entries, reconcile accounts, and prepare financial statements for review.",
      date: "31-03-2025", // March 31, 2025
      completed: false,
      priority: "high",
    },

    // April 2025
    {
      id: "task-18",
      title: "Prepare marketing campaign approval documents",
      description: "Compile creative briefs, budget allocations, and timeline documents for executive sign-off.",
      date: "08-04-2025", // April 8, 2025
      completed: false,
      priority: "high",
    },
    {
      id: "task-19",
      title: "Process annual employee performance review forms",
      description: "Collect completed review forms from managers, verify completion, and file in employee records.",
      date: "15-04-2025", // April 15, 2025
      completed: false,
      priority: "medium",
    },
    {
      id: "task-20",
      title: "Prepare board meeting documentation package",
      description:
        "Compile agenda, financial reports, strategic initiatives, and supporting materials for board review.",
      date: "22-04-2025", // April 22, 2025
      completed: false,
      priority: "high",
    },

    // May 2025
    {
      id: "task-21",
      title: "Process trade show registration documents",
      description: "Complete exhibitor forms, submit company information, and process payment documentation.",
      date: "05-05-2025", // May 5, 2025
      completed: false,
      priority: "medium",
    },
    {
      id: "task-22",
      title: "Review new product feature specification documents",
      description: "Evaluate technical specifications, provide feedback on feasibility, and approve for development.",
      date: "14-05-2025", // May 14, 2025
      completed: false,
      priority: "high",
    },
    {
      id: "task-23",
      title: "Compile customer feedback survey reports",
      description: "Analyze survey responses, create summary reports, and distribute findings to relevant departments.",
      date: "21-05-2025", // May 21, 2025
      completed: false,
      priority: "medium",
    },
    {
      id: "task-24",
      title: "Process team retreat planning documents",
      description: "Finalize agenda, activities schedule, and accommodation details for department retreat.",
      date: "28-05-2025", // May 28, 2025
      completed: false,
      priority: "low",
    },

    // June 2025
    {
      id: "task-25",
      title: "Review mid-year budget adjustment requests",
      description: "Evaluate departmental budget change requests, assess impact, and prepare recommendation documents.",
      date: "10-06-2025", // June 10, 2025
      completed: false,
      priority: "high",
    },
    {
      id: "task-26",
      title: "Process summer internship onboarding paperwork",
      description: "Collect signed agreements, tax forms, and confidentiality documents from new interns.",
      date: "15-06-2025", // June 15, 2025
      completed: false,
      priority: "medium",
    },
    {
      id: "task-27",
      title: "Prepare Q2 performance review documentation",
      description: "Create performance summary templates, distribute to managers, and set up review schedule.",
      date: "30-06-2025", // June 30, 2025
      completed: false,
      priority: "high",
    },

    // July 2025
    {
      id: "task-28",
      title: "Process company event insurance documentation",
      description: "Complete liability forms, submit participant information, and process insurance certificates.",
      date: "04-07-2025", // July 4, 2025
      completed: false,
      priority: "low",
    },
    {
      id: "task-29",
      title: "Review and approve vendor contract renewals",
      description: "Evaluate service terms, negotiate pricing adjustments, and process renewal documentation.",
      date: "15-07-2025", // July 15, 2025
      completed: false,
      priority: "high",
    },
    {
      id: "task-30",
      title: "Prepare product launch documentation package",
      description:
        "Compile marketing materials, technical specifications, and pricing documents for new product release.",
      date: "22-07-2025", // July 22, 2025
      completed: false,
      priority: "high",
    },

    // August 2025
    {
      id: "task-31",
      title: "Process back-to-school campaign approval documents",
      description: "Review marketing materials, budget allocation, and timeline documents for seasonal campaign.",
      date: "05-08-2025", // August 5, 2025
      completed: false,
      priority: "high",
    },
    {
      id: "task-32",
      title: "Prepare annual security audit documentation",
      description: "Compile system access logs, security incident reports, and compliance certification documents.",
      date: "12-08-2025", // August 12, 2025
      completed: false,
      priority: "high",
    },
    {
      id: "task-33",
      title: "Review fall product line documentation",
      description:
        "Evaluate product specifications, pricing strategy, and marketing approach for upcoming product line.",
      date: "20-08-2025", // August 20, 2025
      completed: false,
      priority: "medium",
    },
    {
      id: "task-34",
      title: "Process team achievement recognition documents",
      description:
        "Prepare certificates, award nominations, and recognition announcements for company-wide distribution.",
      date: "28-08-2025", // August 28, 2025
      completed: false,
      priority: "low",
    },
  ]

  return dummyTasks
}



export default function CalendarBoard() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isViewTasksOpen, setIsViewTasksOpen] = useState(false)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [newTask, setNewTask] = useState<{
    title: string
    description: string
    priority: Priority
  }>({
    title: "",
    description: "",
    priority: "medium",
  })

  // Load dummy data on component mount
  useEffect(() => {
    // Simulate fetching data from MySQL
    const dummyTasks = generateDummyTasks()
    setTasks(dummyTasks)

    // Store tasks in localStorage for access from other pages
    localStorage.setItem("calendarTasks", JSON.stringify(dummyTasks))
  }, [])

  // Get days of current month
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Create a 7-column grid with empty cells for proper alignment
  const startDay = monthStart.getDay() // 0 for Sunday, 1 for Monday, etc.
  const endDay = 6 - monthEnd.getDay() // Empty cells at the end

  // Add empty cells at the start
  const calendarDays = [...Array(startDay).fill(null), ...monthDays, ...Array(endDay).fill(null)]

  // Group days into weeks (rows)
  const weeks = []
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7))
  }

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  // Update the handleDayClick function to always open the view tasks dialog first
  const handleDayClick = (day: Date | null) => {
    if (day) {
      setSelectedDate(day)
      setIsViewTasksOpen(true)
    }
  }

  const handleAddTaskClick = () => {
    setIsViewTasksOpen(false)
    setIsAddTaskOpen(true)
    // Reset the new task form
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
    })
  }

  const handleBackToTasks = () => {
    setIsAddTaskOpen(false)
    setIsViewTasksOpen(true)
  }

  const handleAddTask = () => {
    if (selectedDate && newTask.title.trim()) {
      const newTaskItem: Task = {
        id: `task-${Date.now()}`, // Generate a unique ID
        title: newTask.title,
        description: newTask.description,
        date: formatDateToString(selectedDate),
        completed: false, // Always set to false for new tasks
        priority: newTask.priority,
      }

      // Add the new task to the tasks array
      const updatedTasks = [...tasks, newTaskItem]
      setTasks(updatedTasks)

      // Update localStorage
      localStorage.setItem("calendarTasks", JSON.stringify(updatedTasks))

      // Close the add task dialog and reset the form
      setIsAddTaskOpen(false)
      setIsViewTasksOpen(true)
      setNewTask({
        title: "",
        description: "",
        priority: "medium",
      })
    }
  }

  // Navigate to task detail page
  const handleTaskClick = (taskId: string) => {
    setIsViewTasksOpen(false)
    router.push(`/task-info?id=${taskId}`)
  }

  // Check if a task's date is the same as the given day
  const isTaskOnDay = (task: Task, day: Date): boolean => {
    const taskDate = parseDate(task.date)
    return isSameDay(taskDate, day)
  }

  const getDayColor = (day: Date) => {
    // Get tasks for this day
    const dayTasks = tasks.filter((task) => isTaskOnDay(task, day))

    if (dayTasks.length === 0) return ""

    // Check if any tasks are overdue (past due date and not completed)
    const hasOverdueTasks = dayTasks.some((task) => {
      const taskDate = parseDate(task.date)
      return isPast(taskDate) && !isSameDay(taskDate, new Date()) && !task.completed
    })

    if (hasOverdueTasks) return "bg-red-50 dark:bg-red-950/10"

    // If there are tasks for today or future, show green
    return "bg-green-50 dark:bg-green-950/10"
  }

  const getTasksForDay = (day: Date) => {
    return tasks.filter((task) => isTaskOnDay(task, day))
  }

  const isCurrentOrFuture = (day: Date) => {
    return isToday(day) || isFuture(day)
  }

  return (
    <TasksContext.Provider value={{ tasks, setTasks }}>
      <TooltipProvider>
        <div className="container mx-auto py-6 px-4 h-screen flex flex-col">
          <div className="flex flex-col space-y-4 flex-grow">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-xl font-medium tracking-tight">Calendar</h1>
                <p className="text-muted-foreground text-xs mt-0.5">View your tasks by date</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={handlePreviousMonth} className="h-7 w-7">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-sm font-medium px-2 min-w-[120px] text-center">
                  {format(currentDate, "MMMM yyyy")}
                </h2>
                <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-7 w-7">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Card className="overflow-hidden border-none shadow-sm flex-grow">
              <CardContent className="p-0 h-full flex flex-col">
                {/* Calendar header - days of week */}
                <div className="grid grid-cols-7 border-b border-border/40">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center text-xs font-medium py-2 text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 flex-grow">
                  {weeks.flat().map((day, index) => (
                    <div
                      key={index}
                      className={cn(
                        "border-b border-r border-border/40 relative hover:bg-muted/5",
                        index % 7 === 0 && "border-l",
                        day ? "cursor-pointer transition-colors" : "bg-muted/5",
                        isCurrentOrFuture(day) && "hover:ring-1 hover:ring-primary/10",
                      )}
                      onClick={() => day && handleDayClick(day)}
                    >
                      {day && (
                        <div
                          className={cn(
                            "h-full w-full flex flex-col p-1.5 transition-colors",
                            getDayColor(day),
                            !isSameMonth(day, currentDate) && "opacity-40",
                          )}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span
                              className={cn(
                                "text-xs font-medium h-5 w-5 flex items-center justify-center rounded-full",
                                isToday(day) && "bg-primary text-primary-foreground",
                              )}
                            >
                              {format(day, "d")}
                            </span>
                            <div className="flex items-center gap-1">
                              {getTasksForDay(day).length > 0 && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-[9px] text-muted-foreground font-medium bg-muted/30 rounded-full px-1.5 py-0.5 hover:bg-muted/50 transition-colors">
                                      {getTasksForDay(day).length}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-xs">
                                    {getTasksForDay(day).length} {getTasksForDay(day).length === 1 ? "task" : "tasks"}{" "}
                                    on this day
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </div>
                          <div className="space-y-0.5 mt-0.5 overflow-hidden">
                            {getTasksForDay(day)
                              .slice(0, 3)
                              .map((task) => (
                                <Tooltip key={task.id}>
                                  <TooltipTrigger asChild>
                                    <div
                                      className={cn(
                                        "text-[9px] px-1 py-0.5 rounded-sm bg-background/80 flex items-center gap-1",
                                        task.completed ? "text-muted-foreground line-through" : "",
                                        task.priority === "high"
                                          ? "border-l-2 border-l-red-400"
                                          : task.priority === "medium"
                                            ? "border-l-2 border-l-amber-400"
                                            : "border-l-2 border-l-blue-400",
                                      )}
                                    >
                                      <div className="truncate">{task.title}</div>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="right"
                                    className="max-w-[280px] p-3 shadow-md border border-border/30"
                                  >
                                    <div className="space-y-2 relative">
                                      <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2 pr-2">
                                          <div
                                            className={cn(
                                              "w-1 h-4 rounded-sm shrink-0",
                                              task.priority === "high"
                                                ? "bg-red-400"
                                                : task.priority === "medium"
                                                  ? "bg-amber-400"
                                                  : "bg-blue-400",
                                            )}
                                          />
                                          <h4 className="text-xs font-medium leading-tight">{task.title}</h4>
                                        </div>
                                        <PriorityBadge priority={task.priority} />
                                      </div>

                                      {task.description && (
                                        <p className="text-[10px] text-muted-foreground leading-normal pt-1 border-t border-border/10">
                                          {task.description}
                                        </p>
                                      )}

                                      <div className="flex items-center justify-between">
                                        <p className="text-[10px] text-muted-foreground">
                                          Due: {format(parseDate(task.date), "MMM d, yyyy")}
                                        </p>

                                        {task.completed && (
                                          <span className="text-[9px] bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-sm border border-green-100 dark:border-green-900/30">
                                            Completed
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                            {getTasksForDay(day).length > 3 && (
                              <div className="text-[8px] text-muted-foreground px-1 flex items-center gap-0.5">
                                <span>+{getTasksForDay(day).length - 3} more</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-3 items-center justify-center md:justify-start">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-sm bg-green-50 border border-green-100"></div>
                <span>Tasks</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-sm bg-red-50 border border-red-100"></div>
                <span>Overdue</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-[8px] text-primary-foreground">
                  {format(new Date(), "d")}
                </div>
                <span>Today</span>
              </div>
            </div>
          </div>

          {/* View Tasks Dialog */}
          <Dialog open={isViewTasksOpen} onOpenChange={setIsViewTasksOpen}>
            <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
              <DialogHeader className="px-4 pt-4 pb-3 border-b border-border/20">
                <div className="space-y-1">
                  <DialogTitle className="text-sm font-medium">
                    {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Tasks"}
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <Calendar className="h-3 w-3 mr-1.5 opacity-70" />
                    {selectedDate ? getTasksForDay(selectedDate).length ?? 0 : 0}{" "}
                    {(selectedDate ? getTasksForDay(selectedDate).length : 0) === 1 ? "task" : "tasks"}
                  </p>
                </div>
              </DialogHeader>

              <div>
                {selectedDate && getTasksForDay(selectedDate).length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground flex flex-col items-center gap-3">
                    <div className="bg-muted/10 p-3 rounded-full">
                      <Calendar className="h-5 w-5 opacity-40" />
                    </div>
                    <p className="text-xs font-medium">No tasks for this day</p>
                    <p className="text-[10px] text-muted-foreground max-w-[200px]">
                      Tasks you add for this date will appear here
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[300px] pr-4 overflow-y-auto">
                    <div className="px-4 py-2 space-y-2">
                      {selectedDate &&
                        getTasksForDay(selectedDate).map((task) => (
                          <div
                            key={task.id}
                            className={cn(
                              "py-2.5 px-3.5 rounded-md transition-all cursor-pointer relative",
                              "border border-transparent hover:bg-muted/5 hover:border-border/30 hover:shadow-sm",
                              task.priority === "high"
                                ? "border-l-2 border-l-red-400"
                                : task.priority === "medium"
                                  ? "border-l-2 border-l-amber-400"
                                  : "border-l-2 border-l-blue-400",
                            )}
                            onClick={() => handleTaskClick(task.id)}
                          >
                            {/* Position priority badge in the top right corner */}
                            <div className="absolute top-2 right-3">
                              <PriorityBadge priority={task.priority} />
                            </div>

                            <div className="space-y-2 pr-16">
                              {" "}
                              {/* Add right padding to make room for the badge */}
                              {/* Task title */}
                              <h4
                                className={cn(
                                  "text-xs font-medium leading-tight",
                                  task.completed && "line-through text-muted-foreground",
                                )}
                              >
                                {task.title}
                              </h4>
                              {/* Task description if available */}
                              {task.description && (
                                <p className="text-[10px] text-muted-foreground leading-normal line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                              {/* Task metadata row */}
                              <div className="flex items-center justify-between pt-1">
                                <p className="text-[10px] text-muted-foreground">
                                  {format(parseDate(task.date), "MMM d, yyyy")}
                                </p>

                                {task.completed && (
                                  <span className="text-[9px] bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-sm border border-green-100 dark:border-green-900/30">
                                    Completed
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                )}
              </div>

              <DialogFooter className="px-4 py-3 border-t border-border/20 flex justify-between">
                <Button variant="ghost" size="sm" onClick={() => setIsViewTasksOpen(false)} className="text-xs h-8">
                  Close
                </Button>
                {selectedDate && isCurrentOrFuture(selectedDate) && (
                  <Button size="sm" onClick={handleAddTaskClick} className="text-xs h-8 px-3 shadow-sm">
                    <Plus className="h-3 w-3 mr-1.5" /> Add Task
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Task Dialog */}
          <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
            <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
              <DialogHeader className="px-4 pt-4 pb-2">
                <div className="flex items-center">
                  <Button variant="ghost" size="icon" onClick={handleBackToTasks} className="h-7 w-7 mr-2">
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </Button>
                  <div>
                    <DialogTitle className="text-sm font-medium">
                      Add Task for {selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""}
                    </DialogTitle>
                  </div>
                </div>
              </DialogHeader>

              <div className="px-4 py-3 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs">
                    Task Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Enter task description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="text-xs min-h-[60px] resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="priority" className="text-xs">
                    Priority
                  </Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value: Priority) => setNewTask({ ...newTask, priority: value })}
                  >
                    <SelectTrigger id="priority" className="h-8 text-xs">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high" className="text-xs">
                        <span className="text-red-600 dark:text-red-400">High Priority</span>
                      </SelectItem>
                      <SelectItem value="medium" className="text-xs">
                        <span className="text-amber-600 dark:text-amber-400">Medium Priority</span>
                      </SelectItem>
                      <SelectItem value="low" className="text-xs">
                        <span className="text-blue-600 dark:text-blue-400">Low Priority</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="px-4 py-3 border-t border-border/40">
                <Button variant="ghost" size="sm" onClick={() => setIsAddTaskOpen(false)} className="text-xs h-7">
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAddTask} disabled={!newTask.title.trim()} className="text-xs h-7">
                  Add Task
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </TooltipProvider>
    </TasksContext.Provider>
  )
}

