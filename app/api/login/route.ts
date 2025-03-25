import { NextRequest, NextResponse } from 'next/server';
import { Query } from '@/lib/db/mysql-connection-helper';
import { generateToken, setTokenCookie } from '@/lib/jwt';
import * as argon2 from 'argon2';
import { UAParser } from 'ua-parser-js';

// TypeScript interfaces for request/response data
interface LoginRequestBody {
  username: string;
  password: string;
}

interface UserRecord {
  account_uuid: string;
  account_username: string;
  account_password_hash: string;
  account_division_designation: string; // Added division designation
}

interface DeviceInfo {
  browserName: string | undefined;
  browserVersion: string | undefined;
  osName: string | undefined;
  osVersion: string | undefined;
}

interface AuthenticationResponse {
  code: string;
  message: string;
  user?: {
    id: string;
    username: string;
    division_designation: string; // Added division designation
  };
  device?: DeviceInfo;
}

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

    // Query the database for the user by username - UPDATED QUERY
    const findUserQuery = {
      query:
        'SELECT account_uuid, account_username, account_password_hash, account_division_designation FROM users_account WHERE account_username = ?',
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

    // Generate a JWT token for the authenticated user - UPDATED TOKEN GENERATION
    const token = await generateToken({
      id: user.account_uuid,
      username: user.account_username,
      division: user.account_division_designation
    });

    // Parse the user-agent string using ua-parser-js
    const userAgentString = request.headers.get('user-agent') || 'unknown';
    const parser = new UAParser(userAgentString);
    const deviceInfo = parser.getResult();

    // Extract only the browser and OS information
    const deviceData: DeviceInfo = {
      browserName: deviceInfo.browser.name,
      browserVersion: deviceInfo.browser.version,
      osName: deviceInfo.os.name,
      osVersion: deviceInfo.os.version
    };

    // Insert session details into the user_authentication_sessions table
    const createSessionQuery = {
      query: `INSERT INTO user_authentication_sessions 
              (authenticated_user_id, 
               authentication_token, 
               client_browser_name,
               client_browser_version,
               client_os_name,
               client_os_version,
               session_expiration_timestamp) 
              VALUES (?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 DAY))`,
      values: [
        user.account_uuid,
        token,
        deviceData.browserName || 'unknown',
        deviceData.browserVersion || 'unknown',
        deviceData.osName || 'unknown',
        deviceData.osVersion || 'unknown'
      ]
    };

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
    const response: AuthenticationResponse = {
      code: 'AUTHENTICATION_SUCCESS',
      message: 'Authentication successful',
      user: {
        id: user.account_uuid,
        username: user.account_username,
        division_designation: user.account_division_designation
      },
      device: deviceData
    };

    return NextResponse.json(response, { status: 200 });
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