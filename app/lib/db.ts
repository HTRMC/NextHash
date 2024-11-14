// app/lib/db.ts
import { promises as fs } from 'fs';
import path from 'path';

interface User {
  email: string;
  password: string;
}

const dbPath = path.join(process.cwd(), 'data', 'users.json');

// Zorg ervoor dat de data directory bestaat
async function initializeDb() {
  try {
    await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
    try {
      await fs.access(dbPath);
    } catch {
      // Als het bestand niet bestaat, maak het aan met een lege users array
      await fs.writeFile(dbPath, JSON.stringify({ users: [] }));
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Initialiseer de database bij het starten van de applicatie
initializeDb();

export async function getUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data).users;
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
}

export async function saveUsers(users: User[]): Promise<void> {
  try {
    await fs.writeFile(dbPath, JSON.stringify({ users }, null, 2));
  } catch (error) {
    console.error('Error saving users:', error);
    throw new Error('Failed to save users');
  }
}