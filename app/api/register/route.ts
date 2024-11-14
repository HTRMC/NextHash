// app/api/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getUsers, saveUsers } from '@/app/lib/db';

const registerSchema = z.object({
  email: z.string().email("Ongeldig email formaat"),
  password: z.string().min(8, "Wachtwoord moet minimaal 8 tekens bevatten"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Wachtwoorden komen niet overeen",
  path: ["confirmPassword"]
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);
    
    // Haal bestaande gebruikers op
    const users = await getUsers();
    
    if (users.some(user => user.email === validatedData.email)) {
      return NextResponse.json(
        { error: "Email is al in gebruik" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    
    // Voeg nieuwe gebruiker toe en sla op
    users.push({
      email: validatedData.email,
      password: hashedPassword
    });
    
    await saveUsers(users);

    return NextResponse.json({ message: "Registratie succesvol" });
  } catch (error) {
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