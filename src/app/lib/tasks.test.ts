import { beforeEach, afterAll, describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const testDbPath = path.join(process.cwd(), 'data', 'test.db');
process.env.TEST_DB_PATH = testDbPath;

// Import after setting env var so db.ts picks up the test path
const { createTask, listTasks, archiveTask, isOverdue } = await import('./tasks');
const db = (await import('./db')).default;

beforeEach(() => {
  db.exec('DELETE FROM tasks');
});

afterAll(() => {
  db.close();
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
});

describe('createTask and listTasks', () => {
  it('creates a task and returns it in the active list', () => {
    createTask({ title: 'Write report', due_date: '2026-12-01', topic: 'Work' });
    const tasks = listTasks();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Write report');
    expect(tasks[0].status).toBe('Todo');
    expect(tasks[0].archived_at).toBeNull();
  });
});

describe('archiveTask', () => {
  it('removes a task from the active list but keeps it retrievable', () => {
    const task = createTask({ title: 'Old task', due_date: '2026-01-01', topic: 'Misc' });
    archiveTask(task.id);

    const active = listTasks();
    expect(active.find((t) => t.id === task.id)).toBeUndefined();

    const withArchived = listTasks({ includeArchived: true });
    const archived = withArchived.find((t) => t.id === task.id);
    expect(archived).toBeDefined();
    expect(archived!.archived_at).not.toBeNull();
  });
});

describe('isOverdue', () => {
  it('flags a task as overdue when due date has passed and status is not Complete', () => {
    const task = createTask({ title: 'Late task', due_date: '2020-01-01', topic: 'Test' });
    expect(isOverdue(task)).toBe(true);
  });

  it('does not flag a completed task as overdue even if due date has passed', () => {
    const task = createTask({ title: 'Done late', due_date: '2020-01-01', topic: 'Test' });
    const updated = { ...task, status: 'Complete' as const };
    expect(isOverdue(updated)).toBe(false);
  });

  it('does not flag an archived task as overdue', () => {
    const task = createTask({ title: 'Archived late', due_date: '2020-01-01', topic: 'Test' });
    archiveTask(task.id);
    const refreshed = listTasks({ includeArchived: true }).find((t) => t.id === task.id)!;
    expect(isOverdue(refreshed)).toBe(false);
  });
});