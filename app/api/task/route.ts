import { NextResponse } from 'next/server';
import { Query } from '@/lib/db/mysql-connection-helper';
import { getTokenFromCookie, verifyToken } from '@/lib/jwt';

export async function GET() {
    try {
        // Get the token from cookies
        const token = await getTokenFromCookie();
        
        // If no token exists, return unauthorized
        if (!token) {
            return NextResponse.json(
                { 
                    code: 'UNAUTHORIZED', 
                    message: 'No authentication token found' 
                }, 
                { status: 401 }
            );
        }

        // Verify the token and extract the division
        const tokenPayload = await verifyToken(token);
        
        // If token verification fails, return unauthorized
        if (!tokenPayload) {
            return NextResponse.json(
                { 
                    code: 'INVALID_TOKEN', 
                    message: 'Invalid authentication token' 
                }, 
                { status: 401 }
            );
        }

        // Get the division from the token payload
        const division = tokenPayload.division;

        // Prepare the query using template literal for division
        const tasksQuery = {
            query: `
                SELECT DISTINCT 
                    tt.task_uuid AS id, 
                    tt.task_title AS title, 
                    tt.task_description AS description, 
                    DATE_FORMAT(tt.task_due_date, '%d-%m-%Y') AS dueDate, 
                    CASE WHEN tt.task_is_completed = 1 THEN 'true' ELSE 'false' END AS completed, 
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

        // Execute the query
        const tasks = await Query(tasksQuery);

        // Return the tasks
        return NextResponse.json(
            { 
                code: 'SUCCESS',
                message: 'Tasks retrieved successfully',
                tasks: tasks  // Wrap the tasks in a 'tasks' key
            }, 
            { status: 200 }
        );

    } catch (error) {
        console.error('Error retrieving tasks:', error);
        
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
