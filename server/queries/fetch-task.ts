import type { Task } from "@/lib/types";

/**
 * Represents possible API response structures for task data
 */
interface TasksResponse {
  tasks?: Task[];
  data?: Task[];
}

/**
 * Fetches tasks from the API endpoint with optimized error handling and response parsing
 * 
 * @returns Promise resolving to an array of Task objects
 * @throws Error if the fetch operation fails or environment is misconfigured
 */
export async function fetchTask(): Promise<Task[]> {
  // Retrieve base URL from environment variables
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  
  // Validate environment configuration
  if (!baseUrl) {
    throw new Error('Application URL environment variable is not configured');
  }
  
  // Construct the full API endpoint URL
  const url = `${baseUrl}/api/task`;

  try {
    // Implement request with AbortController for timeout capability
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache', // Prevent stale data issues
      },
      credentials: 'include', // Include authentication cookies
      signal: controller.signal
    });
    
    // Clear timeout once response is received
    clearTimeout(timeoutId);

    // Enhanced error handling with status code context
    if (!response.ok) {
      // Attempt to extract error message from response
      const errorText = await response.text();
      let errorMessage = `HTTP error! Status: ${response.status}`;
      
      try {
        // Parse error response if it's valid JSON
        const errorData = JSON.parse(errorText) as { message?: string };
        if (errorData?.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // If parsing fails, use the raw text if available
        if (errorText) {
          errorMessage += ` - ${errorText.substring(0, 100)}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    // Parse and normalize response data
    const data = await response.json() as Task[] | TasksResponse;
    
    // Extract tasks with type-safe approach
    let tasksArray: Task[];
    
    if (Array.isArray(data)) {
      tasksArray = data;
    } else if (data && typeof data === 'object') {
      // Use nullish coalescing for cleaner fallback logic
      tasksArray = data.tasks ?? data.data ?? [];
    } else {
      tasksArray = [];
    }
    
    // Sanitize and normalize task data
    return tasksArray.map(task => ({
      ...task,
      // Handle string representation of undefined
      dateCompleted: task.dateCompleted === 'undefined' ? undefined : task.dateCompleted,
    }));
    
  } catch (error) {
    // Enhanced error handling with specific context
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Request timeout: The server took too long to respond');
    }
    
    console.error('Failed to fetch tasks:', error);
    throw error instanceof Error 
      ? new Error(`Task fetch failed: ${error.message}`)
      : new Error('Unknown error occurred while fetching tasks');
  }
}