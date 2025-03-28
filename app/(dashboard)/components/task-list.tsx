"use client"

import type React from "react"
import { format, parse } from "date-fns"
import { cn } from "@/lib/utils"
import { PriorityBadge } from "@/components/priority-badge"
import { StatusBadge } from "@/components/status-badge"
import type { Task } from "@/lib/types"

interface TaskListProps {
  tasks: Task[]
  onTaskClick: (taskId: string) => void
  onToggleTaskCompletion: (taskId: string, event: React.MouseEvent) => void
}

export function TaskList({ tasks, onTaskClick }: TaskListProps) {
  // Function to parse a date string in "dd-MM-yyyy" format into a Date object
  const parseDate = (dateString: string): Date =>
    parse(dateString, "dd-MM-yyyy", new Date())

  return (
    // Container with vertical spacing and padding
    <div className="space-y-2 p-4">
      {tasks.map((task) => {
        // Determine if the task is completed by checking if dateCompleted exists
        const isCompleted = task.dateCompleted !== undefined

        return (
          // Task card container with hover effects and conditional styling for completed tasks
          <div
            key={task.id}
            className={cn(
              "group flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200",
              "cursor-pointer",
              "border border-transparent hover:border-border/10",
              isCompleted && "bg-muted/5 opacity-80"
            )}
            onClick={() => onTaskClick(task.id)}
          >
            {/* Content container for task details */}
            <div className="flex-grow min-w-0 space-y-1.5">
              {/* Header: Task title and badges for status and priority */}
              <div className="flex justify-between items-start gap-4">
                <h3
                  className={cn(
                    "text-sm font-medium tracking-tight truncate max-w-[280px]",
                    isCompleted && "text-muted-foreground line-through"
                  )}
                >
                  {task.title}
                </h3>
                {/* Badge container with status and priority icons */}
                <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                  <StatusBadge task={task} />
                  <PriorityBadge priority={task.priority} />
                </div>
              </div>

              {/* Optional description section, truncated for layout */}
              {task.description && (
                <p
                  className={cn(
                    "text-xs text-muted-foreground truncate max-w-full",
                    isCompleted && "opacity-60 line-through"
                  )}
                >
                  {task.description}
                </p>
              )}

              {/* Footer: Display the due or completion date */}
              <div className="text-xs text-muted-foreground flex justify-between items-center">
                <span>
                  {isCompleted
                    ? `Completed on ${format(
                        parseDate(task.dateCompleted || task.dueDate),
                        "MMMM d, yyyy"
                      )}`
                    : `Due on ${format(parseDate(task.dueDate), "MMMM d, yyyy")}`}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
