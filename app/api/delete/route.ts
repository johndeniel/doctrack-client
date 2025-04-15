// app/api/tasks/route.ts
import { NextResponse } from 'next/server';
import { Query } from '@/lib/db/mysql-connection-helper';

// Define the type for the delete operation result
interface DeleteResult {
  affectedRows: number;
  fieldCount?: number;
  info?: string;
  insertId?: number;
  serverStatus?: number;
  warningStatus?: number;
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const taskUuid = url.searchParams.get('taskUuid');

    console.log('jiji')
    console.log(taskUuid)
    if (!taskUuid) {
      return NextResponse.json(
        { code: 'BAD_REQUEST', message: 'Missing taskUuid parameter' },
        { status: 400 }
      );
    }

    // Delete the task
    const result = await deleteTask(taskUuid);

    // Check if any row was affected (deleted)
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { code: 'NOT_FOUND', message: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      code: 'SUCCESS',
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Task deletion error:', error);
    return NextResponse.json(
      { code: 'TASK_ERROR', message: 'Failed to delete task' },
      { status: 500 }
    );
  }
}

async function deleteTask(taskUuid: string): Promise<DeleteResult> {
  const query = {
    query: `DELETE FROM task_ticket WHERE task_uuid = ?`,
    values: [taskUuid]
  };

  const result = await Query(query);
  return result as DeleteResult;
}