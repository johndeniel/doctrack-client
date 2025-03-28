"use client"

import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TaskSearchProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

/**
 * TaskSearch component provides a search input for filtering tasks by title.
 * It includes a clear button when the search input contains text.
 */
export function TaskSearch({ searchQuery, onSearchChange }: TaskSearchProps) {
  return (
    // Container for the search input with relative positioning
    <div className="relative flex-grow max-w-md">
      {/* Search icon positioned inside the input */}
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      
      {/* Search input field */}
      <Input
        placeholder="Search Document titles..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-9 h-9"
      />
      
      {/* Clear button appears only when searchQuery is not empty */}
      {searchQuery && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1 h-7 w-7"
          onClick={() => onSearchChange("")}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  )
}
