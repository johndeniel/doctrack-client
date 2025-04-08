import { ScrollArea } from "@/components/ui/scroll-area"
import { Timeline } from "@/app/document/components/timeline"

export function TimelineWithScroll() {
  return (
    <ScrollArea className="h-[520px]">
      <div className="p-6">
        <Timeline />
      </div>
    </ScrollArea>
  )
}