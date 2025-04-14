interface CollaborationData {
    task_collaboration_timeline_uuid: string;
    account_legal_name: string;
    profile_image_data: string;
    remarks: string;
    collaboration_created_timestamp: string;
    collaboration_action_type: string;
    designation_division: string;
  }

  
  interface TimelineResponse {
    code: string;
    message: string;
    result: CollaborationData;
  }
  
  export async function fetchTimeline(taskId: string): Promise<CollaborationData> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    const endpoint =  `/api/timeline?taskUuid=${taskId}`;
      
    try {
      const response = await fetch(`${baseUrl}${endpoint}`);
      console.log(`Fetching URL: ${baseUrl}${endpoint}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TimelineResponse = await response.json();
      return data.result;
    } catch (error) {
      console.error('Error fetching banner data:', error);
      throw error;
    }
}