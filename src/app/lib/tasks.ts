import db from './db';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  due_date: string;
  topic: string;
  status: 'Todo' | 'In-Progress' | 'Complete';
  archived_at: string | null;
  created_at: string;
}

export function createTask(data: {
  title: string;
  description?: string;
  due_date: string;
  topic: string;
}): Task {
  const stmt = db.prepare(`
    INSERT INTO tasks (title, description, due_date, topic)
    VALUES (@title, @description, @due_date, @topic)
  `);
  const result = stmt.run({
    title: data.title,
    description: data.description ?? null,
    due_date: data.due_date,
    topic: data.topic,
  });
  return getTaskById(result.lastInsertRowid as number)!;
}

export function getTaskById(id: number): Task | undefined {
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task | undefined;
}

export function updateTask(
  id: number,
  data: Partial<{ title: string; description: string; due_date: string; topic: string; status: string }>
): Task | undefined {
  const fields = Object.keys(data);
  if (fields.length === 0) return getTaskById(id);

  const setClause = fields.map((f) => `${f} = @${f}`).join(', ');
  db.prepare(`UPDATE tasks SET ${setClause} WHERE id = @id`).run({ ...data, id });
  return getTaskById(id);
}

export function archiveTask(id: number): Task | undefined {
  db.prepare(`UPDATE tasks SET archived_at = datetime('now') WHERE id = ?`).run(id);
  return getTaskById(id);
}

export function listTasks(options: {
  sortBy?: 'topic' | 'status' | 'due_date';
  includeArchived?: boolean;
} = {}): Task[] {
  const { sortBy = 'due_date', includeArchived = false } = options;
  const whereClause = includeArchived ? '' : 'WHERE archived_at IS NULL';
  const orderColumn = { topic: 'topic', status: 'status', due_date: 'due_date' }[sortBy];
  return db.prepare(`SELECT * FROM tasks ${whereClause} ORDER BY ${orderColumn} ASC`).all() as Task[];
}

export function isOverdue(task: Task): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return task.due_date < today && task.status !== 'Complete' && !task.archived_at;
}