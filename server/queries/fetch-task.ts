import type { Task } from "@/lib/types"

export async function fetchTask(): Promise<Task[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  const endpoint = '/api/task'

  try {
    const response = await fetch(`${baseUrl}${endpoint}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: Task[] = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching batches:', error)
    throw error
  }
}