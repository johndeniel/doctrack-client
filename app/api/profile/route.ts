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
        const account_uuid = tokenPayload.id;

        // Prepare the query using template literal for division
        const profile = {
            query: `
                            SELECT 
    ua.account_legal_name AS name, 
    ua.account_username AS username, 
    ua.account_division_designation AS division,
    upi.profile_image_data AS avatarUrl
FROM 
    users_account ua
JOIN 
    users_profile_image upi ON ua.account_uuid = upi.account_uuid
WHERE 
    ua.account_uuid = '${account_uuid}'
            `
        };

        // Execute the query
        const result = await Query(profile);

        // Return the tasks
        return NextResponse.json(
            { 
                code: 'SUCCESS',
                message: 'Tasks retrieved successfully',
                result: result  // Wrap the tasks in a 'tasks' key
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
