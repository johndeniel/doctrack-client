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
 * Unified interface for document data.
 * Both the document creator's ID (account_uuid) and the current user's ID (currentUserId)
 * are expected to be provided (if not, they default to empty strings).
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
  account_uuid: string;
  currentUserId: string;
}

/**
 * DocumentActivityPage Component
 * Displays document details, activity timeline, and data entry form.
 */
export default function DocumentActivityPage() {
  // Get document ID from URL parameters.
  const params = useParams();
  const documentId = useMemo(
    () => (Array.isArray(params.id) ? params.id[0] : params.id),
    [params.id]
  );

  // State management.
  const [bannerData, setBannerData] = useState<BannerData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [canDelete, setCanDelete] = useState<boolean>(false);

  /**
   * Parses date strings in various formats.
   * @param dateString - String representation of date.
   * @returns Parsed Date object.
   */
  const parseDate = useCallback((dateString: string): Date => {
    if (!dateString || dateString === "undefined") {
      return new Date();
    }
    try {
      // dd-MM-yyyy format.
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
        return parse(dateString, "dd-MM-yyyy", new Date());
      }
      // Month dd, yyyy format (e.g., "April 15, 2025").
      if (/^[A-Za-z]+ \d{1,2}, \d{4}$/.test(dateString)) {
        return parse(dateString, "MMMM d, yyyy", new Date());
      }
      // Fallback to standard Date parsing.
      return new Date(dateString);
    } catch (err) {
      console.error("Error parsing date:", dateString, err);
      return new Date();
    }
  }, []);

  /**
   * Determines document completion status based on dates.
   * @param task - Document data.
   * @returns Completion status string.
   */
  const getCompletionStatus = useCallback(
    (task: UnifiedDocumentData): CompletionStatus => {
      const isCompleted =
        task.dateCompleted && task.dateCompleted !== "undefined";
      const dueDate = parseDate(task.dueDate);

      if (!isCompleted) {
        const isOverdue = isPast(dueDate) && !isToday(dueDate);
        return isOverdue ? "overdue" : "active";
      }

      const completedDate = parseDate(task.dateCompleted);
      const completedOnTime =
        isBefore(completedDate, dueDate) || isSameDay(completedDate, dueDate);

      return completedOnTime ? "completed on time" : "completed late";
    },
    [parseDate]
  );

  /**
   * Fetch banner data on component mount.
   * It is assumed that the API returns both account_uuid (creator's ID)
   * and, if available, currentUserId.
   */
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

  // Sample data for fallback/testing.
  const today = useMemo(() => format(new Date(), "MMMM d, yyyy"), []);
  const pastDate = useMemo(
    () => format(new Date(2025, 3, 5), "MMMM d, yyyy"),
    []
  ); // April 5, 2025

  const sampleDocumentData = useMemo(
    () => ({
      title: "Q1 Financial Report 2025",
      description:
        "Quarterly financial analysis and performance metrics for stakeholders",
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
      account_uuid: "", // Document creator's ID.
      currentUserId: "", // Current user's ID.
    }),
    [today, pastDate]
  );

  // Map banner data to unified format or use sample data.
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
        account_uuid: bannerData.account_uuid || "",
        // Use a type assertion here so that if currentUserId is not provided in BannerData,
        // it falls back to an empty string.
        currentUserId: (bannerData as BannerData & { currentUserId?: string })
          .currentUserId || "",
      };
    }
    return sampleDocumentData;
  }, [bannerData, sampleDocumentData]);

  // Update document status based on dates.
  documentData.status = getCompletionStatus(documentData);

  /**
   * Evaluate delete permission by comparing the document's creator ID
   * (account_uuid) with the current user's ID (currentUserId).
   * The comparison is performed in a case-insensitive and trimmed manner.
   */
  useEffect(() => {
    if (documentData.currentUserId && documentData.account_uuid) {
      const normalizedCurrentUserId = documentData.currentUserId;
      const normalizedAccountUUID = documentData.account_uuid;
      setCanDelete(normalizedCurrentUserId === normalizedAccountUUID);
    }
  }, [documentData.currentUserId, documentData.account_uuid]);

  /**
   * Handler for document completion.
   */
  const handleComplete = useCallback(async () => {
    try {
      // API integration would go here.
      console.log("Document marked as complete");
    } catch (error) {
      console.error("Error completing document:", error);
    }
  }, []);

  /**
   * Handler for document deletion.
   */
  const handleDelete = useCallback(async () => {
    if (!canDelete) {
      console.error("User does not have permission to delete this document");
      return;
    }
    try {
      if (
        window.confirm(
          "Are you sure you want to delete this document? This action cannot be undone."
        )
      ) {
        // API integration would go here.
        console.log("Document deletion requested");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  }, [canDelete]);

  // Document metadata fields for rendering.
  const metadataFields = useMemo(
    () => [
      { icon: <FileText className="h-3.5 w-3.5" />, label: "Document Type", value: documentData.type },
      { icon: <Building className="h-3.5 w-3.5" />, label: "Origin", value: documentData.origin },
      { icon: <AlertTriangle className="h-3.5 w-3.5" />, label: "Priority", value: documentData.priority },
      { icon: <Tag className="h-3.5 w-3.5" />, label: "Status", value: documentData.status },
      { icon: <Calendar className="h-3.5 w-3.5" />, label: "Date Received", value: documentData.dateReceived },
      { icon: <Clock className="h-3.5 w-3.5" />, label: "Time Received", value: documentData.timeReceived },
      { icon: <Calendar className="h-3.5 w-3.5" />, label: "Due Date", value: documentData.dueDate },
    ],
    [documentData]
  );

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
            {metadataFields.map((field, index) => (
              <div key={`metadata-${index}`} className="flex items-start gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full">
                  {field.icon}
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground dark:text-gray-400">
                    {field.label}
                  </p>
                  <p className="text-sm font-medium mt-1.5 leading-tight">
                    {field.value}
                  </p>
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
                <p className="text-sm font-medium mt-1.5 leading-tight">
                  {documentData.uploadedBy}
                </p>
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
                  
                  {canDelete && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleDelete}
                      className="w-full h-10 text-sm font-medium justify-center text-red-500 hover:text-red-600 border-red-200 dark:border-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Document
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
