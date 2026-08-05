# Todo App Lab 1

A local-first todo application built with Next.js and SQLite. No user accounts — runs entirely on one machine for a single user.

## Third-Party Code

| Package                  | Why it was chosen                                                                                                                                                                                                                                                                              |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `next`                   | Framework required by the brief; provides file-based routing, API route handlers, and the dev server used to run the app.                                                                                                                                                                      |
| `react` / `react-dom`    | Peer dependencies of Next.js, used to build the task list and form UI.                                                                                                                                                                                                                         |
| `node:sqlite` (built-in) | Node's native SQLite module — chosen over `better-sqlite3` because it requires no native compilation step (no Visual Studio Build Tools needed), so the app installs and runs identically on any machine with Node 22.5+. Marked experimental in Node's docs but stable enough for this scope. |
| `typescript`             | Used throughout for type safety on the `Task` model and API payloads, catching field-mismatch bugs at compile time.                                                                                                                                                                            |
| `vitest`                 | Test runner — chosen over Jest for faster startup and native ESM/TypeScript support with minimal config.                                                                                                                                                                                       |

## Database Design

A single SQLite database (`data/todo.db`) with one table:

**`tasks`**

| Column        | Type                                                                    | Notes                                                                               |
| ------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `id`          | INTEGER PRIMARY KEY AUTOINCREMENT                                       | Unique task identifier                                                              |
| `title`       | TEXT NOT NULL                                                           | Required                                                                            |
| `description` | TEXT                                                                    | Optional                                                                            |
| `due_date`    | TEXT NOT NULL                                                           | ISO date string (`YYYY-MM-DD`)                                                      |
| `topic`       | TEXT NOT NULL                                                           | Free-text category, used for sorting                                                |
| `status`      | TEXT NOT NULL, CHECK constrained to `Todo` / `In-Progress` / `Complete` | Fixed set, not user-customisable                                                    |
| `archived_at` | TEXT, nullable                                                          | `NULL` = active task; a timestamp marks it archived. Archiving never deletes a row. |
| `created_at`  | TEXT NOT NULL                                                           | Set automatically on insert                                                         |

**Relationships:** none — a single flat table is sufficient, since tasks don't reference any other entity (no user accounts, no separate topics table, no shared state).

**Overdue** is not a column. It's computed at read time (`isOverdue` in `src/app/lib/tasks.ts`) from `due_date` against the current date, combined with `status` and `archived_at` — so it can never drift out of sync with the data it depends on, and it is never a selectable status.

## Running It

**Requires:** Node.js `v22.5.0` or later (developed and tested on `v24.13.1`).

From a clean clone:

```bash
cd todo-app
npm install
npm run dev
```

Open `http://localhost:3000` in a browser.

You may see `ExperimentalWarning: SQLite is an experimental feature and might change at any time` in the terminal on startup — this is expected and does not affect functionality; it comes from Node's built-in `node:sqlite` module.

**Running tests:**

```bash
npm test
```

Runs all tests in `src/app/lib/tasks.test.ts` against a throwaway SQLite file (`data/test.db`), which is deleted after the run completes. Tests do not touch your real `data/todo.db`.

**Data persistence:** the app creates `data/todo.db` automatically on first run. Stopping and restarting the dev server does not erase it.
