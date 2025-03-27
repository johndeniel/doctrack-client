"use client"

import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ProfileFormProps {
  /**
   * Initial username value
   */
  initialUsername: string
}

/**
 * Form for updating user profile information
 */
export function ProfileForm({ initialUsername }: ProfileFormProps) {

  const [username, setUsername] = React.useState(initialUsername)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast.success("Profile updated", {
        description: "Your profile has been updated successfully.",
      })
   
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Error", {
        description:  "Failed to update profile. Please try again.",
        action: {
          label: "Try Again",
          onClick: () => console.log("Undo"),
        },
      });
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username" className="text-sm">
          Username
        </Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="h-9"
          disabled={isSubmitting}
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" variant="outline" size="sm" className="h-8 px-3 text-xs font-medium" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  )
}
