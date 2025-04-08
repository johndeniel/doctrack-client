import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

const items = [
  {
    id: 1,
    date: "April 5, 2025 • 09:45 AM",
    title: "Sarah Johnson",
    action: "uploaded document",
    description: "Initial upload of Q1 Financial Report 2025 for review.",
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
    description: "Revised revenue projections and added explanatory notes as requested.",
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
                className="group-data-[orientation=vertical]/timeline:ms-12 group-data-[orientation=vertical]/timeline:not-last:pb-7 hover:bg-muted/5 transition-colors rounded-lg px-3 py-2.5"
              >
                <TimelineHeader>
                  <TimelineSeparator 
                    className="group-data-[orientation=vertical]/timeline:-left-[3.25rem] group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-6"
                    style={{ width: "3px" }}
                  />
                  <TimelineTitle className="flex items-center gap-2 text-base font-medium">
                    {item.title}
                    <span className="text-muted-foreground text-sm font-normal">{item.action}</span>
                  </TimelineTitle>
                  <TimelineIndicator 
                    className="group-data-completed/timeline-item:bg-transparent group-data-[orientation=vertical]/timeline:-left-[3.25rem] border-0 p-0 flex items-center justify-center"
                    style={{ width: "48px", height: "48px" }}
                  >
                    <Avatar className="h-12 w-12 border-3 border-background shadow-md">
                      <AvatarImage src={item.image} alt={item.title} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                        {item.title
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </TimelineIndicator>
                </TimelineHeader>
                <TimelineContent className="text-foreground mt-3 rounded-lg border px-5 py-4 shadow-sm">
                  <p className="text-sm leading-relaxed">{item.description}</p>
                  <div className="mt-2">
                    <TimelineDate className="mb-0 text-xs font-medium text-muted-foreground">{item.date}</TimelineDate>
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