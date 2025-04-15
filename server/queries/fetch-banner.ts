export interface BannerData {
    task_uuid: string;
    task_title: string;
    task_description: string;
    task_type: string;
    task_origin: string;
    task_priority: string;
    formatted_date: string;
    formatted_time: string;
    task_due_date: string;
    dateCompleted: string;
    account_legal_name: string;
    profile_image_data: string;
  } 
  
  interface BannerResponse {
    code: string;
    message: string;
    result: BannerData;
  }
  
  export async function fetchBanner(taskId: string): Promise<BannerData> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    const endpoint =  `/api/banner?taskUuid=${taskId}`;
      
    try {
      const response = await fetch(`${baseUrl}${endpoint}`);
      console.log(`Fetching URL: ${baseUrl}${endpoint}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BannerResponse = await response.json();
      return data.result;
    } catch (error) {
      console.error('Error fetching banner data:', error);
      throw error;
    }
}