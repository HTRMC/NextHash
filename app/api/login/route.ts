// app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getUsers } from '@/app/lib/db';

const loginSchema = z.object({
  email: z.string().email("Ongeldig email formaat"),
  password: z.string().min(1, "Wachtwoord is verplicht"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = loginSchema.parse(body);
    
    // Haal gebruikers op uit JSON bestand
    const users = await getUsers();
    
    const user = users.find(u => u.email === validatedData.email);
    if (!user) {
      return NextResponse.json(
        { error: "Ongeldige inloggegevens" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(validatedData.password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Ongeldige inloggegevens" },
        { status: 401 }
      );
    }

    return NextResponse.json({ message: "Inloggen succesvol" });
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
}