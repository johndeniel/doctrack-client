import type * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SettingsCardProps {
  /**
   * Card title
   */
  title: string
  /**
   * Card content
   */
  children: React.ReactNode
}

/**
 * Consistent card component for settings sections
 */
export function SettingsCard({ title, children }: SettingsCardProps) {
  return (
    <Card className="border border-border shadow-sm dark:border-muted dark:bg-background/80">
      <CardHeader className="px-5 py-4">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-5 py-4">{children}</CardContent>
    </Card>
  )
}

