import { NextRequest, NextResponse } from 'next/server';
import { Query } from '@/lib/db/mysql-connection-helper';
import { getTokenFromCookie, verifyToken } from '@/lib/jwt';

interface TaskTicketRequestBody {
  task_title: string;
  task_description: string;
  task_creator_account_uuid: string;
  task_type: 'Physical Document' | 'Digital Document';
  task_origin: 'Internal' | 'External';
  task_priority: 'High' | 'Medium' | 'Low';
  task_date_created: string; // Format: YYYY-MM-DD
  task_time_created: string; // Format: HH:MM:SS
  task_due_date: string;     // Format: YYYY-MM-DD (must be on or after task_date_created)
  task_assigned_division: 'ARU-MAU' | 'OD' | 'PMTSSD' | 'PPDD' | 'URWED';
}

interface TaskTicketResponse {
  code: string;
  message: string;
  task_uuid?: string;
}

interface UuidResult {
  generated_uuid: string;
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate request with token from cookies
    const token = await getTokenFromCookie();
        
    if (!token) {
      return createErrorResponse(401, 'UNAUTHORIZED', 'No authentication token found');
    }

    // Verify token and extract user information
    const tokenPayload = await verifyToken(token);

    const task_creator_account_uuid = tokenPayload?.id;
    const task_assigned_division = tokenPayload?.division;

    const requestData = await request.json();
    const {
      task_title,
      task_description,
      task_type,
      task_origin,
      task_priority,
      task_date_created,
      task_time_created,
      task_due_date
    } = requestData as TaskTicketRequestBody;

    // Validate required fields
    if (
      !task_title ||
      !task_description ||
      !task_creator_account_uuid ||
      !task_type ||
      !task_origin ||
      !task_priority ||
      !task_date_created ||
      !task_time_created ||
      !task_due_date ||
      !task_assigned_division
    ) {
      return NextResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'Missing one or more required fields'
        },
        { status: 400 }
      );
    }

    // Validate date range: task_due_date should be on or after task_date_created
    if (new Date(task_due_date) < new Date(task_date_created)) {
      return NextResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'Task due date must be on or after the task creation date'
        },
        { status: 400 }
      );
    }

    // Begin transaction
    await Query({ query: 'BEGIN' });

    // First generate a UUID for the task
    const generateUuidResult = await Query({ 
      query: 'SELECT UUID() as generated_uuid' 
    }) as UuidResult[];
    
    const taskUuid = generateUuidResult[0].generated_uuid;

    const insertTaskQuery = {
      query: `
        INSERT INTO task_ticket (
          task_uuid,
          task_title,
          task_description,
          task_creator_account_uuid,
          task_type,
          task_origin,
          task_priority,
          task_date_created,
          task_time_created,
          task_due_date,
          task_assigned_division
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      values: [
        taskUuid,
        task_title,
        task_description,
        task_creator_account_uuid,
        task_type,
        task_origin,
        task_priority,
        task_date_created,
        task_time_created,
        task_due_date,
        task_assigned_division
      ]
    };

    // Execute the insert task query
    await Query(insertTaskQuery);

    // Insert into task_collaboration_timeline
    const insertCollaborationTimelineQuery = {
      query: `
        INSERT INTO task_collaboration_timeline (
          task_uuid,
          author_account_uuid,
          collaboration_action_type,
          designation_division,
          remarks
        ) VALUES (?, ?, 'Upload', ?, ?)
      `,
      values: [
        taskUuid,
        task_creator_account_uuid,
        task_assigned_division,
        `${task_assigned_division} upload the document ${task_title}`
      ]
    };

    // Execute the collaboration timeline insert query
    await Query(insertCollaborationTimelineQuery);

    // Commit the transaction after successful insertion
    await Query({ query: 'COMMIT' });

    // Return a success response with the task UUID
    const response: TaskTicketResponse = {
      code: 'TASK_TICKET_CREATED',
      message: 'Task ticket created successfully',
      task_uuid: taskUuid
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating task ticket:', error);
    // Rollback the transaction in case of error
    await Query({ query: 'ROLLBACK' });
    return NextResponse.json(
      {
        code: 'TASK_CREATION_ERROR',
        message: 'Failed to create task ticket',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
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