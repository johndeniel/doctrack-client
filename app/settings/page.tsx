"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { ProfileInfo } from "@/app/settings/components/profile-info"
import { PasswordForm } from "@/app/settings/components/password-form"
import { ThemeSelector } from "@/app/settings/components/theme-selector"
import { SettingsCard } from "@/app/settings/components/settings-card"
import { logoutUserAccount } from '@/server/action/logout'
import { fetchProfile } from '@/server/queries/fetch-profile'
import { useEffect, useState } from "react"

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState({
    avatarUrl: "/placeholder.svg?height=200&width=200",
    name: "Loading...",
    username: "loading",
    division: "Loading"
  })

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await fetchProfile()
        
        if (profileData && profileData.length > 0) {
          const firstProfile = profileData[0]
          setProfile({
            avatarUrl: firstProfile.avatarUrl || "/placeholder.svg?height=200&width=200",
            name: firstProfile.name || "Unknown",
            username: firstProfile.username || "unknown",
            division: firstProfile.division || "Unassigned"
          })
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast.error("Error", {
          description: "Failed to load profile. Please try again.",
        })
      }
    }

    loadProfile()
  }, [])

  const handleLogout = async () => {
    try {
      await logoutUserAccount();

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast.success("Logged out", {
        description: "You have been logged out successfully.",
      })
         
      // In a real app, you would clear auth state here
      setTimeout(() => {
        router.push("/login")
      }, 1000)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Error", {
        description:  "Failed to log out. Please try again.",
        action: {
          label: "Try Again",
          onClick: () => console.log("Undo"),
        },
      });
    }
  }

  return (
    <div className="container overflow-y-auto pb-24 max-w-xl py-10">
      <div className="mb-8">
        <h1 className="text-xl font-medium">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <div className="space-y-6">
        <SettingsCard title="Profile">
          <ProfileInfo
            avatarUrl={profile.avatarUrl}
            name={profile.name}
            username={profile.username}
            division={profile.division}
          />
        </SettingsCard>

        <SettingsCard title="Password">
          <PasswordForm />
        </SettingsCard>

        <SettingsCard title="Appearance">
          <ThemeSelector />
        </SettingsCard>

        <Separator className="my-6 dark:bg-muted" />

        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive dark:border-muted"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </div>
    </div>
  )
}