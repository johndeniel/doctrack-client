"use client"

import type React from "react"
import { format, parse } from "date-fns"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { PriorityBadge } from "@/components/priority-badge"
import { StatusBadge } from "@/components/status-badge"
import type { Task } from "@/lib/types"

/**
 * Props for TaskGrid component.
 */
interface TaskGridProps {
  tasks: Task[]
  onTaskClick: (taskId: string) => void
  onToggleTaskCompletion: (taskId: string, event: React.MouseEvent) => void
}

/**
 * Parses a date string in "dd-MM-yyyy" format to a JavaScript Date object.
 *
 * @param dateString - The date string in dd-MM-yyyy format.
 * @returns A JavaScript Date object.
 */
const parseDate = (dateString: string): Date => {
  return parse(dateString, "dd-MM-yyyy", new Date())
}

/**
 * TaskGrid component displays tasks in a responsive grid layout.
 * Each task is rendered as a card with its title, description, badges, and formatted dates.
 *
 * @param tasks - Array of tasks to display.
 * @param onTaskClick - Callback function when a task card is clicked.
 */
export function TaskGrid({ tasks, onTaskClick }: TaskGridProps) {
  return (
    // Grid container with responsive columns and gap between cards
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {tasks.map((task) => (
        // Task card container with conditional styling based on completion
        <div
          key={task.id}
          className={cn(
            "bg-background border border-border/40 rounded-md overflow-hidden cursor-pointer transition-colors",
            task.dateCompleted && "bg-muted/5" // Apply muted background if task is completed
          )}
          onClick={() => onTaskClick(task.id)}
        >
          {/* Card content container with fixed height */}
          <div className="p-3.5 flex flex-col h-[170px]">
            {/* Header section: Task title and PriorityBadge */}
            <div className="flex justify-between items-start gap-2 mb-2">
              <h3
                className={cn("text-sm font-medium flex-1 h-10", task.dateCompleted && "text-muted-foreground")}
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textDecoration: task.dateCompleted ? "line-through" : "none",
                }}
              >
                {task.title}
              </h3>
              <PriorityBadge priority={task.priority} />
            </div>

            {/* Optional description section */}
            {task.description && (
              <p
                className={cn(
                  "text-xs text-muted-foreground mb-auto h-9",
                  task.dateCompleted && "text-muted-foreground/70"
                )}
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: "1.5",
                  textDecoration: task.completed ? "line-through" : "none",
                }}
              >
                {task.description}
              </p>
            )}

            {/* Footer section: Separator, formatted date, and StatusBadge */}
            <div className="mt-auto pt-2.5">
              <Separator className="mb-2.5 opacity-60" />
              <div className="flex justify-between items-center text-[0.7rem] text-muted-foreground">
                {/* Display completion date if completed; otherwise, show due date */}
                <span>
                  {task.completed
                    ? `Completed on ${format(parseDate(task.dateCompleted || task.dueDate), "MMM d, yyyy")}`
                    : `Due on ${format(parseDate(task.dueDate), "MMM d, yyyy")}`}
                </span>
                <StatusBadge task={task} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
