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

       // Extract account identifier from validated token
       const account_uuid = tokenPayload.id;

       // Define SQL query to fetch user profile data
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

       // Execute database query
       const result = await Query(profile);

       // Return successful response with profile data
       return NextResponse.json(
           { 
               code: 'SUCCESS',
               message: 'Profile data retrieved successfully',
               result: result
           }, 
           { status: 200 }
       );

   } catch (error) {
       console.error('Error retrieving profile data:', error);
       
       // Return error response with appropriate details
       return NextResponse.json(
           { 
               code: 'PROFILE_RETRIEVAL_ERROR', 
               message: 'Failed to retrieve profile data',
               error: error instanceof Error ? error.message : 'Unknown error'
           }, 
           { status: 500 }
       );
   }
}
