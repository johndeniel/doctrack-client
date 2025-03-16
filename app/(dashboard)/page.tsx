"use client"

import { useState, useEffect } from "react"
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
} from "date-fns"
import { ChevronLeft, ChevronRight, Calendar, Info } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Interface for tasks as they would come from MySQL
interface Task {
  id: string
  title: string
  date: string // Format: "DD-MM-YYYY"
  completed: boolean
  description?: string
}

// Function to parse date string from MySQL format to JavaScript Date
const parseDate = (dateString: string): Date => {
  return parse(dateString, "dd-MM-yyyy", new Date())
}

// Generate dummy data with explicit dates (simulating MySQL data)
const generateDummyTasks = (): Task[] => {
  const dummyTasks: Task[] = [
    // Past tasks (some completed, some not)
    {
      id: "task-1",
      title: "Submit quarterly financial report and analysis to the management team",
      description: "Include all financial metrics and KPIs from Q1",
      date: "10-06-2024", // June 10, 2024
      completed: false,
    },
    {
      id: "task-2",
      title: "Review project proposal from the marketing department",
      date: "12-06-2024", // June 12, 2024
      completed: false,
    },
    {
      id: "task-3",
      title: "Update team documentation and knowledge base with new procedures",
      date: "13-06-2024", // June 13, 2024
      completed: true,
    },

    // Today and upcoming tasks
    {
      id: "task-4",
      title: "Team meeting with department heads to discuss quarterly goals",
      description: "Prepare agenda and meeting notes",
      date: "15-06-2024", // June 15, 2024
      completed: false,
    },
    {
      id: "task-5",
      title: "Follow-up on client feedback for the new feature release",
      description: "Address concerns raised in the last meeting",
      date: "15-06-2024", // June 15, 2024
      completed: false,
    },
    {
      id: "task-6",
      title: "Review and approve expense reports from team members",
      date: "15-06-2024", // June 15, 2024
      completed: true,
    },
    {
      id: "task-7",
      title: "Prepare weekly status report for management",
      date: "15-06-2024", // June 15, 2024
      completed: false,
    },
    {
      id: "task-8",
      title: "Client call with ABC Corporation to discuss new contract terms",
      date: "16-06-2024", // June 16, 2024
      completed: false,
    },
    {
      id: "task-9",
      title: "Design review for the new product landing page with the UX team",
      description: "Focus on mobile responsiveness and accessibility",
      date: "18-06-2024", // June 18, 2024
      completed: false,
    },
    {
      id: "task-10",
      title: "Project deadline: Submit final deliverables for the Q2 marketing campaign",
      date: "22-06-2024", // June 22, 2024
      completed: false,
    },
    {
      id: "task-11",
      title: "Monthly report on team performance and project status",
      date: "29-06-2024", // June 29, 2024
      completed: false,
    },
    {
      id: "task-12",
      title: "Team building event planning and coordination with HR department",
      description: "Book venue and arrange catering",
      date: "05-07-2024", // July 5, 2024
      completed: false,
    },
    {
      id: "task-13",
      title: "Quarterly budget planning meeting",
      date: "10-07-2024", // July 10, 2024
      completed: false,
    },
  ]

  return dummyTasks
}

export default function CalendarBoard() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isViewTasksOpen, setIsViewTasksOpen] = useState(false)

  // Load dummy data on component mount
  useEffect(() => {
    // Simulate fetching data from MySQL
    setTasks(generateDummyTasks())
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

  const handleDayClick = (day: Date | null) => {
    if (day) {
      setSelectedDate(day)
      setIsViewTasksOpen(true)
    }
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

  return (
    <TooltipProvider>
      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-2xl font-medium tracking-tight">Calendar</h1>
              <p className="text-muted-foreground text-sm mt-1">View your tasks by date</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={handlePreviousMonth} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-sm font-medium px-2 min-w-[140px] text-center">{format(currentDate, "MMMM yyyy")}</h2>
              <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border-none shadow-sm">
            <CardContent className="p-0">
              {/* Calendar header - days of week */}
              <div className="grid grid-cols-7 border-b">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center text-xs font-medium py-3 text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7">
                {weeks.flat().map((day, index) => (
                  <div
                    key={index}
                    className={cn(
                      "min-h-[110px] border-b border-r relative",
                      index % 7 === 0 && "border-l",
                      day ? "cursor-pointer transition-colors" : "bg-muted/5",
                    )}
                    onClick={() => day && handleDayClick(day)}
                  >
                    {day && (
                      <div
                        className={cn(
                          "h-full w-full flex flex-col p-2 transition-colors",
                          getDayColor(day),
                          !isSameMonth(day, currentDate) && "opacity-40",
                        )}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span
                            className={cn(
                              "text-xs font-medium h-6 w-6 flex items-center justify-center rounded-full",
                              isToday(day) && "bg-primary text-primary-foreground",
                            )}
                          >
                            {format(day, "d")}
                          </span>
                          {getTasksForDay(day).length > 0 && (
                            <Badge variant="outline" className="text-[10px] h-5 bg-background/80 font-normal">
                              {getTasksForDay(day).length}
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1 mt-1 overflow-hidden">
                          {getTasksForDay(day)
                            .slice(0, 2)
                            .map((task) => (
                              <Tooltip key={task.id}>
                                <TooltipTrigger asChild>
                                  <div
                                    className={cn(
                                      "text-[10px] px-1.5 py-1 rounded-sm bg-background/80",
                                      task.completed ? "text-muted-foreground line-through" : "",
                                    )}
                                  >
                                    <div className="truncate">{task.title}</div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-[250px] p-3 text-xs">
                                  <p className="font-medium">{task.title}</p>
                                  {task.description && <p className="text-muted-foreground mt-1">{task.description}</p>}
                                  <p className="text-muted-foreground mt-1">Date: {task.date}</p>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                          {getTasksForDay(day).length > 2 && (
                            <div className="text-[10px] text-muted-foreground px-1.5 flex items-center gap-1">
                              <Info className="h-2.5 w-2.5" />
                              <span>+{getTasksForDay(day).length - 2} more</span>
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

          <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-3 h-3 rounded-sm bg-green-50 border border-green-100"></div>
              <span>Tasks scheduled</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-3 h-3 rounded-sm bg-red-50 border border-red-100"></div>
              <span>Overdue tasks</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground">
                {format(new Date(), "d")}
              </div>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* View Tasks Dialog */}
        <Dialog open={isViewTasksOpen} onOpenChange={setIsViewTasksOpen}>
          <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden">
            <DialogHeader className="px-6 pt-6 pb-2">
              <div className="space-y-1">
                <DialogTitle className="text-base font-medium">
                  {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Tasks"}
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  {selectedDate && getTasksForDay(selectedDate).length} tasks
                </p>
              </div>
            </DialogHeader>

            <div>
              {selectedDate && getTasksForDay(selectedDate).length === 0 ? (
                <div className="text-center py-10 text-muted-foreground flex flex-col items-center gap-2">
                  <Calendar className="h-8 w-8 opacity-20" />
                  <p className="text-sm">No tasks for this day</p>
                </div>
              ) : (
                <ScrollArea className="h-[350px] pr-4 overflow-y-auto">
                  <div className="px-6 py-2 space-y-2">
                    {selectedDate &&
                      getTasksForDay(selectedDate).map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            "py-3 px-4 rounded-md transition-colors",
                            task.completed ? "bg-muted/30" : "hover:bg-muted/10",
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                "h-2 w-2 rounded-full mt-1.5 flex-shrink-0",
                                task.completed ? "bg-green-400" : "bg-blue-400",
                              )}
                            />
                            <div className="space-y-1 flex-1 min-w-0">
                              <h4
                                className={cn(
                                  "text-sm break-words",
                                  task.completed && "line-through text-muted-foreground",
                                )}
                              >
                                {task.title}
                              </h4>
                              {task.description && <p className="text-xs text-muted-foreground">{task.description}</p>}
                              <p className="text-xs text-muted-foreground">Due: {task.date}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            <DialogFooter className="px-6 py-4 border-t">
              <Button variant="ghost" size="sm" onClick={() => setIsViewTasksOpen(false)} className="text-xs">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

