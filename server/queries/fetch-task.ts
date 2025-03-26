import type { Task } from "@/lib/types"
export async function fetchTask(): Promise<Task[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  const endpoint = '/api/task'

  try {
    const response = await fetch(`${baseUrl}${endpoint}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    // Check the structure of the data
    console.log('Received data:', data)

    // Handle different possible response structures
    let tasksArray: any[] = [];
    
    if (Array.isArray(data)) {
      // If data is directly an array
      tasksArray = data;
    } else if (data.tasks && Array.isArray(data.tasks)) {
      // If data has a 'tasks' key with an array
      tasksArray = data.tasks;
    } else if (data.data && Array.isArray(data.data)) {
      // If data has a 'data' key with an array
      tasksArray = data.data;
    } else {
      // If no array is found, throw an error
      throw new Error('Unexpected data structure: No tasks array found')
    }

    // Process the tasks array
    const processedTasks = tasksArray.map((task: any) => ({
      ...task,
      completed: task.completed === 'true', // convert string 'true'/'false' to boolean
      dateCompleted: task.dateCompleted === 'undefined' ? undefined : task.dateCompleted,
      priority: task.priority?.toLowerCase() // ensure priority is lowercase, with optional chaining
    }))

    return processedTasks
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
    throw error
  }
}