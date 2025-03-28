"use client"
import { useTheme } from "next-themes"
import { Laptop, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useEffect } from "react"

/**
 * Theme selector component with light, dark, and system options
 */
export function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  // Persist theme in localStorage
  useEffect(() => {
    if (theme) {
      localStorage.setItem('theme', theme)
    }
  }, [theme])

  // Check localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [setTheme])

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">Theme preference</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 dark:border-muted">
            {theme === "light" ? (
              <Sun className="h-4 w-4" />
            ) : theme === "dark" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Laptop className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32 dark:border-muted">
          <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">
            <Sun className="mr-2 h-4 w-4" />
            <span>Light</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
            <Moon className="mr-2 h-4 w-4" />
            <span>Dark</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer">
            <Laptop className="mr-2 h-4 w-4" />
            <span>System</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}