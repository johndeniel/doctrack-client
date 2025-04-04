import { cn } from "@/lib/utils"
import type { Priority} from "@/lib/types"

/**
 * PriorityBadge component renders a badge indicating task priority.
 *
 * @param priority - The priority level ("high", "medium", or "low").
 */
export const PriorityBadge = ({ priority }: { priority: Priority }) => {
  // Define styling and labels for each priority level.
  const priorityConfig = {
    High: {
      label: "High",
      className:
        "text-[hsl(var(--priority-high-text))] bg-[hsl(var(--priority-high-bg))] border-[hsl(var(--priority-high-border))]",
    },
    Medium: {
      label: "Medium",
      className:
        "text-[hsl(var(--priority-medium-text))] bg-[hsl(var(--priority-medium-bg))] border-[hsl(var(--priority-medium-border))]",
    },
    Low: {
      label: "Low",
      className:
        "text-[hsl(var(--priority-low-text))] bg-[hsl(var(--priority-low-bg))] border-[hsl(var(--priority-low-border))]",
    },
  }

  const { label, className } = priorityConfig[priority]

  return (
    <div className={cn("border whitespace-nowrap badge", className)}>
      <span className="inline-block">{label}</span>
    </div>
  )
}
