"use client"

import type React from "react"
import { useState, useEffect, JSX } from "react"
import { useRouter } from "next/navigation"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { PriorityBadge } from "@/components/priority-badge"
import { StatusBadge } from "@/components/status-badge"
import { TaskDialog } from "@/app/calendar/components/task-dialog"
import { AddTaskDialog } from "@/app/calendar/components/add-task-dialog"
import { TasksContext } from "@/lib/task-context"
import {
  parseDate,
  formatDateToString,
  getCompletionStatus,
  isTaskOnDay,
  isCurrentOrFuture,
} from "@/lib/calendar-utils"
import type { Task } from "@/lib/types"
import { fetchTask } from "@/server/queries/fetch-task"
import { Separator } from "@/components/ui/separator"

/**
 * Main CalendarBoard component.
 * Displays a monthly calendar with tasks and provides task management functionality.
 */
export default function CalendarBoard(): JSX.Element {
  const router = useRouter()

  // State management for current date, tasks, and dialogs
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isViewTasksOpen, setIsViewTasksOpen] = useState<boolean>(false)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState<boolean>(false)

  // Load sample tasks on component mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const sampleTasks = await fetchTask()
        const tasksArray = Array.isArray(sampleTasks) ? sampleTasks : []
        setTasks(tasksArray)
        localStorage.setItem("calendarTasks", JSON.stringify(tasksArray))
      } catch (error) {
        console.error("Failed to fetch tasks:", error)
        setTasks([])
      }
    }
    loadTasks()
  }, [])

  // Calendar date calculations
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Create a 7-column grid by adding empty cells for alignment
  const startDay = monthStart.getDay() // 0 for Sunday, etc.
  const endDay = 6 - monthEnd.getDay() // Empty cells at the end
  const calendarDays = [...Array(startDay).fill(null), ...monthDays, ...Array(endDay).fill(null)]

  // Group days into weeks (rows)
  const weeks = []
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7))
  }

  // Handle month navigation
  const handlePreviousMonth = (): void => {
    setCurrentDate(subMonths(currentDate, 1))
  }
  const handleNextMonth = (): void => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  // Handle clicking on a day to view its tasks
  const handleDayClick = (day: Date | null): void => {
    if (day) {
      setSelectedDate(day)
      setIsViewTasksOpen(true)
    }
  }

  // Handle switching to add task dialog
  const handleAddTaskClick = (): void => {
    setIsViewTasksOpen(false)
    setIsAddTaskOpen(true)
  }




  // Handle clicking on a task to view its details
  const handleTaskClick = (taskId: string): void => {
    setIsViewTasksOpen(false)
    router.push(`/task-info?id=${taskId}`)
  }

  // Get tasks scheduled for a specific day
  const getTasksForDay = (day: Date): Task[] => {
    return tasks.filter((task) => isTaskOnDay(task, day))
  }

  // Determine the background color for a day based on tasks status
  const getDayColor = (day: Date): string => {
    const dayTasks = getTasksForDay(day)
    if (dayTasks.length === 0) return ""
    const hasOverdueTasks = dayTasks.some((task) => getCompletionStatus(task) === "overdue")
    if (hasOverdueTasks) return "bg-[hsl(var(--status-overdue-bg))] calendar-day-highlight"
    return "bg-[hsl(var(--status-active-bg))] calendar-day-highlight"
  }

  // Custom tooltip styles
  const tooltipStyles = {
    content: "bg-background text-foreground border border-border shadow-sm",
    taskTooltip: "max-w-[300px] p-0 overflow-hidden bg-background text-foreground border border-border shadow-sm",
  }

  // Update the handleAddTask function
  const handleAddTasks = (newTask: Omit<Task, "id">): void => {
    if (selectedDate && newTask.title.trim()) {
      const newTaskItem: Task = {
        id: `task-${Date.now()}`, // Generate unique ID
        ...newTask,
        dueDate: formatDateToString(selectedDate),
      }
      const updatedTasks = [...tasks, newTaskItem]
      setTasks(updatedTasks)
      localStorage.setItem("calendarTasks", JSON.stringify(updatedTasks))
      setIsAddTaskOpen(false)
      setIsViewTasksOpen(true)
    }
  }

  return (
    <TasksContext.Provider value={{ tasks, setTasks }}>
      <TooltipProvider>
        <div className="container mx-auto py-12 px-4 h-screen flex flex-col">
          <div className="flex flex-col space-y-4 flex-grow">
            {/* Calendar header with title and month navigation */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-xl font-medium tracking-tight">Calendar</h1>
                <p className="text-muted-foreground text-xs mt-0.5">View your Documents by date</p>
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

            {/* Calendar grid */}
            <Card className="h-[690px] overflow-hidden border-none shadow-sm">
              <CardContent className="h-[690px] p-0 flex flex-col">
                {/* Calendar header: Days of week */}
                <div className="grid grid-cols-7 border-b border-border/40">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center text-xs font-medium py-2 text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid with days */}
                <div className="grid grid-cols-7 flex-grow">
                  {weeks.flat().map((day, index) => (
                    <div
                      key={index}
                      className={cn(
                        "border-b border-r border-border/40 relative hover:bg-muted/5",
                        index % 7 === 0 && "border-l",
                        day ? "cursor-pointer transition-colors" : "bg-muted/5",
                        isCurrentOrFuture(day) && "hover:ring-1 hover:ring-primary/10"
                      )}
                      onClick={() => day && handleDayClick(day)}
                    >
                      {day && (
                        <div
                          className={cn(
                            "h-full w-full flex flex-col p-1.5 transition-colors",
                            getDayColor(day),
                            !isSameMonth(day, currentDate) && "opacity-40"
                          )}
                        >
                          {/* Day header: Day number and task count tooltip */}
                          <div className="flex justify-between items-center mb-1">
                            <span
                              className={cn(
                                "text-xs font-medium h-5 w-5 flex items-center justify-center rounded-full",
                                isToday(day) && "bg-primary text-primary-foreground"
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
                                  <TooltipContent side="top" className={tooltipStyles.content}>
                                    <div className="text-xs p-2">
                                      {getTasksForDay(day).length} {getTasksForDay(day).length === 1 ? "task" : "tasks"} on this day
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </div>

                          {/* Task previews for each day */}
                          <div className="space-y-0.5 mt-0.5 overflow-hidden">
                            {getTasksForDay(day)
                              .slice(0, 3)
                              .map((task) => {
                                // Determine completion using dateCompleted check
                                const isCompleted = task.dateCompleted !== undefined
                                return (
                                  <Tooltip key={task.id}>
                                    <TooltipTrigger asChild>
                                      <div
                                        className={cn(
                                          "text-[9px] px-1 py-0.5 rounded-sm bg-background/80 flex items-center gap-1",
                                          isCompleted && "text-muted-foreground line-through",
                                          task.priority === "high"
                                            ? "border-l-2 border-l-red-400"
                                            : task.priority === "medium"
                                              ? "border-l-2 border-l-amber-400"
                                              : "border-l-2 border-l-blue-400"
                                        )}
                                      >
                                        <div className="truncate">{task.title}</div>
                                      </div>
                                    </TooltipTrigger>

                                    {/* Tooltip with task details */}
                                    <TooltipContent side="right" className={tooltipStyles.taskTooltip}>
                                      <div className="p-3">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                          <div className="flex items-center gap-2">
                                            <div
                                              className={cn(
                                                "w-1 h-4 rounded-sm shrink-0",
                                                task.priority === "high"
                                                  ? "bg-red-400"
                                                  : task.priority === "medium"
                                                    ? "bg-amber-400"
                                                    : "bg-blue-400"
                                              )}
                                            />
                                            <h4
                                              className={cn(
                                                "text-xs font-bold leading-tight",
                                                isCompleted && "line-through text-muted-foreground"
                                              )}
                                              title={task.title}
                                            >
                                              {task.title}
                                            </h4>
                                          </div>
                                          <PriorityBadge priority={task.priority} />
                                        </div>

                                        {task.description && (
                                          <>
                                            <p
                                              className={cn(
                                                "text-[10px] text-muted-foreground leading-normal mb-2",
                                                isCompleted && "line-through"
                                              )}
                                              title={task.description}
                                            >
                                              {task.description}
                                            </p>
                                            <div className="px-0">
                                              <Separator className="my-2.5 w-full bg-gradient-to-r from-border/10 via-border/80 to-border/10" />
                                            </div>
                                          </>
                                        )}

                                        <div className="flex items-center justify-between text-[10px]">
                                          {isCompleted ? (
                                            <p className="text-muted-foreground font-medium">
                                              Completed on{" "}
                                              {format(parseDate(task.dateCompleted || task.dueDate), "MMMM d, yyyy")}
                                            </p>
                                          ) : (
                                            <p className="text-muted-foreground font-medium">
                                              Due on {format(parseDate(task.dueDate), "MMMM d, yyyy")}
                                            </p>
                                          )}
                                          <StatusBadge task={task} />
                                        </div>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                )
                              })}
                            {/* Indicator for additional tasks */}
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

            {/* Calendar legend */}
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2 h-2 rounded-sm bg-[hsl(var(--status-active-bg))] border border-[hsl(var(--status-active-border))]"></div>
                  <span>Tasks</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2 h-2 rounded-sm bg-[hsl(var(--status-overdue-bg))] border border-[hsl(var(--status-overdue-border))]"></div>
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
          </div>

          {/* Task Dialog Component */}
          <TaskDialog
            isOpen={isViewTasksOpen}
            onOpenChange={setIsViewTasksOpen}
            selectedDate={selectedDate}
            tasks={tasks}
            onAddTaskClick={handleAddTaskClick}
            onTaskClick={handleTaskClick}
            isCurrentOrFuture={isCurrentOrFuture}
          />

          {/* Add Task Dialog Component */}
          <AddTaskDialog
              open={isAddTaskOpen}
              onOpenChange={setIsAddTaskOpen}
              onAddTask={handleAddTasks}
              selectedDate={selectedDate || new Date()}
            />
        </div>
      </TooltipProvider>
    </TasksContext.Provider>
  )
}
