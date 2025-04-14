"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo, useRef, useTransition } from "react"
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
import { Separator } from "@/components/ui/separator"
import type { Task } from "@/lib/types"
import {
  parseDate,
  formatDateToString,
  getCompletionStatus,
  isCurrentOrFuture,
} from "@/lib/calendar-utils"
import { fetchTasks } from "@/server/queries/fetch-task"

/**
 * Main CalendarBoard component.
 * Displays a monthly calendar with tasks and provides task management functionality.
 * Optimized for performance with memoization, efficient rendering, and proper cleanup.
 */
export default function CalendarBoard(): React.ReactElement {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // Refs for tracking mounted state and data loading
  const isMountedRef = useRef(true)
  const loadingRef = useRef(false)

  // State management for current date, tasks, and dialogs
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isViewTasksOpen, setIsViewTasksOpen] = useState<boolean>(false)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Load tasks on component mount with optimized fetch handling
  useEffect(() => {
    // Prevent duplicate fetches
    if (loadingRef.current) return
    
    loadingRef.current = true
    isMountedRef.current = true
    setIsLoading(true)
    
    const loadTasks = async () => {
      try {
        // AbortController for timeout capability
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout
        
        const fetchedTasks = await fetchTasks();
        clearTimeout(timeoutId);
        
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          const tasksArray = Array.isArray(fetchedTasks) ? fetchedTasks : [];
          setTasks(tasksArray);
          
          // Store in localStorage with size limit consideration
          if (tasksArray.length < 1000) { // Only cache if reasonable size
            try {
              localStorage.setItem("calendarTasks", JSON.stringify(tasksArray));
            } catch (storageError) {
              console.warn("Failed to cache tasks in localStorage:", storageError);
            }
          }
        }
      } catch (error) {
        if (isMountedRef.current) {
          console.error("Failed to fetch tasks:", error);
          setError(error instanceof Error ? error.message : "Failed to load tasks");
          
          // Try to load from cache as fallback
          try {
            const cachedData = localStorage.getItem("calendarTasks");
            if (cachedData) {
              const parsedCache = JSON.parse(cachedData) as Task[];
              setTasks(parsedCache);
              console.info("Loaded tasks from cache due to fetch failure");
            } else {
              setTasks([]);
            }
          } catch (cacheError) {
            console.warn("Failed to load cached tasks:", cacheError);
            setTasks([]);
          }
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          loadingRef.current = false;
        }
      }
    };
    
    loadTasks();
    
    // Cleanup to prevent state updates after unmount
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Memoized calendar computations to avoid recalculations
  const calendarData = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Create a 7-column grid by adding empty cells for alignment
    const startDay = monthStart.getDay(); // 0 for Sunday, etc.
    const endDay = 6 - monthEnd.getDay(); // Empty cells at the end
    const calendarDays = [
      ...Array(startDay).fill(null), 
      ...monthDays, 
      ...Array(endDay).fill(null)
    ];
    
    // Group days into weeks (rows) for better rendering
    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }
    
    return {
      monthStart,
      monthEnd,
      monthDays,
      calendarDays,
      weeks
    };
  }, [currentDate]);

  // Memoized task lookup table for O(1) access by date
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    
    tasks.forEach(task => {
      // Generate date keys in YYYY-MM-DD format for consistent lookup
      const dueDate = task.dueDate.slice(0, 10);
      
      if (!map.has(dueDate)) {
        map.set(dueDate, []);
      }
      
      map.get(dueDate)?.push(task);
    });
    
    return map;
  }, [tasks]);

  // Handle month navigation with useCallback for stable function identity
  const handlePreviousMonth = useCallback((): void => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  }, []);
  
  const handleNextMonth = useCallback((): void => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  }, []);

  // Handle clicking on a day with useCallback for stable function identity
  const handleDayClick = useCallback((day: Date | null): void => {
    if (day) {
      setSelectedDate(day);
      setIsViewTasksOpen(true);
    }
  }, []);

  // Handle switching to add task dialog
  const handleAddTaskClick = useCallback((): void => {
    setIsViewTasksOpen(false);
    setIsAddTaskOpen(true);
  }, []);

  // Handle clicking on a task to view its details with useTransition for better UX
  const handleTaskClick = useCallback((taskId: string): void => {
    setIsViewTasksOpen(false);
    startTransition(() => {
      router.push(`/task-info?id=${taskId}`);
    });
  }, [router]);

  // Get tasks scheduled for a specific day using the optimized lookup table
  const getTasksForDay = useCallback((day: Date): Task[] => {
    if (!day) return [];
    
    const dateKey = formatDateToString(day).slice(0, 10);
    return tasksByDate.get(dateKey) || [];
  }, [tasksByDate]);

  // Determine the background color for a day based on tasks status
  const getDayColor = useCallback((day: Date): string => {
    const dayTasks = getTasksForDay(day);
    if (dayTasks.length === 0) return "";
    
    const hasOverdueTasks = dayTasks.some(
      (task) => getCompletionStatus(task) === "overdue"
    );
    
    return hasOverdueTasks 
      ? "bg-[hsl(var(--status-overdue-bg))] calendar-day-highlight" 
      : "bg-[hsl(var(--status-active-bg))] calendar-day-highlight";
  }, [getTasksForDay]);

  // Add new task with optimized immutable update
  const handleAddTasks = useCallback((newTask: Omit<Task, "id">): void => {
    if (selectedDate && newTask.title.trim()) {
      // Generate a unique ID with collision prevention
      const newTaskId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      const newTaskItem: Task = {
        id: newTaskId,
        ...newTask, // This will include all the fields from the form
      };
      
      // Update with functional state update pattern
      setTasks(currentTasks => {
        const updatedTasks = [...currentTasks, newTaskItem];
        
        // Update localStorage asynchronously to prevent UI blocking
        queueMicrotask(() => {
          try {
            localStorage.setItem("calendarTasks", JSON.stringify(updatedTasks));
          } catch (error) {
            console.warn("Failed to store tasks in localStorage:", error);
          }
        });
        
        return updatedTasks;
      });
      
      setIsAddTaskOpen(false);
      setIsViewTasksOpen(true);
    }
  }, [selectedDate]);

  // Custom tooltip styles (memoized to prevent recreation)
  const tooltipStyles = useMemo(() => ({
    content: "bg-background text-foreground border border-border shadow-sm",
    taskTooltip: "max-w-[300px] p-0 overflow-hidden bg-background text-foreground border border-border shadow-sm",
  }), []);

  // Show loading state while initial data is being fetched
  if (isLoading && !tasks.length) {
    return (
      <div className="container mx-auto py-12 px-4 h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">Loading documents...</div>
        </div>
      </div>
    );
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
                {error && <p className="text-red-500 text-xs mt-0.5">{error}</p>}
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handlePreviousMonth} 
                  className="h-7 w-7"
                  disabled={isPending}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-sm font-medium px-2 min-w-[120px] text-center">
                  {format(currentDate, "MMMM yyyy")}
                </h2>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleNextMonth} 
                  className="h-7 w-7"
                  disabled={isPending}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Calendar grid with optimized rendering */}
            <Card className="h-[690px] overflow-hidden border-none shadow-none bg-white dark:bg-black">
              <CardContent className="h-[690px] p-0 flex flex-col">
                {/* Calendar header: Days of week */}
                <div className="grid grid-cols-7 border-b border-border/40">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center text-xs font-medium py-2 text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid with weeks and days */}
                <div className="grid grid-cols-7 flex-grow">
                  {calendarData.weeks.flat().map((day, index) => (
                    <div
                      key={index}
                      className={cn(
                        "border-b border-r border-border/40 relative hover:bg-muted/5",
                        index % 7 === 0 && "border-l",
                        day ? "cursor-pointer transition-colors" : "bg-muted/5",
                        isCurrentOrFuture(day) && "hover:ring-1 hover:ring-primary/10"
                      )}
                      onClick={() => day && handleDayClick(day)}
                      role={day ? "button" : "presentation"}
                      aria-label={day ? format(day, "EEEE, MMMM d, yyyy") : undefined}
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
                            
                            {/* Task count indicator with optimized calculation */}
                            {(() => {
                              const dayTasksCount = getTasksForDay(day).length;
                              if (dayTasksCount === 0) return null;
                              
                              return (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-[9px] text-muted-foreground font-medium bg-muted/30 rounded-full px-1.5 py-0.5 hover:bg-muted/50 transition-colors">
                                      {dayTasksCount}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className={tooltipStyles.content}>
                                    <div className="text-xs p-2">
                                      {dayTasksCount} {dayTasksCount === 1 ? "task" : "tasks"} on this day
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })()}
                          </div>

                          {/* Task previews for each day with optimized rendering */}
                          <div className="space-y-0.5 mt-0.5 overflow-hidden">
                            {(() => {
                              const dayTasks = getTasksForDay(day);
                              const visibleTasks = dayTasks.slice(0, 3);
                              const remainingCount = dayTasks.length - 3;
                              
                              return (
                                <>
                                  {visibleTasks.map((task) => {
                                    // Determine completion using dateCompleted check
                                    const isCompleted = task.dateCompleted !== undefined;
                                    return (
                                      <Tooltip key={task.id}>
                                        <TooltipTrigger asChild>
                                          <div
                                            className={cn(
                                              "text-[9px] px-1 py-0.5 rounded-sm bg-background/80 flex items-center gap-1",
                                              isCompleted && "text-muted-foreground line-through",
                                              `border-l-2 ${
                                                task.priority === "High"
                                                  ? "border-l-red-400"
                                                  : task.priority === "Medium"
                                                    ? "border-l-amber-400"
                                                    : "border-l-blue-400"
                                              }`
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
                                                    task.priority === "High"
                                                      ? "bg-red-400"
                                                      : task.priority === "Medium"
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
                                    );
                                  })}
                                  
                                  {/* Indicator for additional tasks */}
                                  {remainingCount > 0 && (
                                    <div className="text-[8px] text-muted-foreground px-1 flex items-center gap-0.5">
                                      <span>+{remainingCount} more</span>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
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
            selectedDate={selectedDate}
          />
        </div>
      </TooltipProvider>
    </TasksContext.Provider>
  );
}