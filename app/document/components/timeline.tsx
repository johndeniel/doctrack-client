import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Timeline as TimelineComponent,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const items = [
  {
    id: 1,
    date: "April 5, 2025 • 09:45 AM",
    title: "Sarah Johnson",
    action: "uploaded document",
    description:
      "Initial upload of Q1 Financial Report 2025 for review.",
    image: "/avatar-40-01.jpg",
  },
  {
    id: 2,
    date: "April 5, 2025 • 10:30 AM",
    title: "Michael Chen",
    action: "started review",
    description: "Started preliminary review of financial data and performance metrics.",
    image: "/avatar-40-02.jpg",
  },
  {
    id: 3,
    date: "April 6, 2025 • 02:15 PM",
    title: "Emma Davis",
    action: "added comment",
    description:
      "Please verify the Q1 revenue projections on page 12. The numbers seem inconsistent with our previous forecasts.",
    image: "/avatar-40-03.jpg",
  },
  {
    id: 4,
    date: "April 7, 2025 • 11:20 AM",
    title: "Alex Morgan",
    action: "updated document",
    description:
      "Revised revenue projections and added explanatory notes as requested.",
    image: "/avatar-40-05.jpg",
  },
]

export function Timeline() {
  return (
    <ScrollArea className="h-[520px]">
      <div className="p-6">
        <div className="max-w-3xl">
          <TimelineComponent>
            {items.map((item) => (
              <TimelineItem
                key={item.id}
                step={item.id}
                className="group-data-[orientation=vertical]/timeline:ms-10 group-data-[orientation=vertical]/timeline:not-last:pb-8 hover:bg-muted/5 transition-colors rounded-lg -mx-1 px-3 py-3"
              >
                <TimelineHeader>
                  <TimelineSeparator className="group-data-[orientation=vertical]/timeline:-left-7 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.75rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-7" />
                  <TimelineTitle className="flex items-center gap-2.5 text-base font-medium">
                    {item.title}
                    <span className="text-muted-foreground text-sm font-normal">
                      {item.action}
                    </span>
                  </TimelineTitle>
                  <TimelineIndicator className="bg-primary/10 group-data-completed/timeline-item:bg-primary group-data-completed/timeline-item:text-primary-foreground flex size-8 items-center justify-center border-none group-data-[orientation=vertical]/timeline:-left-7">
                    <Avatar className="size-8 rounded-full">
                      <AvatarImage src={item.image} alt={item.title} />
                      <AvatarFallback className="size-8 rounded-full">
                        {item.title
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </TimelineIndicator>
                </TimelineHeader>
                <TimelineContent className="text-foreground mt-3 rounded-lg border border-gray-200 dark:border-black bg-background px-5 py-4 shadow-sm ">
                  <p className="text-sm leading-relaxed">{item.description}</p>
                  <div className="mt-3">
                    <TimelineDate className="mb-0 text-xs font-medium text-muted-foreground">
                      {item.date}
                    </TimelineDate>
                  </div>
                </TimelineContent>
              </TimelineItem>
            ))}
          </TimelineComponent>
        </div>
      </div>
    </ScrollArea>
  )
}
