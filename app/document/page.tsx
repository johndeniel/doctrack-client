"use client"

import { Timeline } from "@/app/document/components/timeline"
import { DataEntryForm } from "@/app/document/components/data-entry-form"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Clock,
  Calendar,
  FileText,
  AlertTriangle,
  Tag,
  Building,
  MessageSquare,
  CheckCheck,
  Trash2,
} from "lucide-react"

export default function DocumentActivityPage() {
  // Document metadata
  const documentData = {
    title: "Q1 Financial Report 2025",
    description: "Quarterly financial analysis and performance metrics for stakeholders",
    type: "Financial Report",
    origin: "Finance Department",
    priority: "High",
    status: "In Review",
    dateReceived: "April 5, 2025",
    timeReceived: "09:45 AM",
    dueDate: "April 15, 2025",
    uploadedBy: "Sarah Johnson",
    uploadedByAvatar: "/avatar-40-01.jpg",
  }

  const handleComplete = () => {
    // Handle complete action
    console.log("Complete action triggered")
  }

  const handleDelete = () => {
    // Handle delete action
    console.log("Delete action triggered")
  }

  return (
    <div className="dark:bg-black dark:text-white">
      {/* Document Banner */}
      <div className="border-b dark:border-gray-800">
        <div className="container py-4">
          <div className="mb-4 flex flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-0.5 rounded"></div>
                <h1 className="text-xl font-bold tracking-tight">{documentData.title}</h1>
              </div>
              <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed pl-3 dark:text-gray-400">
                {documentData.description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-3 rounded-lg border dark:border-gray-800 p-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full">
                <FileText className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground dark:text-gray-400">Document Type</p>
                <p className="text-sm font-medium mt-1.5 leading-tight">{documentData.type}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full">
                <Building className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground dark:text-gray-400">Origin</p>
                <p className="text-sm font-medium mt-1.5 leading-tight">{documentData.origin}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full">
                <AlertTriangle className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground dark:text-gray-400">Priority</p>
                <p className="text-sm font-medium mt-1.5 leading-tight">{documentData.priority}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full">
                <Tag className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground dark:text-gray-400">Status</p>
                <p className="text-sm font-medium mt-1.5 leading-tight">{documentData.status}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full">
                <Calendar className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground dark:text-gray-400">Date Received</p>
                <p className="text-sm font-medium mt-1.5 leading-tight">{documentData.dateReceived}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full">
                <Clock className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground dark:text-gray-400">Time Received</p>
                <p className="text-sm font-medium mt-1.5 leading-tight">{documentData.timeReceived}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full">
                <Calendar className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground dark:text-gray-400">Due Date</p>
                <p className="text-sm font-medium mt-1.5 leading-tight">{documentData.dueDate}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Avatar className="h-7 w-7">
                <AvatarImage src={documentData.uploadedByAvatar} alt={documentData.uploadedBy} />
                <AvatarFallback className="text-xs dark:bg-gray-800">
                  {documentData.uploadedBy
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground dark:text-gray-400">Uploaded By</p>
                <p className="text-sm font-medium mt-1.5 leading-tight">{documentData.uploadedBy}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 py-6">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Document Activity Section (Left Aligned) */}
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <h2 className="text-lg font-semibold tracking-tight">Document Activity</h2>
                <div className="text-xs text-muted-foreground dark:text-gray-400 px-2.5 py-1 rounded-full ml-3">4 events</div>
              </div>
              <div className="rounded-lg border dark:border-gray-800 shadow-sm overflow-hidden">
                <Timeline />
              </div>
            </div>

            {/* Data Entry Section (Right Side) */}
            <div className="md:col-span-1 flex flex-col">
              <div className="flex items-center mb-4">
                <h2 className="text-lg font-semibold tracking-tight">Add Data</h2>
                <MessageSquare className="h-4 w-4 text-muted-foreground dark:text-gray-400 ml-3" />
              </div>

              {/* Main content area with form */}
              <div className="rounded-lg border dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-5">
                  <DataEntryForm />
                </div>
              </div>

              {/* Action buttons in footer */}
              <div className="mt-5 border-t dark:border-gray-800 pt-5">
                <div className="flex flex-col space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleComplete}
                    className="w-full h-10 text-sm font-medium justify-center dark:border-gray-700"
                  >
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Complete Document
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDelete}
                    className="w-full h-10 text-sm font-medium justify-center text-red-500 hover:text-red-600 border-red-200 dark:border-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Document
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}