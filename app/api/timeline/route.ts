import { NextResponse } from 'next/server';
import { Query } from '@/lib/db/mysql-connection-helper';

interface CollaborationData {
  task_collaboration_timeline_uuid: string;
  account_legal_name: string;
  profile_image_data: string;
  remarks: string;
  collaboration_created_timestamp: string;
  collaboration_action_type: string;
  designation_division: string;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const taskUuid = url.searchParams.get('taskUuid');

    if (!taskUuid) {
      return NextResponse.json(
        { code: 'BAD_REQUEST', message: 'Missing taskUuid parameter' },
        { status: 400 }
      );
    }

    const collaborationData = await getCollaborationData(taskUuid);

    if (!collaborationData || collaborationData.length === 0) {
      return NextResponse.json(
        { code: 'NOT_FOUND', message: 'No collaboration data found for this task' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      code: 'SUCCESS',
      message: 'Collaboration data retrieved successfully',
      result: collaborationData
    });
  } catch (error) {
    console.error('Collaboration retrieval error:', error);
    return NextResponse.json(
      { code: 'COLLABORATION_ERROR', message: 'Failed to retrieve collaboration data' },
      { status: 500 }
    );
  }
}

async function getCollaborationData(taskUuid: string): Promise<CollaborationData[]> {
  const query = {
    query: `
      SELECT 
        t.task_collaboration_timeline_uuid,
        u.account_legal_name,
        p.profile_image_data,
        t.remarks,
        DATE_FORMAT(t.collaboration_created_timestamp, '%M %e, %Y • %h:%i %p') AS collaboration_created_timestamp,
        t.collaboration_action_type,
        t.designation_division
      FROM task_collaboration_timeline t
      JOIN users_account u 
        ON t.author_account_uuid = u.account_uuid
      LEFT JOIN users_profile_image p 
        ON u.account_uuid = p.account_uuid
      WHERE t.task_uuid = ?
    `,
    values: [taskUuid]
  };

  return await Query(query) as CollaborationData[];
}
