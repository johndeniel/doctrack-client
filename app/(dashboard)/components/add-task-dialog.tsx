"use client"
import { format, isBefore, startOfDay } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Priority, Task } from "@/lib/types"
import { formatDateToString } from "@/lib/calendar-utils"

// Form schema with validation
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["Physical Document", "Digital Document"], {
    required_error: "Document type is required",
  }),
  origin: z.enum(["Internal", "External"], {
    required_error: "Task origin is required",
  }),
  priority: z.enum(["high", "medium", "low"], {
    required_error: "Priority is required",
  }),
  dateReceived: z.date({
    required_error: "Date received is required",
  }),
  timeReceived: z.string().min(1, "Time received is required"),
  dueDate: z
  .date({
    required_error: "Due date is required",
  })
  .refine((date) => !isBefore(date, startOfDay(new Date())), "Due date cannot be in the past"),
})

type FormValues = z.infer<typeof formSchema>

interface AddTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddTask: (task: Omit<Task, "id">) => void
}

/**
 * AddTaskDialog component provides a form for adding new tasks
 * It includes fields for title, description, type, origin, priority, and dates
 */
export function AddTaskDialog({ open, onOpenChange, onAddTask }: AddTaskDialogProps) {
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "Digital Document",
      origin: "Internal",
      priority: "medium",
      dateReceived: new Date(),
      timeReceived: format(new Date(), "HH:mm"),
      dueDate: new Date(),
    },
  })

  /**
   * Reset form fields to default values
   */
  const resetForm = () => {
    form.reset({
      title: "",
      description: "",
      type: "Digital Document",
      origin: "Internal",
      priority: "medium",
      dateReceived: new Date(),
      timeReceived: format(new Date(), "HH:mm"),
    })
  }

  /**
   * Handle form submission
   */
  const onSubmit = (values: FormValues) => {
    // Create new task object
    const newTask: Omit<Task, "id"> = {
      title: values.title,
      description: values.description,
      priority: values.priority as Priority,
      dueDate:  formatDateToString(values.dueDate),
      dateCompleted: undefined,
    }

    // Add task and close dialog
    onAddTask(newTask)
    onOpenChange(false)
    resetForm()
  }

  /**
   * Handle dialog close
   */
  const handleClose = () => {
    onOpenChange(false)
    resetForm()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden dialog-content">
        <DialogHeader className="px-7 py-6 border-b border-border/20 bg-muted/5">
          <DialogTitle className="text-xl font-medium tracking-tight">Add New Document</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="px-7 space-y-6 pb-4 max-h-[70vh] overflow-y-auto">
              {/* Title field */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="space-y-2.5">
                    <FormLabel className="text-sm font-medium">Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter document title" 
                        className="h-10 rounded-md bg-background border-border/60 focus-visible:ring-1 focus-visible:ring-offset-0 transition-all" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Description field */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="space-y-2.5">
                    <FormLabel className="text-sm font-medium">Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter document description" 
                        className="resize-none min-h-[100px] p-4 rounded-md bg-background border-border/60 focus-visible:ring-1 focus-visible:ring-offset-0 transition-all" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Type and Origin fields */}
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-2.5">
                      <FormLabel className="text-sm">Document Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Physical Document">Physical Document</SelectItem>
                          <SelectItem value="Digital Document">Digital Document</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="origin"
                  render={({ field }) => (
                    <FormItem className="space-y-2.5">
                      <FormLabel className="text-sm">Document Origin</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select origin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Internal">Internal</SelectItem>
                          <SelectItem value="External">External</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Priority field */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem className="space-y-2.5">
                    <FormLabel className="text-sm">Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="low">Low Priority</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Date Received and Time Received fields */}
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="dateReceived"
                  render={({ field }) => (
                    <FormItem className="space-y-2.5">
                      <FormLabel className="text-sm font-medium">Date Received</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal h-10 rounded-md bg-background border-border/60 hover:bg-muted/10 transition-all",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-3 h-4 w-4 text-muted-foreground" />
                              {field.value ? format(field.value, "MMM d, yyyy") : "Select date"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-background border-border/60 rounded-md shadow-lg" align="start">
                          <Calendar 
                            mode="single" 
                            selected={field.value} 
                            onSelect={field.onChange} 
                            initialFocus 
                            className="rounded-md"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timeReceived"
                  render={({ field }) => (
                    <FormItem className="space-y-2.5">
                      <FormLabel className="text-sm">Time Received</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="time" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                 
              </div>
              {/* Due Date field */}
              <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="space-y-2.5">
                        <FormLabel className="text-sm font-medium">Due Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal h-10 rounded-md bg-background border-border/60 hover:bg-muted/10 transition-all",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-3 h-4 w-4 text-muted-foreground" />
                                {field.value ? format(field.value, "PPP") : "Select date"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => isBefore(date, startOfDay(new Date()))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
            </div>

            <DialogFooter className="px-6 py-4 flex justify-between">
              <Button 
                variant="ghost"
                size="sm"
                onClick={handleClose} 
              >
                Cancel
              </Button>
              <Button 
                variant="outline"
                size="sm"
              >
                Add Document
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}