'use client';

import { useEffect, useState } from 'react';

interface Task {
  id: number;
  title: string;
  description: string | null;
  due_date: string;
  topic: string;
  status: 'Todo' | 'In-Progress' | 'Complete';
  archived_at: string | null;
  created_at: string;
}

function isOverdue(task: Task): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return task.due_date < today && task.status !== 'Complete' && !task.archived_at;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sortBy, setSortBy] = useState<'topic' | 'status' | 'due_date'>('due_date');
  const [showArchived, setShowArchived] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [topic, setTopic] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);

  async function loadTasks() {
    const res = await fetch(`/api/tasks?sortBy=${sortBy}&includeArchived=${showArchived}`);
    const data = await res.json();
    setTasks(data);
  }

  useEffect(() => {
    loadTasks();
  }, [sortBy, showArchived]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await fetch(`/api/tasks/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, due_date: dueDate, topic }),
      });
      setEditingId(null);
    } else {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, due_date: dueDate, topic }),
      });
    }
    setTitle('');
    setDescription('');
    setDueDate('');
    setTopic('');
    loadTasks();
  }

  function startEdit(task: Task) {
    setEditingId(task.id);
    setTitle(task.title);
    setDescription(task.description ?? '');
    setDueDate(task.due_date);
    setTopic(task.topic);
  }

  async function changeStatus(id: number, status: string) {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    loadTasks();
  }

  async function archive(id: number) {
    await fetch(`/api/tasks/${id}/archive`, { method: 'POST' });
    loadTasks();
  }

  return (
    <main style={{ maxWidth: 700, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>Todo App</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <div>
          <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
        </div>
        <div>
          <input placeholder="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} required />
        </div>
        <button type="submit">{editingId ? 'Save Changes' : 'Add Task'}</button>
        {editingId && <button type="button" onClick={() => setEditingId(null)}>Cancel</button>}
      </form>

      <div style={{ marginBottom: '1rem' }}>
        <label>Sort by: </label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
          <option value="due_date">Due Date</option>
          <option value="topic">Topic</option>
          <option value="status">Status</option>
        </select>
        <label style={{ marginLeft: '1rem' }}>
          <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
          Show archived
        </label>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tasks.map((task) => (
          <li
            key={task.id}
            style={{
              border: '1px solid #ccc',
              borderRadius: 6,
              padding: '0.75rem',
              marginBottom: '0.5rem',
              background: task.archived_at ? '#f5f5f5' : 'white',
            }}
          >
            <strong>{task.title}</strong>{' '}
            {isOverdue(task) && (
              <span style={{ color: 'red', fontWeight: 'bold', marginLeft: 8 }}>OVERDUE</span>
            )}
            {task.archived_at && <span style={{ marginLeft: 8, color: '#888' }}>(Archived)</span>}
            <div>{task.description}</div>
            <div>Due: {task.due_date} | Topic: {task.topic}</div>
            <div>
              Status:{' '}
              <select
                value={task.status}
                disabled={!!task.archived_at}
                onChange={(e) => changeStatus(task.id, e.target.value)}
              >
                <option value="Todo">Todo</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Complete">Complete</option>
              </select>
            </div>
            {!task.archived_at && (
              <>
                <button onClick={() => startEdit(task)}>Edit</button>
                <button onClick={() => archive(task.id)}>Archive</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}