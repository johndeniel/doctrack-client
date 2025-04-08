"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, CheckCircle2 } from "lucide-react"

export function DataEntryForm() {
  const [remarks, setRemarks] = useState("")
  const [division, setDivision] = useState("")
  const [action, setAction] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    try {
      // In a real application, you would send the data to your API here
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsSuccess(true)
      setTimeout(() => {
        setIsSuccess(false)
        setRemarks("")
      }, 2000)
    } catch (error) {
      console.error("Error submitting data:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-lg border bg-background p-4">
        <Textarea
          placeholder="Enter your remarks or comments here..."
          className="min-h-[100px] resize-none border-0 p-0 focus-visible:ring-0 text-sm leading-relaxed"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />

        <div className="mt-4 flex flex-row items-center justify-between">
          <div className="flex space-x-3">
            <div className="w-[120px]">
              <Label htmlFor="action" className="sr-only">
                Action
              </Label>
              <div className="relative">
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger id="action" className="w-full border-0 bg-muted/50 text-xs h-9 px-3">
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="close">Close</SelectItem>
                    <SelectItem value="initial">Initial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="w-[120px]">
              <Label htmlFor="division" className="sr-only">
                Division
              </Label>
              <div className="relative">
                <Select value={division} onValueChange={setDivision}>
                  <SelectTrigger id="division" className="w-full border-0 bg-muted/50 text-xs h-9 px-3">
                    <SelectValue placeholder="Division" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ds1">DS1</SelectItem>
                    <SelectItem value="ds2">DS2</SelectItem>
                    <SelectItem value="ds3">DS3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || !remarks || !division || !action}
            className="rounded-full px-4 h-9 ml-auto text-xs font-medium"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Sending
              </span>
            ) : isSuccess ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Sent
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="h-3.5 w-3.5" />
                Send
              </span>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
