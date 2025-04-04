import { NextResponse } from 'next/server';
import { Query } from '@/lib/db/mysql-connection-helper';
import { getTokenFromCookie, verifyToken } from '@/lib/jwt';

export async function GET() {
   try {
       // Retrieve authentication token from cookies
       const token = await getTokenFromCookie();
       
       // Return 401 response if token is not present
       if (!token) {
           return NextResponse.json(
               { 
                   code: 'UNAUTHORIZED', 
                   message: 'No authentication token found' 
               }, 
               { status: 401 }
           );
       }

       // Validate token and extract payload
       const tokenPayload = await verifyToken(token);
       
       // Return 401 response if token validation fails
       if (!tokenPayload) {
           return NextResponse.json(
               { 
                   code: 'INVALID_TOKEN', 
                   message: 'Invalid authentication token' 
               }, 
               { status: 401 }
           );
       }

       // Extract division identifier from token payload
       const division = tokenPayload.division;

       // Define SQL query to fetch tasks for the specified division
       const tasksQuery = {
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
               WHERE ct.designation_division = '${division}'
           `
       };

       // Execute database query
       const tasks = await Query(tasksQuery);

       // Return successful response with tasks data
       return NextResponse.json(
           { 
               code: 'SUCCESS',
               message: 'Tasks retrieved successfully',
               tasks: tasks
           }, 
           { status: 200 }
       );

   } catch (error) {
       console.error('Error retrieving tasks:', error);
       
       // Return error response with appropriate details
       return NextResponse.json(
           { 
               code: 'TASKS_RETRIEVAL_ERROR', 
               message: 'Failed to retrieve tasks',
               error: error instanceof Error ? error.message : 'Unknown error'
           }, 
           { status: 500 }
       );
   }
}
