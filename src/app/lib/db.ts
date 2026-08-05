import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';

const dbPath = process.env.TEST_DB_PATH
  ? process.env.TEST_DB_PATH
  : path.join(process.cwd(), 'data', 'todo.db');

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);
const schema = fs.readFileSync(path.join(process.cwd(), 'src/app/lib/schema.sql'), 'utf-8');
db.exec(schema);

export default db;