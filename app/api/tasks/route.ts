import { NextResponse } from 'next/server';
import { Query } from '@/lib/db/mysql-connection-helper';
import { getTokenFromCookie, verifyToken } from '@/lib/jwt';

interface Task {
 id: string;
 title: string;
 description: string;
 dueDate: string;
 dateCompleted: string;
 priority: string;
}

interface ApiResponse {
 code: string;
 message: string;
 tasks?: Task[];
 error?: string;
}

export async function GET(): Promise<NextResponse> {
 try {
   const token = await getTokenFromCookie();
   
   if (!token) {
     return createResponse('UNAUTHORIZED', 'No authentication token found', 401);
   }

   const tokenPayload = await verifyToken(token);
   
   if (!tokenPayload?.division) {
     return createResponse('INVALID_TOKEN', 'Invalid or insufficient authentication token', 401);
   }

   const tasks = await fetchTasksByDivision(tokenPayload.division);
   return createResponse('SUCCESS', 'Tasks retrieved successfully', 200, { tasks });
   
 } catch (error) {
   console.error('Task retrieval error:', error);
   return createResponse(
     'TASKS_ERROR', 
     'Failed to retrieve tasks', 
     500
   );
 }
}

function createResponse(
 code: string, 
 message: string, 
 status: number, 
 data?: { tasks?: Task[], error?: string }
): NextResponse {
 const responseBody: ApiResponse = { code, message };
 
 if (data?.tasks) responseBody.tasks = data.tasks;
 if (data?.error) responseBody.error = data.error;
 
 return NextResponse.json(responseBody, { status });
}

async function fetchTasksByDivision(divisionId: string): Promise<Task[]> {
 const query = {
   query: `
     SELECT DISTINCT 
       tt.task_uuid AS id, 
       tt.task_title AS title, 
       tt.task_description AS description, 
       DATE_FORMAT(tt.task_due_date, '%d-%m-%Y') AS dueDate, 
       CASE 
         WHEN tt.task_completed_timestamp IS NULL THEN 'undefined' 
         ELSE DATE_FORMAT(tt.task_completed_timestamp, '%d-%m-%Y') 
       END AS dateCompleted,
       tt.task_priority AS priority 
     FROM task_ticket tt 
     INNER JOIN task_collaboration_timeline ct ON tt.task_uuid = ct.task_uuid 
     WHERE ct.designation_division = ?
   `,
   values: [divisionId]
 };

 return await Query(query) as Task[];
}