"use client"
import { format, parse } from "date-fns"
import { Calendar, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { PriorityBadge } from "@/app/calendar/components/priority-badge"
import { TaskCompletionStatusBadge } from "@/app/calendar/components/task-completion-status-badge"
import type { Task } from "@/lib/types"
import { JSX } from "react"

/**
 * Props for the TaskDialog component
 */
interface TaskDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: Date | null
  tasks: Task[]
  onAddTaskClick: () => void
  onTaskClick: (taskId: string) => void
  isCurrentOrFuture: (date: Date) => boolean
}

/**
 * Parses a date string from MySQL format to JavaScript Date
 * @param dateString - Date string in dd-MM-yyyy format
 * @returns JavaScript Date object
 */
const parseDate = (dateString: string): Date => {
  return parse(dateString, "dd-MM-yyyy", new Date())
}

/**
 * Dialog component that displays tasks for a selected date
 * Provides options to view task details or add new tasks
 */
export const TaskDialog = ({
  isOpen,
  onOpenChange,
  selectedDate,
  tasks,
  onAddTaskClick,
  onTaskClick,
  isCurrentOrFuture,
}: TaskDialogProps): JSX.Element => {
  // Get tasks for the selected date
  const getTasksForDay = (day: Date): Task[] => {
    return tasks.filter((task) => {
      const taskDate = parseDate(task.dueDate)
      return (
        taskDate.getDate() === day.getDate() &&
        taskDate.getMonth() === day.getMonth() &&
        taskDate.getFullYear() === day.getFullYear()
      )
    })
  }

  // Tasks for the currently selected date
  const currentDateTasks = selectedDate ? getTasksForDay(selectedDate) : []

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden dialog-content">
        {/* Dialog header with date and task count */}
        <DialogHeader className="px-6 pt-5 pb-4">
          <div className="space-y-1">
            <DialogTitle className="text-base font-normal tracking-tight">
              {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Tasks"}
            </DialogTitle>
            <p className="text-[10px] text-muted-foreground flex items-center">
              <Calendar className="h-3 w-3 mr-1.5 opacity-70" />
              {currentDateTasks.length} {currentDateTasks.length === 1 ? "task" : "tasks"} scheduled
            </p>
          </div>
        </DialogHeader>

        <div>
          {/* Empty state when no tasks are available */}
          {selectedDate && currentDateTasks.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground flex flex-col items-center gap-3">
              <div className="bg-muted/10 p-3 rounded-full">
                <Calendar className="h-5 w-5 opacity-50" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium">No tasks for this day</p>
                <p className="text-[10px] text-muted-foreground max-w-[200px]">
                  Tasks you add for this date will appear here
                </p>
              </div>
            </div>
          ) : (
            /* Task list with scrollable area */
            <div className="scroll-area-container">
              <ScrollArea className="h-[360px]">
                <div className="px-6 py-2 space-y-3">
                  {selectedDate &&
                    currentDateTasks.map((task) => {
                      const isCompleted = task.completed

                      return (
                        // Task card with priority indicator and hover effects
                        <div
                          key={task.id}
                          className={cn(
                            "py-3 px-4 transition-all cursor-pointer relative task-card",
                            "border-0 hover:bg-muted/5 rounded-md",
                            "bg-card shadow-sm",
                            task.priority === "high"
                              ? "border-l-2 border-l-[hsl(var(--priority-high-text))]"
                              : task.priority === "medium"
                                ? "border-l-2 border-l-[hsl(var(--priority-medium-text))]"
                                : "border-l-2 border-l-[hsl(var(--priority-low-text))]",
                          )}
                          onClick={() => onTaskClick(task.id)}
                        >
                          {/* Priority badge in top right corner */}
                          <div className="absolute top-3 right-4">
                            <PriorityBadge priority={task.priority} />
                          </div>

                          <div className="space-y-2.5 pr-16">
                            {/* Task title */}
                            <h4
                              className={cn(
                                "text-xs font-medium leading-tight truncate max-w-full",
                                isCompleted && "text-muted-foreground line-through",
                              )}
                              title={task.title}
                            >
                              {task.title}
                            </h4>

                            {/* Task description (if available) */}
                            {task.description && (
                              <>
                                <p
                                  className={cn(
                                    "text-[10px] text-muted-foreground leading-normal line-clamp-2",
                                    isCompleted && "line-through",
                                  )}
                                  title={task.description}
                                >
                                  {task.description}
                                </p>
                                <div className="px-0">
                                  <Separator className="my-2 w-full opacity-30" />
                                </div>
                              </>
                            )}

                            {/* Task metadata with dates and status */}
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col gap-1">
                                {/* Show different date information based on task status */}
                                {isCompleted ? (
                                  <p className="text-[10px] font-normal">
                                    Completed on{" "}
                                    <span className="text-muted-foreground">
                                      {format(parseDate(task.dateCompleted || task.dueDate), "MMMM d, yyyy")}
                                    </span>
                                  </p>
                                ) : (
                                  <p className="text-[10px] font-normal">
                                    Due on{" "}
                                    <span className="text-muted-foreground">
                                      {format(parseDate(task.dueDate), "MMMM d, yyyy")}
                                    </span>
                                  </p>
                                )}
                              </div>

                              {/* Status badge in bottom right corner */}
                              <div className="absolute bottom-3 right-4">
                                <TaskCompletionStatusBadge task={task} />
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Dialog footer with action buttons */}
        <DialogFooter className="px-6 py-4 flex justify-between">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-xs h-8 font-normal">
            Close
          </Button>
          {selectedDate && isCurrentOrFuture(selectedDate) && (
            <Button size="sm" onClick={onAddTaskClick} className="text-xs h-8 px-3 font-normal">
              <Plus className="h-3 w-3 mr-1.5" /> Add Task
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

