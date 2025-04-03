export async function logoutUserAccount() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    const endpoint = "/api/logout"
   
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })
   
      if (!response.ok) {
        // Failed logout response - throw error with status information
        throw new Error(`Logout failed with status: ${response.status}`)
      }
      
      return true
    } catch (error) {
      console.error("Error during logout process:", error)
      throw error
    }
}