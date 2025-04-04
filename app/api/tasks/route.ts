// app/task/route.ts
import { NextResponse } from 'next/server';
import { Query } from '@/lib/db/mysql-connection-helper';
import { getTokenFromCookie, verifyToken } from '@/lib/jwt';

/**
 * GET endpoint to retrieve tasks for an authenticated user's division
 * @returns JSON response with tasks data or error details
 */
export async function GET(): Promise<NextResponse> {
  try {
    // Authenticate request with token from cookies
    const token = await getTokenFromCookie();
    
    if (!token) {
      return createErrorResponse(401, 'UNAUTHORIZED', 'No authentication token found');
    }

    // Verify token and extract user information
    const tokenPayload = await verifyToken(token);
    
    if (!tokenPayload?.division) {
      return createErrorResponse(401, 'INVALID_TOKEN', 'Invalid or insufficient authentication token');
    }

    // Retrieve tasks for the user's division
    const divisionId = tokenPayload.division;
    const tasks = await fetchTasksByDivision(divisionId);

    // Return successful response with tasks data
    return NextResponse.json(
      {
        code: 'SUCCESS',
        message: 'Tasks retrieved successfully',
        tasks
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error retrieving tasks:', error);
    
    return createErrorResponse(
      500, 
      'TASKS_RETRIEVAL_ERROR', 
      'Failed to retrieve tasks',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * Creates a standardized error response
 */
function createErrorResponse(
  status: number, 
  code: string, 
  message: string, 
  errorDetail?: string
): NextResponse {
  const responseBody: Record<string, unknown> = { code, message };
  
  if (errorDetail) {
    responseBody.error = errorDetail;
  }
  
  return NextResponse.json(responseBody, { status });
}

/**
 * Fetches tasks for a specific division from the database
 */
async function fetchTasksByDivision(divisionId: string) {
  // Use parameterized query to prevent SQL injection
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
      WHERE ct.designation_division = ?
    `,
    values: [divisionId]
  };

  return await Query(tasksQuery);
}