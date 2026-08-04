import { NextRequest, NextResponse } from 'next/server';
import { archiveTask, getTaskById } from '../../../../lib/tasks';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const taskId = Number(id);
  const existing = getTaskById(taskId);
  if (!existing) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const archived = archiveTask(taskId);
  return NextResponse.json(archived);
}