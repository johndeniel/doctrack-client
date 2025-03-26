"use client"

import { Toaster } from "@/components/ui/sonner";
import { useRouter } from "next/navigation"
import { GradientBackgroundEffect } from '@/components/gradient-background'
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
      <main className="relative h-full w-full items-center justify-center bg-white bg-dot-black/[0.2] sm:container dark:bg-black dark:bg-dot-white/[0.2]">
        <GradientBackgroundEffect />
        <div className="relative h-full min-h-screen p-4 md:p-8">
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
          <FloatingDock
            items={links.map((link) => ({
              ...link,
              onClick: () => router.push(link.href),
            }))}
            desktopClassName="fixed bottom-8 left-1/2 transform -translate-x-1/2"
            mobileClassName="fixed bottom-4 left-1/2 transform -translate-x-1/2"
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