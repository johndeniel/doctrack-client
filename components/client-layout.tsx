"use client"

import { Toaster } from "@/components/ui/sonner";
import { useRouter } from "next/navigation"
import { FloatingDock } from "@/components/ui/floating-dock"
import { IconHome, IconCalendar, IconSettings } from "@tabler/icons-react"
import { ThemeProvider } from "@/components/theme-provider"

const links = [
  {
    title: "Home",
    icon: <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
    href: "/",
    view: "home",
  },
  {
    title: "Calendar",
    icon: <IconCalendar className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
    href: "/calendar",
    view: "calendar",
  },
  {
    title: "Settings",
    icon: <IconSettings className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
    href: "/settings",
    view: "settings",
  }
]

export function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter()

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <main className="flex-grow overflow-auto bg-white dark:bg-black">
        <div className="h-full w-full max-w-7xl mx-auto px-4 md:px-8">
          <ThemeProvider 
            attribute="class" 
            defaultTheme="system" 
            enableSystem 
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </div>
      </main>

      {/* Navigation dock */}
      <FloatingDock
        items={links.map((link) => ({
          ...link,
          onClick: () => router.push(link.href),
        }))}
        desktopClassName="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
        mobileClassName="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
      />
      
      <Toaster
        toastOptions={{
          classNames: {
            toast: `
              group toast 
              group-[.toaster]:bg-background 
              group-[.toaster]:text-foreground 
              group-[.toaster]:border-border 
              group-[.toaster]:shadow-lg 
              group-[.toaster]:pointer-events-auto
            `,
          },
        }}
      />
    </div>
  );
}
