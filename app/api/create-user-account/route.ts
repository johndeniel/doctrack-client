import { NextRequest, NextResponse } from 'next/server'
import { Query } from '@/lib/db/mysql-connection-helper'
import * as argon2 from 'argon2'
import { z } from 'zod'

// Validation schema for user creation
const createUserSchema = z.object({
    account_legal_name: z.string()
    .min(2, { message: 'Legal name must be at least 8 characters long' })
    .max(32, { message: 'Legal name must be at most 32 characters long' }),

    account_username: z.string()
    .min(8, { message: 'Username must be at least 8 characters long' })
    .max(32, { message: 'Username must be at most 32 characters long' })
    .regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain alphanumeric characters and underscores' })
    .refine(val => !val.startsWith('_') && !val.endsWith('_'), {
      message: 'Username cannot start or end with an underscore'
    }),
  
    account_password: z.string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(32, { message: 'Password must be at most 32 characters long' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/\d/, { message: 'Password must contain at least one numeric character' }),

    account_division_designation: z.string()
    .min(1, { message: 'Division designation is required' })
    .max(32, { message: 'Division designation must be at most 32 characters long' }),

    users_profile_image_name: z.string(),
    users_profile_image_data: z.string(),
    users_profile_image_type: z.string(),
    users_profile_image_size: z.string()
});

export async function POST(httpRequest: NextRequest) {
  console.log('Starting admin user account creation process');

  try {
    // Parse and validate request payload
    const createUserPayload = await httpRequest.json();
    const validatedUserData = createUserSchema.parse(createUserPayload);

    // Initialize database transaction
    await Query({ query: 'BEGIN' });

    try {
      // Verify username availability
      const usernameCheckQuery = {
        query: `
          SELECT account_uuid 
          FROM users_account 
          WHERE account_username = ?
        `,
        values: [validatedUserData.account_username]
      };

      const existingUserRecords = await Query(usernameCheckQuery) as { account_uuid: string }[];

      // Return conflict response if username exists
      if (existingUserRecords.length > 0) {
        return NextResponse.json({
          code: 'USERNAME_CONFLICT',
          message: "Username already exists in the system",
          details: { username: validatedUserData.account_username }
        }, { 
          status: 409,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Content-Type': 'application/json'
          }, 
        });
      }

      // Hash password with Argon2id
      const securePasswordHash = await argon2.hash(validatedUserData.account_password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16,  // 64 MB
        timeCost: 3,          // Iterations
        parallelism: 1        // Threads
      });

      // Create new user account
      const userCreationQuery = {
        query: `
          INSERT INTO users_account (
            account_legal_name, 
            account_username, 
            account_password_hash,
            account_division_designation
          ) VALUES (
            ?, 
            ?,
            ?,
            ?
          )
        `,
        values: [
          validatedUserData.account_legal_name,
          validatedUserData.account_username,
          securePasswordHash,
          validatedUserData.account_division_designation
        ]
      };
  
      await Query(userCreationQuery);
  
      // Get the newly created user's UUID
      const getNewUserQuery = {
        query: `
          SELECT account_uuid 
          FROM users_account 
          WHERE account_username = ?
        `,
        values: [validatedUserData.account_username]
      };
  
      const newUserRecords = await Query(getNewUserQuery) as { account_uuid: string }[];

      const insertUsersProfileImage = {
        query: `
          INSERT INTO users_profile_image (
            account_uuid, 
            profile_image_file_name, 
            profile_image_data, 
            profile_image_mime_type,
            profile_image_size_bytes
          ) VALUES (
            ?, 
            ?,
            ?,
            ?,
            ?
          )
        `,
        values: [
          newUserRecords[0].account_uuid,
          validatedUserData.users_profile_image_name,
          validatedUserData.users_profile_image_data,
          validatedUserData.users_profile_image_type,
          validatedUserData.users_profile_image_size
        ]
      };
  
      await Query(insertUsersProfileImage);
      
  
      // Finalize transaction
      await Query({ query: 'COMMIT' });
  
      // Return success response
      return NextResponse.json(
        { 
          code: 'USER_CREATION_SUCCESS',
          message: "User account created successfully", 
          userId: newUserRecords[0].account_uuid 
        }, 
        { 
          status: 201,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Content-Type': 'application/json'
          }, 
        }
      );

    } catch (transactionError) {
      // Revert transaction changes
      await Query({ query: 'ROLLBACK' }); 

      const serverErrorResponse = {
        code: 'TRANSACTION_ERROR',
        message: "User account creation transaction failed",
        details: transactionError instanceof Error ? transactionError.message : 'Unhandled transaction error'
      };

      console.error('Transaction error:', serverErrorResponse);

      return NextResponse.json(serverErrorResponse, { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Content-Type': 'application/json'
        }, 
      });
    }

  } catch (error) {
    // Handle schema validation errors
    if (error instanceof z.ZodError) {
      const validationErrors = error.errors.reduce((errorMap, currentError) => {
        if (!errorMap[currentError.path[0]]) {
          errorMap[currentError.path[0]] = currentError.message;
        }
        return errorMap;
      }, {} as Record<string, string>);

      const firstErrorField = Object.keys(validationErrors)[0];
      
      return NextResponse.json({
        code: 'VALIDATION_ERROR',
        message: "User account input validation failed",
        details: `${firstErrorField}: ${validationErrors[firstErrorField]}`
      }, 
      { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Content-Type': 'application/json'
        }, 
      });
    }

    // Handle unexpected errors
    const criticalErrorResponse = {
      code: 'USER_CREATION_ERROR',
      message: "User account creation process encountered a critical error",
      details: error instanceof Error ? error.message : 'Unhandled creation error'
    };

    console.error('Critical user creation error:', criticalErrorResponse);

    return NextResponse.json(criticalErrorResponse, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Content-Type': 'application/json'
      }, 
    });
  }
}