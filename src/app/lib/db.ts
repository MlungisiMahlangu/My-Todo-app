import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd() , 'data' , 'todo.db');
fs.mkdirSync(path.dirname(dbPath) , { recursive: true});

const db = new Database(dbPath);
const schema = fs.readFileSync(path.join(process.cwd(), 'src/lib/schema.sql'),'utf-8');
db.exec(schema);

export default db;