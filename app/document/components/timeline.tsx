"use client";

import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Timeline as TimelineComponent,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchTimeline } from "@/server/queries/fetch-timeline";

interface TimelineProps {
  documentId?: string;
}

interface CollaborationData {
  task_collaboration_timeline_uuid: string;
  account_legal_name: string;
  profile_image_data: string;
  remarks: string;
  collaboration_created_timestamp: string;
  collaboration_action_type: string;
  designation_division: string;
}

export function Timeline({ documentId }: TimelineProps) {
  const [timelineItems, setTimelineItems] = useState<CollaborationData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getTimelineData = async () => {
      try {
        if (documentId) {
          const data = await fetchTimeline(documentId);
          console.log(data);
          // Check if the response data exists
          if (data) {
            // The issue is here - you're wrapping data in an array
            setTimelineItems(Array.isArray(data) ? data : [data]);
          } else {
            setError("No timeline data available.");
          }
        }
      } catch (err) {
        console.error("Error fetching timeline data:", err);
        setError("Failed to fetch timeline data.");
      } finally {
        setLoading(false);
      }
    };
  
    getTimelineData();
  }, [documentId]);

  if (loading) {
    return <div className="p-6">Loading timeline...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <ScrollArea className="h-[520px]">
      <div className="p-6">
        <div className="max-w-3xl">
          {timelineItems.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">
              No timeline events found
            </div>
          ) : (
            <TimelineComponent>
              {timelineItems.map((item, index) => (
                <TimelineItem
                  key={item.task_collaboration_timeline_uuid || index}
                  step={index + 1}
                  className="group-data-[orientation=vertical]/timeline:ms-10 group-data-[orientation=vertical]/timeline:not-last:pb-8 hover:bg-muted/5 transition-colors rounded-lg -mx-1 px-3 py-3"
                >
                  <TimelineHeader>
                    <TimelineSeparator className="group-data-[orientation=vertical]/timeline:-left-7 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.75rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-7" />
                    <TimelineTitle className="flex items-center gap-2.5 text-base font-medium">
                      {item.account_legal_name}
                      <span className="text-muted-foreground text-sm font-normal">
                        {item.collaboration_action_type}
                      </span>
                    </TimelineTitle>
                    <TimelineIndicator className="bg-primary/10 group-data-completed/timeline-item:bg-primary group-data-completed/timeline-item:text-primary-foreground flex size-8 items-center justify-center border-none group-data-[orientation=vertical]/timeline:-left-7">
                      <Avatar className="size-8 rounded-full">
                        {item.profile_image_data ? (
                          <AvatarImage src={item.profile_image_data} alt={item.account_legal_name} />
                        ) : null}
                        <AvatarFallback className="size-8 rounded-full">
                          {item.account_legal_name && typeof item.account_legal_name === "string"
                            ? item.account_legal_name
                                .split(" ")
                                .map((n) => (n ? n[0] : ""))
                                .join("")
                            : "?"}
                        </AvatarFallback>
                      </Avatar>
                    </TimelineIndicator>
                  </TimelineHeader>
                  <TimelineContent className="text-foreground mt-3 rounded-lg border border-gray-200 dark:border-black bg-background px-5 py-4 shadow-sm ">
                    <p className="text-sm leading-relaxed">
                      {item.remarks}
                    </p>
                    <div className="mt-3">
                      <TimelineDate className="mb-0 text-xs font-medium text-muted-foreground">
                        {item.collaboration_created_timestamp}
                      </TimelineDate>
                    </div>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </TimelineComponent>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}