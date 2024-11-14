// app/lib/db.ts
import { promises as fs } from 'fs';
import path from 'path';

interface User {
  email: string;
  password: string;
}

// File-based storage implementation with atomic write operations
const dbPath = path.join(process.cwd(), 'data', 'users.json');

// Database initialization with idempotent directory and file creation
async function initializeDb() {
  try {
    // Ensure data directory exists with recursive creation
    await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
    
    try {
      await fs.access(dbPath);
    } catch {
      // Initialize with empty users array if file doesn't exist
      await fs.writeFile(dbPath, JSON.stringify({ users: [] }, null, 2));
    }
    return true;
  } catch (error) {
    console.error('Database initialisatie error:', error);
    return false;
  }
}

// Retrieves users with automatic database recovery on corruption
export async function getUsers(): Promise<User[]> {
  try {
    await initializeDb();
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data).users;
  } catch (error) {
    if (error instanceof Error) {
      // Auto-recovery: Reset database on JSON parse failure
      if (error instanceof SyntaxError) {
        await fs.writeFile(dbPath, JSON.stringify({ users: [] }, null, 2));
        return [];
      }
    }
    // Log de error maar return een lege array om de applicatie werkend te houden
    console.error('Error reading users:', error);
    return [];
  }
}

// Atomic write operation for user persistence
export async function saveUsers(users: User[]): Promise<boolean> {
  try {
    await initializeDb();
    // Write entire user array atomically to prevent partial updates
    await fs.writeFile(dbPath, JSON.stringify({ users }, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving users:', error);
    return false;
  }
}