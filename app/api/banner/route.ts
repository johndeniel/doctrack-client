import { NextResponse } from 'next/server';
import { getTokenFromCookie, verifyToken } from '@/lib/jwt';
import { Query } from '@/lib/db/mysql-connection-helper';

interface TaskData {
  task_uuid: string;
  task_title: string;
  task_description: string;
  task_type: string;
  task_origin: string;
  task_priority: string;
  formatted_date: string;
  formatted_time: string;
  task_due_date: string;
  dateCompleted: string;
  account_legal_name: string;
  account_uuid: string;
  profile_image_data: string;
  currentUserId?: string;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const taskUuid = url.searchParams.get('taskUuid');

    // Retrieve token from cookie
    const token = await getTokenFromCookie();
    if (!token) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'Missing authentication token' },
        { status: 401 }
      );
    }

    // Verify token using the valid token string
    const tokenPayload = await verifyToken(token);

    if (!taskUuid) {
      return NextResponse.json(
        { code: 'BAD_REQUEST', message: 'Missing taskUuid parameter' },
        { status: 400 }
      );
    }

    const taskData = await getTaskDetails(taskUuid);

    if (!taskData || taskData.length === 0) {
      return NextResponse.json(
        { code: 'NOT_FOUND', message: 'Task not found' },
        { status: 404 }
      );
    }

    // Set tokenPayload?.id as currentUserId in the retrieved task data
    taskData[0].currentUserId = tokenPayload?.id;

    return NextResponse.json({
      code: 'SUCCESS',
      message: 'Task data retrieved successfully',
      result: taskData[0]
    });
  } catch (error) {
    console.error('Task retrieval error:', error);
    return NextResponse.json(
      { code: 'TASK_ERROR', message: 'Failed to retrieve task data' },
      { status: 500 }
    );
  }
}

async function getTaskDetails(taskUuid: string): Promise<TaskData[]> {
  const query = {
    query: `
      SELECT
        t.task_uuid,
        t.task_title,
        t.task_description,
        t.task_type,
        t.task_origin,
        t.task_priority,
        DATE_FORMAT(t.task_date_created, '%M %d, %Y') AS formatted_date,
        DATE_FORMAT(t.task_time_created, '%h:%i %p') AS formatted_time,
        DATE_FORMAT(t.task_due_date, '%M %d, %Y') AS task_due_date,
        CASE 
          WHEN t.task_completed_timestamp IS NULL THEN 'undefined'
          ELSE DATE_FORMAT(t.task_completed_timestamp, '%d-%m-%Y')
        END AS dateCompleted,
        u.account_legal_name,
        u.account_uuid,
        pi.profile_image_data
      FROM
        task_ticket t
      JOIN
        users_account u ON t.task_creator_account_uuid = u.account_uuid
      LEFT JOIN
        users_profile_image pi ON u.account_uuid = pi.account_uuid 
      WHERE
        t.task_uuid = ?
    `,
    values: [taskUuid]
  };

  return await Query(query) as TaskData[];
}
