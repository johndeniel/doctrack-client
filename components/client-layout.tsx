"use client"

import { Toaster } from "@/components/ui/sonner";
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils";
import { FloatingDock } from "@/components/ui/floating-dock"
import { IconUsers, IconUserPlus } from "@tabler/icons-react"
import { ThemeProvider } from "@/components/theme-provider"

const links = [
  {
    title: "All Accounts",
    icon: <IconUsers className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
    href: "/",
    view: "all-accounts",
  },
  {
    title: "Create Account",
    icon: <IconUserPlus className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
    href: "/create-user-account",
    view: "create-account",
  },
]

export function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter()

  return (
    <>
      <main className="relative min-h-screen w-full bg-white dark:bg-black">
        {/* Dot pattern background */}
        <div
          className={cn(
            "absolute inset-0",
            "[background-size:20px_20px]",
            "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]",
            "dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]",
          )}
          aria-hidden="true"
        />

        {/* Radial gradient overlay */}
        <div
          className="pointer-events-none absolute inset-0 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"
          aria-hidden="true"
        />

        {/* Content container */}
        <div className="relative z-10 mx-auto h-full max-w-7xl p-4 md:p-8">
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>

          {/* Navigation dock */}
          <FloatingDock
            items={links.map((link) => ({
              ...link,
              onClick: () => router.push(link.href),
            }))}
            desktopClassName="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
            mobileClassName="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
          />
        </div>
      </main>
      <Toaster
        toastOptions={{
          classNames: {
            toast:
              'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:pointer-events-auto',
          },
        }}
      />
    </>
  );
}