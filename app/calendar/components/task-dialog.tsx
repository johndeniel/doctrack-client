"use client";

import { format, parse } from "date-fns";
import { Calendar, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PriorityBadge } from "@/components/priority-badge";
import { CompletionStatusBadge } from "@/components/completion-status-badge";
import type { Task } from "@/lib/types";

/**
 * Props for the TaskDialog component.
 */
interface TaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  tasks: Task[];
  onAddTaskClick: () => void;
  onTaskClick: (taskId: string) => void;
  isCurrentOrFuture: (date: Date) => boolean;
}

/**
 * Converts a date string in "dd-MM-yyyy" format (from MySQL) into a JavaScript Date object.
 * @param dateString - The date string to parse.
 * @returns The corresponding JavaScript Date object.
 */
const parseDate = (dateString: string): Date => {
  return parse(dateString, "dd-MM-yyyy", new Date());
};

/**
 * Dialog component that displays tasks for the selected date.
 * Provides options to view task details or add new tasks.
 */
export const TaskDialog = ({
  isOpen,
  onOpenChange,
  selectedDate,
  tasks,
  onAddTaskClick,
  onTaskClick,
  isCurrentOrFuture,
}: TaskDialogProps) => {
  // Filters tasks to only those scheduled for the specified day.
  const getTasksForDay = (day: Date): Task[] => {
    return tasks.filter((task) => {
      const taskDate = parseDate(task.dueDate);
      return (
        taskDate.getDate() === day.getDate() &&
        taskDate.getMonth() === day.getMonth() &&
        taskDate.getFullYear() === day.getFullYear()
      );
    });
  };

  // Retrieve tasks for the currently selected date.
  const currentDateTasks = selectedDate ? getTasksForDay(selectedDate) : [];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden dialog-content">
        {/* Dialog header: displays the formatted date and the number of tasks */}
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
          {/* Display an empty state if no tasks are scheduled for the selected date */}
          {selectedDate && currentDateTasks.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground flex flex-col items-center gap-3">
              <div className="bg-muted/10 p-3 rounded-full">
                <Calendar className="h-5 w-5 opacity-50" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium">No tasks for this day</p>
                <p className="text-[10px] text-muted-foreground max-w-[200px]">
                  Document you add for this date will appear here
                </p>
              </div>
            </div>
          ) : (
            // Render a scrollable list of tasks for the selected date.
            <div className="scroll-area-container">
              <ScrollArea className="h-[360px]">
                <div className="px-6 py-2 space-y-3">
                  {selectedDate &&
                    currentDateTasks.map((task) => {
                      // Determine if the task is completed by checking if dateCompleted is not undefined
                      const isCompleted = task.dateCompleted !== undefined;

                      return (
                        <Card
                          key={task.id}
                          className={cn(
                            "border-transparent dark:border-white/10 transition-all cursor-pointer h-auto"
                          )}
                          onClick={() => onTaskClick(task.id)}
                        >
                          <CardHeader className="pb-1 relative flex flex-row items-center justify-between space-y-0 p-3">
                            {/* Task title with truncation and styling for completed tasks */}
                            <h3
                              className={cn(
                                "text-xs font-semibold flex-grow truncate pr-2",
                                isCompleted && "text-muted-foreground line-through"
                              )}
                              title={task.title}
                            >
                              {task.title}
                            </h3>
                            {/* Displays the task's priority badge */}
                            <div>
                              <PriorityBadge priority={task.priority} />
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-2 pt-1 px-3 pb-3">
                            {/* Optional task description with truncation */}
                            {task.description && (
                              <p
                                className={cn(
                                  "text-[10px] text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap",
                                  isCompleted && "line-through"
                                )}
                                title={task.description}
                              >
                                {task.description}
                              </p>
                            )}
                            <div className="px-0">
                              <Separator className="my-2 w-full" />
                            </div>
                            {/* Task metadata: due date or completion date */}
                            <div className="flex items-center justify-between">
                              <div>
                                {isCompleted ? (
                                  <p className="text-[10px] text-muted-foreground">
                                    Completed{" "}
                                    <span className="font-medium">
                                      {format(
                                        parseDate(task.dateCompleted || task.dueDate),
                                        "MMMM d, yyyy"
                                      )}
                                    </span>
                                  </p>
                                ) : (
                                  <p className="text-[10px] text-muted-foreground">
                                    Due{" "}
                                    <span className="font-medium">
                                      {format(parseDate(task.dueDate), "MMMM d, yyyy")}
                                    </span>
                                  </p>
                                )}
                              </div>
                              {/* Displays the task completion status badge */}
                              <CompletionStatusBadge task={task} />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Dialog footer: provides action buttons to close the dialog or add a new task */}
        <DialogFooter className="px-6 py-4 flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-8 font-normal"
          >
            Close
          </Button>
          {selectedDate && isCurrentOrFuture(selectedDate) && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddTaskClick}
              className="text-xs h-8 px-3 font-normal"
            >
              <Plus className="h-3 w-3 mr-1.5" /> Add Document
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
