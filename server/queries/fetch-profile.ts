import type { ProfileInfoProps } from "@/app/settings/components/profile-info"

export async function fetchProfile(): Promise<ProfileInfoProps[]> {
 const baseUrl = process.env.NEXT_PUBLIC_APP_URL
 const endpoint = "/api/profile"

 try {
   const response = await fetch(`${baseUrl}${endpoint}`)

   if (!response.ok) {
     throw new Error(`HTTP error! status: ${response.status}`)
   }

   const data = await response.json()

   // Validate response structure and return profile data if successful
   if (data.code === "SUCCESS" && data.result) {
     return data.result
   } else {
     throw new Error(data.message || "Failed to fetch profile")
   }
 } catch (error) {
   console.error("Failed to fetch profile:", error)
   throw error
 }
}