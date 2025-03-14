import { NextResponse } from 'next/server'
import { Query } from '@/lib/db/mysql-connection-helper'

// GET route to retrieve all user accounts
export async function GET() {
  try {
    // SQL query to fetch user accounts with their profile images
    const getAllUsersAccount = {
      query: `
        SELECT 
          ua.account_uuid,
          ua.account_legal_name,
          ua.account_username,
          ua.account_division_designation,
          ua.account_last_authentication_timestamp,
          ua.account_created_timestamp,
          ua.account_updated_timestamp,
          upi.profile_image_data
        FROM users_account ua
        LEFT JOIN users_profile_image upi ON ua.account_uuid = upi.account_uuid
      `,
      values: []
    };

    // Execute the query and await the results
    const results = await Query(getAllUsersAccount);

    // Return the results as a JSON response with CORS headers
    return NextResponse.json(results, { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Content-Type': 'application/json'
      },
    });
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error('Error fetching user accounts:', error);
    
    // Return an error response with CORS headers
    return NextResponse.json(
      { message: 'Failed to retrieve user accounts', error: error instanceof Error ? error.message : 'Unknown error' }, 
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Content-Type': 'application/json',
        },
      }
    );
  }
}