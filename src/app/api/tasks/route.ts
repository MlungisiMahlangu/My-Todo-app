import { NextRequest, NextResponse } from 'next/server';
import { createTask, listTasks } from '../../lib/tasks';

export async function GET(request: NextRequest) {
  const sortBy = request.nextUrl.searchParams.get('sortBy') as 'topic' | 'status' | 'due_date' | null;
  const includeArchived = request.nextUrl.searchParams.get('includeArchived') === 'true';

  const tasks = listTasks({
    sortBy: sortBy ?? 'due_date',
    includeArchived,
  });
  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.title || !body.due_date || !body.topic) {
    return NextResponse.json(
      { error: 'title, due_date and topic are required' },
      { status: 400 }
    );
  }

  const task = createTask({
    title: body.title,
    description: body.description,
    due_date: body.due_date,
    topic: body.topic,
  });
  return NextResponse.json(task, { status: 201 });
}