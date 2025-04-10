interface BannerData {
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
    const endpoint = `/api/banner/${taskId}`;
    
    try {
      const response = await fetch(`${baseUrl}${endpoint}`);
      console.log(`fetching url: ${baseUrl}${endpoint}`);
      
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



  // SELECT
  //         t.task_uuid,
  //         t.task_title, 
  //         t.task_description,
  //         t.task_type,
  //         t.task_origin,
  //         t.task_priority,
  //         DATE_FORMAT(t.task_date_created, '%M %d, %Y') AS formatted_date,
  //         DATE_FORMAT(t.task_time_created, '%h:%i %p') AS formatted_time,
  //         DATE_FORMAT(t.task_due_date, '%M %d, %Y') AS task_due_date,
  //         CASE 
  //           WHEN t.task_completed_timestamp IS NULL THEN 'undefined' 
  //           ELSE DATE_FORMAT(t.task_completed_timestamp, '%d-%m-%Y') 
  //         END AS dateCompleted,
  //         u.account_legal_name,
  //         pi.profile_image_data
  //       FROM
  //         task_ticket t
  //       JOIN
  //         users_account u ON t.task_creator_account_uuid = u.account_uuid
  //       LEFT JOIN
  //         users_profile_image pi ON u.account_uuid = pi.account_uuid 
  //       WHERE t.task_uuid = ?