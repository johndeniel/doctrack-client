"use client"

import type React from "react"

import { format, parse } from "date-fns"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { PriorityBadge } from "@/app/(dashboard)/components/priority-badge"
import { CompletionStatusBadge } from "@/app/(dashboard)/components/completion-status-badge"
import type { Task } from "@/lib/types"

interface TaskGridProps {
  tasks: Task[]
  onTaskClick: (taskId: string) => void
  onToggleTaskCompletion: (taskId: string, event: React.MouseEvent) => void
}

/**
 * Function to parse date string from dd-MM-yyyy format to JavaScript Date
 */
const parseDate = (dateString: string): Date => {
  return parse(dateString, "dd-MM-yyyy", new Date())
}

/**
 * TaskGrid component displays tasks in a grid view
 * It handles rendering each task as a card with proper formatting and interactions
 */
export function TaskGrid({ tasks, onTaskClick }: TaskGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={cn(
            "bg-background border border-border/40 rounded-md overflow-hidden cursor-pointer transition-colors",
            task.priority === "high"
              ? "border-l-3 border-l-[hsl(var(--priority-high-text))]"
              : task.priority === "medium"
                ? "border-l-3 border-l-[hsl(var(--priority-medium-text))]"
                : "border-l-3 border-l-[hsl(var(--priority-low-text))]",
            task.completed && "bg-muted/5",
          )}
          onClick={() => onTaskClick(task.id)}
        >
          <div className="p-3.5 flex flex-col h-[170px]">
            <div className="flex justify-between items-start gap-2 mb-2">
              <h3
                className={cn("text-sm font-medium flex-1 h-10", task.completed && "text-muted-foreground")}
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textDecoration: task.completed ? "line-through" : "none",
                }}
              >
                {task.title}
              </h3>
              <PriorityBadge priority={task.priority} />
            </div>

            {task.description && (
              <p
                className={cn(
                  "text-xs text-muted-foreground mb-auto h-9",
                  task.completed && "text-muted-foreground/70",
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

            <div className="mt-auto pt-2.5">
              <Separator className="mb-2.5 opacity-60" />

              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">
                  {format(parseDate(task.date), "MMMM d, yyyy")}
                </span>
                <CompletionStatusBadge task={task} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

