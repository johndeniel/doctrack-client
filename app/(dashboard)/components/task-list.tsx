"use client"

import type React from "react"
import { format, parse } from "date-fns"
import { cn } from "@/lib/utils"
import { PriorityBadge } from "@/app/(dashboard)/components/priority-badge"
import { CompletionStatusBadge } from "@/app/(dashboard)/components/completion-status-badge"
import type { Task } from "@/lib/types"

interface TaskListProps {
  tasks: Task[]
  onTaskClick: (taskId: string) => void
  onToggleTaskCompletion: (taskId: string, event: React.MouseEvent) => void
}

export function TaskList({ tasks, onTaskClick }: TaskListProps) {
  const parseDate = (dateString: string): Date => 
    parse(dateString, "dd-MM-yyyy", new Date())

  return (
    <div className="space-y-2 p-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={cn(
            "group flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200",
            "cursor-pointer",
            "border border-transparent hover:border-border/10",
            task.completed && "bg-muted/5 opacity-80"
          )}
          onClick={() => onTaskClick(task.id)}
        >
          <div className="flex-grow min-w-0 space-y-1.5">
            <div className="flex justify-between items-start gap-4">
              <h3
                className={cn(
                  "text-sm font-medium tracking-tight truncate max-w-[280px]",
                  task.completed && "text-muted-foreground line-through"
                )}
              >
                {task.title}
              </h3>
              <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                <CompletionStatusBadge task={task} />
                <PriorityBadge priority={task.priority} />
              </div>
            </div>

            {task.description && (
              <p
                className={cn(
                  "text-xs text-muted-foreground truncate max-w-full",
                  task.completed && "opacity-60 line-through"
                )}
              >
                {task.description}
              </p>
            )}

            <div className="text-xs text-muted-foreground flex justify-between items-center">
              <span>
                {task.completed
                  ? `Completed on ${format(parseDate(task.dateCompleted || task.dueDate), "MMMM d, yyyy")}`
                  : `Due on ${format(parseDate(task.dueDate), "MMMM d, yyyy")}`}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}