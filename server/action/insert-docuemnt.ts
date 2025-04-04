import { FormValues } from "@/app/(dashboard)/components/add-task-dialog"

export async function insertDocument(formValues: FormValues) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const endpoint = "/api/upload"; // Changed to match what appears to be your API route

  try {
    // Format the data to match what your API expects
    const taskData = {
      task_title: formValues.title,
      task_description: formValues.description,
      task_type: formValues.type,
      task_origin: formValues.origin,
      task_priority: formValues.priority.charAt(0).toUpperCase() + formValues.priority.slice(1), // Capitalize first letter
      task_date_created: formValues.dateReceived.toISOString().split('T')[0], // Format as YYYY-MM-DD
      task_time_created: formValues.timeReceived + ":00", // Add seconds to match HH:MM:SS format
      task_due_date: formValues.dueDate.toISOString().split('T')[0] // Format as YYYY-MM-DD
      // task_creator_account_uuid and task_assigned_division are handled by the server from the token
    };

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
      credentials: "include", // Ensures cookies are sent
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      
      try {
        // Try to parse as JSON if possible
        errorData = JSON.parse(errorText);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // If not JSON, use the raw text
        errorData = { message: errorText };
      }
      
      console.error(`Document upload failed: Status ${response.status}`, errorData);
      throw new Error(
        `HTTP error! status: ${response.status}, details: ${JSON.stringify(errorData)}`
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error during document upload:", error);
    throw error;
  }
}