"use client"

import { useState } from "react"
import { GradientBackgroundEffect } from '@/components/gradient-background';
import { FloatingDock } from "@/components/ui/floating-dock"
import { IconUsers, IconUserPlus } from "@tabler/icons-react"
import { UsersAccount } from '@/components/users-account'
import { CreateAccount } from '@/components/create-account'

const links = [
  {
    title: "All Accounts",
    icon: <IconUsers className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
    href: "#",
    view: "all-accounts",
  },
  {
    title: "Create Account",
    icon: <IconUserPlus className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
    href: "#",
    view: "create-account",
  },
]

export default function Home() {
  const [currentView, setCurrentView] = useState("all-accounts")

  const handleViewChange = (view: string) => {
    setCurrentView(view)
  }

  const renderView = () => {
    switch (currentView) {
      case "all-accounts":
        return <UsersAccount />
      case "create-account":
        return <CreateAccount />
      default:
        return <UsersAccount />
    }
  }

  return (
      <main className="relative h-full w-full items-center justify-center bg-white bg-dot-black/[0.2] sm:container dark:bg-black dark:bg-dot-white/[0.2]">
        <GradientBackgroundEffect />
        <div className="relative min-h-screen p-4 md:p-8">
          {renderView()}

          <FloatingDock
            items={links.map((link) => ({
              ...link,
              onClick: () => handleViewChange(link.view),
            }))}
            desktopClassName="fixed bottom-8 left-1/2 transform -translate-x-1/2"
            mobileClassName="fixed bottom-4 left-1/2 transform -translate-x-1/2"
          />
        </div>
      </main>
  );
}
