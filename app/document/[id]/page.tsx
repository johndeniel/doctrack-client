"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { Timeline } from "@/app/document/components/timeline";
import { DataEntryForm } from "@/app/document/components/data-entry-form";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "lucide-react";
import { fetchBanner, BannerData } from "@/server/queries/fetch-banner";
import { CompletionStatus } from "@/lib/types";
import { isPast, isToday, isBefore, isSameDay, parse, format } from "date-fns";

/**
 * Unified interface for document data
 */
interface UnifiedDocumentData {
  title: string;
  description: string;
  type: string;
  origin: string;
  priority: string;
  status: string;
  dateReceived: string;
  timeReceived: string;
  dueDate: string;
  uploadedBy: string;
  uploadedByAvatar: string;
  dateCompleted: string;
}

/**
 * DocumentActivityPage Component
 * Displays document details, activity timeline, and data entry form
 */
export default function DocumentActivityPage() {
  // Get document ID from URL parameters
  const params = useParams();
  const documentId = useMemo(() => 
    Array.isArray(params.id) ? params.id[0] : params.id, 
    [params.id]
  );

  // State management
  const [bannerData, setBannerData] = useState<BannerData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Parses date strings in various formats
   * @param dateString - String representation of date
   * @returns Parsed Date object
   */
  const parseDate = useCallback((dateString: string): Date => {
    if (!dateString || dateString === "undefined") {
      return new Date();
    }
    
    try {
      // dd-MM-yyyy format
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
        return parse(dateString, "dd-MM-yyyy", new Date());
      }
      
      // Month dd, yyyy format (e.g., "April 15, 2025")
      if (/^[A-Za-z]+ \d{1,2}, \d{4}$/.test(dateString)) {
        return parse(dateString, "MMMM d, yyyy", new Date());
      }
      
      // Fallback to standard Date parsing
      return new Date(dateString);
    } catch (err) {
      console.error("Error parsing date:", dateString, err);
      return new Date(); // Fallback to current date
    }
  }, []);
  
  /**
   * Determines document completion status based on dates
   * @param task - Document data
   * @returns Completion status string
   */
  const getCompletionStatus = useCallback((task: UnifiedDocumentData): CompletionStatus => {   
    const isCompleted = task.dateCompleted && task.dateCompleted !== "undefined";
    const dueDate = parseDate(task.dueDate);
    
    if (!isCompleted) {
      const isOverdue = isPast(dueDate) && !isToday(dueDate);
      return isOverdue ? "overdue" : "active";
    }
  
    const completedDate = parseDate(task.dateCompleted);
    const completedOnTime = isBefore(completedDate, dueDate) || isSameDay(completedDate, dueDate);
    
    return completedOnTime ? "completed on time" : "completed late";
  }, [parseDate]);

  // Fetch banner data on component mount
  useEffect(() => {
    const getBannerData = async () => {
      if (!documentId) {
        setLoading(false);
        return;
      }

      try {
        const data = await fetchBanner(documentId);
        setBannerData(data);
      } catch (err) {
        console.error("Error fetching banner data:", err);
        setError("Failed to fetch document data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    getBannerData();
  }, [documentId]);

  // Sample data for fallback/testing
  const today = useMemo(() => format(new Date(), "MMMM d, yyyy"), []);
  const pastDate = useMemo(() => format(new Date(2025, 3, 5), "MMMM d, yyyy"), []); // April 5, 2025
  
  const sampleDocumentData = useMemo(() => ({
    title: "Q1 Financial Report 2025",
    description: "Quarterly financial analysis and performance metrics for stakeholders",
    type: "Financial Report",
    origin: "Finance Department",
    priority: "High",
    status: "In Review",
    dateReceived: pastDate,
    timeReceived: "09:45 AM",
    dueDate: today,
    uploadedBy: "Sarah Johnson",
    uploadedByAvatar: "/avatar-40-01.jpg",
    dateCompleted: "undefined",
  }), [today, pastDate]);

  // Map banner data to unified format or use sample data
  const documentData: UnifiedDocumentData = useMemo(() => {
    if (bannerData) {
      return {
        title: bannerData.task_title,
        description: bannerData.task_description,
        type: bannerData.task_type,
        origin: bannerData.task_origin,
        priority: bannerData.task_priority,
        status: "",
        dateReceived: bannerData.formatted_date,
        timeReceived: bannerData.formatted_time,
        dueDate: bannerData.task_due_date,
        uploadedBy: bannerData.account_legal_name,
        uploadedByAvatar: bannerData.profile_image_data,
        dateCompleted: bannerData.dateCompleted || "undefined",
      };
    }
    return sampleDocumentData;
  }, [bannerData, sampleDocumentData]);
  
  // Update document status based on dates
  documentData.status = getCompletionStatus(documentData);

  // Handler functions
  const handleComplete = useCallback(() => {
    // Would integrate with API to update document status
    console.log("Document marked as complete");
    // Implementation would update the dateCompleted field and status
  }, []);

  const handleDelete = useCallback(() => {
    // Would integrate with API to delete the document
    console.log("Document deletion requested");
    // Implementation would handle document deletion with confirmation
  }, []);

  // Document metadata fields for rendering
  const metadataFields = useMemo(() => [
    { icon: <FileText className="h-3.5 w-3.5" />, label: "Document Type", value: documentData.type },
    { icon: <Building className="h-3.5 w-3.5" />, label: "Origin", value: documentData.origin },
    { icon: <AlertTriangle className="h-3.5 w-3.5" />, label: "Priority", value: documentData.priority },
    { icon: <Tag className="h-3.5 w-3.5" />, label: "Status", value: documentData.status },
    { icon: <Calendar className="h-3.5 w-3.5" />, label: "Date Received", value: documentData.dateReceived },
    { icon: <Clock className="h-3.5 w-3.5" />, label: "Time Received", value: documentData.timeReceived },
    { icon: <Calendar className="h-3.5 w-3.5" />, label: "Due Date", value: documentData.dueDate },
  ], [documentData]);

  return (
    <div className="dark:bg-black dark:text-white">
      {/* Document Banner */}
      <div className="border-b dark:border-gray-800">
        <div className="container py-4">
          {/* Document Title Section */}
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

          {/* Loading and Error States */}
          {loading && (
            <div className="p-2 flex justify-center">
              <div className="animate-pulse text-gray-500">Loading document data...</div>
            </div>
          )}
          {error && (
            <div className="p-2">
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md">
                {error}
              </div>
            </div>
          )}

          {/* Document Metadata Grid */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-3 rounded-lg border dark:border-gray-800 p-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
            {/* Metadata fields */}
            {metadataFields.map((field, index) => (
              <div key={`metadata-${index}`} className="flex items-start gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full">
                  {field.icon}
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground dark:text-gray-400">
                    {field.label}
                  </p>
                  <p className="text-sm font-medium mt-1.5 leading-tight">{field.value}</p>
                </div>
              </div>
            ))}

            {/* Uploaded By field (with avatar) */}
            <div className="flex items-start gap-3">
              <Avatar className="h-7 w-7">
                <AvatarImage src={documentData.uploadedByAvatar} alt={documentData.uploadedBy} />
                <AvatarFallback className="text-xs dark:bg-gray-800">
                  {documentData.uploadedBy.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground dark:text-gray-400">
                  Uploaded By
                </p>
                <p className="text-sm font-medium mt-1.5 leading-tight">{documentData.uploadedBy}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Document Activity and Data Entry Sections */}
      <main className="flex-1 py-6">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Document Activity Section (Left) */}
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <h2 className="text-lg font-semibold tracking-tight">Document Activity</h2>
                <div className="text-xs text-muted-foreground dark:text-gray-400 px-2.5 py-1 rounded-full ml-3">
                  4 events
                </div>
              </div>
              <div className="rounded-lg border dark:border-gray-800 shadow-sm overflow-hidden">
                <Timeline documentId={documentId} />
              </div>
            </div>

            {/* Data Entry Section (Right) */}
            <div className="md:col-span-1 flex flex-col">
              <div className="flex items-center mb-4">
                <h2 className="text-lg font-semibold tracking-tight">Add Data</h2>
                <MessageSquare className="h-4 w-4 text-muted-foreground dark:text-gray-400 ml-3" />
              </div>

              <div className="rounded-lg border dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-5">
                  <DataEntryForm />
                </div>
              </div>

              {/* Action Buttons */}
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
  );
}