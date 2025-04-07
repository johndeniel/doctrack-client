import { NextResponse } from 'next/server';
import { Query } from '@/lib/db/mysql-connection-helper';
import { getTokenFromCookie, verifyToken } from '@/lib/jwt';

interface ProfileData {
  name: string;
  username: string;
  division: string;
  avatarUrl: string;
}

export async function GET() {
  try {
    const token = await getTokenFromCookie();
    
    if (!token) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'No authentication token found' }, 
        { status: 401 }
      );
    }

    const tokenPayload = await verifyToken(token);
    
    if (!tokenPayload) {
      return NextResponse.json(
        { code: 'INVALID_TOKEN', message: 'Invalid authentication token' }, 
        { status: 401 }
      );
    }

    const profileData = await getUserProfile(tokenPayload.id);
    
    return NextResponse.json({
      code: 'SUCCESS',
      message: 'Profile data retrieved successfully',
      result: profileData
    });
    
  } catch (error) {
    console.error('Profile retrieval error:', error);
    return NextResponse.json(
      { code: 'PROFILE_ERROR', message: 'Failed to retrieve profile data' }, 
      { status: 500 }
    );
  }
}

async function getUserProfile(accountId: string): Promise<ProfileData[]> {
  const query = {
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
        ua.account_uuid = ?
    `,
    values: [accountId]
  };

  return await Query(query) as ProfileData[];
}