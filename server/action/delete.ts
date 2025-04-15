export async function deleteDocument(taskUuid: string) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    const endpoint = "/api/delete"
  
    try {
      const response = await fetch(`${baseUrl}${endpoint}?taskUuid=${taskUuid}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
  
      const result = await response.json()
  
      if (!response.ok) {
        // Log deletion error with status code for debugging purposes
        console.error(`Task deletion failed: Status ${response.status}`, result)
        
        throw new Error(
          `HTTP error! status: ${response.status}, details: ${JSON.stringify(result)}`
        )
      }
      
      return result
    } catch (error) {
      console.error("Error during task deletion:", error)
      throw error
    }
  }