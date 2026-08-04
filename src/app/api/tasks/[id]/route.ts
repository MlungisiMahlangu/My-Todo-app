import { NextRequest, NextResponse } from 'next/server';
import { updateTask, getTaskById } from '../../../lib/tasks';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const taskId = Number(id);
  const existing = getTaskById(taskId);
  if (!existing) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const body = await request.json();
  const updated = updateTask(taskId, body);
  return NextResponse.json(updated);
}