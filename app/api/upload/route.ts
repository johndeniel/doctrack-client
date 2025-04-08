import { NextRequest, NextResponse } from 'next/server';
import { Query } from '@/lib/db/mysql-connection-helper';
import { getTokenFromCookie, verifyToken } from '@/lib/jwt';

interface TaskTicketRequestBody {
 task_title: string;
 task_description: string;
 task_type: 'Physical Document' | 'Digital Document';
 task_origin: 'Internal' | 'External';
 task_priority: 'High' | 'Medium' | 'Low';
 task_date_created: string;
 task_time_created: string;
 task_due_date: string;
}

interface ApiResponse {
 code: string;
 message: string;
 task_uuid?: string;
 error?: string;
}

export async function POST(request: NextRequest) {
 try {
   // Authenticate user
   const token = await getTokenFromCookie();
   if (!token) {
     return createResponse('UNAUTHORIZED', 'No authentication token found', 401);
   }

   const tokenPayload = await verifyToken(token);
   if (!tokenPayload?.id || !tokenPayload?.division) {
     return createResponse('INVALID_TOKEN', 'Invalid authentication token', 401);
   }

   // Process request data
   const requestData = await request.json() as TaskTicketRequestBody;
   const validationError = validateTaskData(
     requestData, 
     tokenPayload.id, 
     tokenPayload.division
   );
   
   if (validationError) {
     return createResponse('VALIDATION_ERROR', validationError, 400);
   }

   // Create task in database
   const taskUuid = await createTaskTicket(requestData, tokenPayload.id, tokenPayload.division);
   
   return createResponse(
     'TASK_TICKET_CREATED', 
     'Task ticket created successfully', 
     201, 
     taskUuid
   );
 } catch (error) {
   console.error('Task creation error:', error);
   await Query({ query: 'ROLLBACK' });
   return createResponse('TASK_CREATION_ERROR', 'Failed to create task ticket', 500);
 }
}

function createResponse(
 code: string, 
 message: string, 
 status: number,
 taskUuid?: string
): NextResponse {
 const responseBody: ApiResponse = { code, message };
 if (taskUuid) responseBody.task_uuid = taskUuid;
 return NextResponse.json(responseBody, { status });
}

function validateTaskData(
 data: TaskTicketRequestBody, 
 creatorId: string, 
 division: string
): string | null {
 const {
   task_title,
   task_description,
   task_type,
   task_origin,
   task_priority,
   task_date_created,
   task_time_created,
   task_due_date
 } = data;

 // Check required fields
 if (!task_title || !task_description || !task_type || !task_origin || 
     !task_priority || !task_date_created || !task_time_created || 
     !task_due_date || !creatorId || !division) {
   return 'Missing one or more required fields';
 }

 // Validate date range
 if (new Date(task_due_date) < new Date(task_date_created)) {
   return 'Task due date must be on or after the task creation date';
 }

 return null;
}

async function createTaskTicket(
 data: TaskTicketRequestBody,
 creatorId: string,
 division: string
): Promise<string> {
 try {
   await Query({ query: 'BEGIN' });
   
   // Generate UUID
   const uuidResult = await Query({ 
     query: 'SELECT UUID() as generated_uuid' 
   }) as Array<{generated_uuid: string}>;
   
   const taskUuid = uuidResult[0].generated_uuid;

   // Insert task record
   await Query({
     query: `
       INSERT INTO task_ticket (
         task_uuid, task_title, task_description, task_creator_account_uuid,
         task_type, task_origin, task_priority, task_date_created,
         task_time_created, task_due_date, task_assigned_division
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     `,
     values: [
       taskUuid, data.task_title, data.task_description, creatorId,
       data.task_type, data.task_origin, data.task_priority, 
       data.task_date_created, data.task_time_created, data.task_due_date, division
     ]
   });

   // Insert collaboration timeline
   await Query({
     query: `
       INSERT INTO task_collaboration_timeline (
         task_uuid, author_account_uuid, collaboration_action_type,
         designation_division, remarks
       ) VALUES (?, ?, 'Upload', ?, ?)
     `,
     values: [
       taskUuid, creatorId, division,
       `${division} upload the document ${data.task_title}`
     ]
   });

   await Query({ query: 'COMMIT' });
   return taskUuid;
 } catch (error) {
   await Query({ query: 'ROLLBACK' });
   throw error;
 }
}