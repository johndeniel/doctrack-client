import { cn } from "@/lib/utils"
import type { Priority } from "@/lib/types"



export const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const priorityConfig = {
    high: {
      label: "High",
      className: "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30",
    },
    medium: {
      label: "Medium",
      className:
        "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30",
    },
    low: {
      label: "Low",
      className:
        "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30",
    },
  }

  const { label, className } = priorityConfig[priority]

  return (
    <div
      className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded-sm border whitespace-nowrap shadow-sm", className)}
    >
      {label}
    </div>
  )
}

