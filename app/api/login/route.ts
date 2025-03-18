import { NextRequest, NextResponse } from 'next/server';
import { Query } from '@/lib/db/mysql-connection-helper';
import { generateToken, setTokenCookie } from '@/lib/jwt';
import * as argon2 from 'argon2';
import macaddress from 'macaddress';
import { UAParser } from 'ua-parser-js';

interface LoginRequestBody {
  username: string;
  password: string;
}

interface UserRecord {
  account_uuid: string;
  account_username: string;
  account_password_hash: string;
}

const MAX_DEVICE_IDENTIFIER_LENGTH = 100;

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    const { username, password } = requestData as LoginRequestBody;

    // Validate request payload: Ensure both username and password are provided
    if (!username || !password) {
      return NextResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'Username and password are required'
        },
        { status: 400 }
      );
    }

    // Start database transaction
    await Query({ query: 'BEGIN' });

    // Query the database for the user by username
    const findUserQuery = {
      query:
        'SELECT account_uuid, account_username, account_password_hash FROM users_account WHERE account_username = ?',
      values: [username]
    };

    const users = (await Query(findUserQuery)) as UserRecord[] | null;

    // If user is not found, rollback and return error response
    if (!users || users.length === 0) {
      await Query({ query: 'ROLLBACK' });
      return NextResponse.json(
        {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials'
        },
        { status: 401 }
      );
    }

    const user = users[0];

    // Verify the provided password against the stored hash
    const isPasswordValid = await argon2.verify(user.account_password_hash, password);
    if (!isPasswordValid) {
      await Query({ query: 'ROLLBACK' });
      return NextResponse.json(
        {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials'
        },
        { status: 401 }
      );
    }

    // Generate a JWT token for the authenticated user
    const token = await generateToken({
      id: user.account_uuid,
      username: user.account_username
    });

    // Parse the user-agent string using ua-parser-js
    const parser = new UAParser(request.headers.get('user-agent') || 'unknown');
    const userAgent = parser.getResult().ua.substring(0, MAX_DEVICE_IDENTIFIER_LENGTH);
    
    // Get device information using UAParser
    const deviceInfo = parser.getResult();
    const browser = deviceInfo.browser.name || 'unknown';
    const os = deviceInfo.os.name || 'unknown';


    // Attempt to get the MAC address; log error if it fails but continue with 'unknown'
    let macAddress = 'unknown';
    try {
      macAddress = await macaddress.one();
    } catch (macError) {
      console.error('Failed to get MAC address:', macError);
    }

    // Create a more detailed device identifier
    const deviceIdentifier = `${macAddress}|${os}|${browser}`.substring(0, MAX_DEVICE_IDENTIFIER_LENGTH);

    // Insert session details into the user_authentication_sessions table
    const createSessionQuery = {
      query: `INSERT INTO user_authentication_sessions 
              (authenticated_user_id, authentication_token, device_hardware_identifier, client_user_agent, session_expiration_timestamp, is_session_active) 
              VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 DAY), TRUE)`,
      values: [
        user.account_uuid,
        token,
        deviceIdentifier,
        userAgent
      ]
    }

    await Query(createSessionQuery);

    // Update the last authentication timestamp in the users_account table
    const updateAuthTimestampQuery = {
      query:
        'UPDATE users_account SET account_last_authentication_timestamp = CURRENT_TIMESTAMP WHERE account_uuid = ?',
      values: [user.account_uuid]
    };

    await Query(updateAuthTimestampQuery);

    // Commit the transaction to finalize database changes
    await Query({ query: 'COMMIT' });

    // Set the JWT token in the cookies for session management
    await setTokenCookie(token);

    // Return a success response with a specific code and user details
    return NextResponse.json(
      {
        code: 'AUTHENTICATION_SUCCESS',
        message: 'Authentication successful',
        user: {
          id: user.account_uuid,
          username: user.account_username
        },
        device: {
          browser: browser,
          os: os,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Authentication error:', error);
    // Rollback transaction in case of any errors
    await Query({ query: 'ROLLBACK' });

    // Return an error response with specific error details
    return NextResponse.json(
      {
        code: 'AUTHENTICATION_ERROR',
        message: 'Authentication failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}