import type { Task } from "@/lib/types";

/**
 * Defines possible API response structures for task data
 */
interface TasksResponse {
  tasks?: Task[];
  data?: Task[];
}

/**
 * Fetches tasks from the API endpoint
 * @returns Promise resolving to an array of Task objects
 * @throws Error if the fetch operation fails
 */
export async function fetchTask(): Promise<Task[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  
  if (!baseUrl) {
    throw new Error('Application URL environment variable is not configured');
  }
  
  const endpoint = '/api/task';
  const url = `${baseUrl}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      // Include credentials to ensure cookies are sent with the request
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null) as { message?: string } | null;
      throw new Error(
        errorData?.message || `HTTP error! Status: ${response.status}`
      );
    }

    const data = await response.json() as Task[] | TasksResponse;
    
    // Extract tasks from various possible response formats
    let tasksArray: Task[] = [];
    
    if (Array.isArray(data)) {
      tasksArray = data;
    } else if (typeof data === 'object' && data !== null) {
      const responseData = data as TasksResponse;
      if (Array.isArray(responseData.tasks)) {
        tasksArray = responseData.tasks;
      } else if (Array.isArray(responseData.data)) {
        tasksArray = responseData.data;
      }
    }
    
    if (tasksArray.length === 0) {
      throw new Error('Unexpected data structure: No tasks array found');
    }

    // Process the tasks array to handle special values
    return tasksArray.map(task => ({
      ...task,
      dateCompleted: task.dateCompleted === 'undefined' ? undefined : task.dateCompleted
    }));
    
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Unknown error occurred while fetching tasks');
  }
}