import { SlidersHorizontal, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { TaskSortOption, SortState } from "@/lib/types"

interface TaskSortProps {
  sortState: SortState
  onToggleSort: (sortType: TaskSortOption) => void
}

/**
 * TaskSort component provides UI for sorting tasks by different criteria
 * It manages the dropdown menu and sort direction indicators
 */
export function TaskSort({ sortState, onToggleSort }: TaskSortProps) {
  const { sortBy, sortDirection } = sortState

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Sort
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuCheckboxItem checked={sortBy === "date"} onCheckedChange={() => onToggleSort("date")}>
          <div className="flex items-center justify-between w-full">
            <span>Due Date</span>
            {sortBy === "date" && (
              <ArrowUpDown className={cn("h-3.5 w-3.5 ml-2", sortDirection === "desc" && "rotate-180")} />
            )}
          </div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={sortBy === "title"} onCheckedChange={() => onToggleSort("title")}>
          <div className="flex items-center justify-between w-full">
            <span>Title</span>
            {sortBy === "title" && (
              <ArrowUpDown className={cn("h-3.5 w-3.5 ml-2", sortDirection === "desc" && "rotate-180")} />
            )}
          </div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={sortBy === "priority"} onCheckedChange={() => onToggleSort("priority")}>
          <div className="flex items-center justify-between w-full">
            <span>Priority</span>
            {sortBy === "priority" && (
              <ArrowUpDown className={cn("h-3.5 w-3.5 ml-2", sortDirection === "desc" && "rotate-180")} />
            )}
          </div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={sortBy === "status"} onCheckedChange={() => onToggleSort("status")}>
          <div className="flex items-center justify-between w-full">
            <span>Status</span>
            {sortBy === "status" && (
              <ArrowUpDown className={cn("h-3.5 w-3.5 ml-2", sortDirection === "desc" && "rotate-180")} />
            )}
          </div>
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

