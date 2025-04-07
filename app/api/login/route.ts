import { NextRequest, NextResponse } from 'next/server';
import { Query } from '@/lib/db/mysql-connection-helper';
import { generateToken, setTokenCookie } from '@/lib/jwt';
import * as argon2 from 'argon2';

// TypeScript interfaces
interface LoginRequestBody {
  username: string;
  password: string;
}

interface UserRecord {
  account_uuid: string;
  account_username: string;
  account_password_hash: string;
  account_division_designation: string;
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json() as LoginRequestBody;

    // Input validation
    if (!username || !password) {
      return NextResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await getUserByUsername(username);
    if (!user) {
      return NextResponse.json(
        { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await argon2.verify(user.account_password_hash, password);
    if (!isValid) {
      return NextResponse.json(
        { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate token and update last login
    const token = await generateToken({
      id: user.account_uuid,
      username: user.account_username,
      division: user.account_division_designation
    });

    await updateLastAuthTime(user.account_uuid);
    await setTokenCookie(token);

    return NextResponse.json({
      code: 'AUTHENTICATION_SUCCESS',
      message: 'Authentication successful',
      user: {
        id: user.account_uuid,
        username: user.account_username,
        division_designation: user.account_division_designation
      }
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { 
        code: 'AUTHENTICATION_ERROR', 
        message: 'Authentication failed'
      },
      { status: 500 }
    );
  }
}

// Helper functions
async function getUserByUsername(username: string): Promise<UserRecord | null> {
  try {
    await Query({ query: 'BEGIN' });
    const result = await Query({
      query:
        'SELECT account_uuid, account_username, account_password_hash, account_division_designation FROM users_account WHERE account_username = ?',
      values: [username]
    }) as UserRecord[];
    
    if (!result?.length) {
      await Query({ query: 'ROLLBACK' });
      return null;
    }
    
    return result[0];
  } catch (error) {
    await Query({ query: 'ROLLBACK' });
    throw error;
  }
}

async function updateLastAuthTime(userId: string): Promise<void> {
  try {
    await Query({
      query: 'UPDATE users_account SET account_last_authentication_timestamp = CURRENT_TIMESTAMP WHERE account_uuid = ?',
      values: [userId]
    });
    await Query({ query: 'COMMIT' });
  } catch (error) {
    await Query({ query: 'ROLLBACK' });
    throw error;
  }
}