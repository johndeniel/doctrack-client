"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Priority } from "@/lib/types"
import type { JSX } from "react/jsx-runtime"

/**
 * Props for the AddTaskDialog component
 */
interface AddTaskDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: Date | null
  onBackToTasks: () => void
  onAddTask: (task: { title: string; description: string; priority: Priority }) => void
}

/**
 * Dialog component for adding a new task
 * Provides form fields for task title, description, and priority
 */
export const AddTaskDialog = ({
  isOpen,
  onOpenChange,
  selectedDate,
  onBackToTasks,
  onAddTask,
}: AddTaskDialogProps): JSX.Element => {
  // State for the new task form
  const [newTask, setNewTask] = useState<{
    title: string
    description: string
    priority: Priority
  }>({
    title: "",
    description: "",
    priority: "medium",
  })

  /**
   * Handles the form submission
   * Validates the task title and calls the onAddTask callback
   */
  const handleAddTask = (): void => {
    if (newTask.title.trim()) {
      onAddTask(newTask)

      // Reset the form after submission
      setNewTask({
        title: "",
        description: "",
        priority: "medium",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden dialog-content">
        {/* Dialog header with back button and title */}
        <DialogHeader className="px-6 pt-5 pb-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={onBackToTasks} className="h-8 w-8 mr-2.5 rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <DialogTitle className="text-base font-normal">
                Add Task for {selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        {/* Task form fields */}
        <div className="px-6 py-4 space-y-5">
          {/* Task title field */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-normal text-muted-foreground">
              Task Title
            </Label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="h-9 text-sm border-0 bg-muted/30 focus:ring-0 focus-visible:ring-1"
            />
          </div>

          {/* Task description field */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-normal text-muted-foreground">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Enter task description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="text-sm min-h-[80px] resize-none border-0 bg-muted/30 focus:ring-0 focus-visible:ring-1"
            />
          </div>

          {/* Task priority selection */}
          <div className="space-y-2">
            <Label htmlFor="priority" className="text-xs font-normal text-muted-foreground">
              Priority
            </Label>
            <Select
              value={newTask.priority}
              onValueChange={(value: Priority) => setNewTask({ ...newTask, priority: value })}
            >
              <SelectTrigger
                id="priority"
                className="h-9 text-sm border-0 bg-muted/30 focus:ring-0 focus-visible:ring-1"
              >
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high" className="text-sm">
                  <span className="text-red-600 dark:text-red-400">High Priority</span>
                </SelectItem>
                <SelectItem value="medium" className="text-sm">
                  <span className="text-amber-600 dark:text-amber-400">Medium Priority</span>
                </SelectItem>
                <SelectItem value="low" className="text-sm">
                  <span className="text-blue-600 dark:text-blue-400">Low Priority</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Dialog footer with action buttons */}
        <DialogFooter className="px-6 py-4">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-xs h-9 font-normal">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleAddTask}
            disabled={!newTask.title.trim()}
            className="text-xs h-9 px-4 font-normal"
          >
            Add Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

