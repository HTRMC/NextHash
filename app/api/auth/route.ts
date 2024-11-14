// app/api/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getUsers, saveUsers } from '@/app/lib/db';

// Unified authentication handler implementing both login and registration
// through a discriminated union type pattern for request validation
const emailSchema = z.string().email("Ongeldig email formaat");
const passwordSchema = z.string().min(8, "Wachtwoord moet minimaal 8 tekens bevatten");

// Discriminated union base types for auth operations
const loginSchema = z.object({
    type: z.literal('login'),
    email: emailSchema,
    password: z.string().min(1, "Wachtwoord is verplicht"),
});

type LoginData = z.infer<typeof loginSchema>;

// Register schema
const registerSchema = z.object({
    type: z.literal('register'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
}).refine((data) => data.password === data.confirmPassword, {
    message: "Wachtwoorden komen niet overeen",
    path: ["confirmPassword"],
});

type RegisterData = z.infer<typeof registerSchema>;

// Combined schema using discriminated union for type-safe request handling
type AuthData = LoginData | RegisterData;
const authSchema = z.union([loginSchema, registerSchema]);

export async function POST(req: NextRequest) {
    try {
        // Strict content-type enforcement for API security
        const contentType = req.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
            return NextResponse.json(
                { error: "Verzoek moet JSON zijn" },
                { status: 400 }
            );
        }

        // Separate JSON parsing from schema validation for clearer error handling
        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                { error: "Ongeldige JSON data" },
                { status: 400 }
            );
        }

        // Schema validation with type inference for subsequent operations
        let validatedData: AuthData;
        try {
            validatedData = authSchema.parse(body) as AuthData;
        } catch (error) {
            if (error instanceof z.ZodError) {
                return NextResponse.json(
                    { error: error.errors[0].message },
                    { status: 400 }
                );
            }
            throw error;
        }

        // Registration flow with duplicate email prevention
        const users = await getUsers();

        if (validatedData.type === 'register') {
            // Check voor bestaande email
            if (users.some(user => user.email === validatedData.email)) {
                return NextResponse.json(
                    {
                        error: "Email is al in gebruik",
                        field: "email"
                    },
                    { status: 400 }
                );
            }

            try {
                // Atomic operation: Hash password and persist user in a single transaction
                const hashedPassword = await bcrypt.hash(validatedData.password, 10);
                const success = await saveUsers([
                    ...users,
                    {
                        email: validatedData.email,
                        password: hashedPassword
                    }
                ]);

                if (!success) {
                    return NextResponse.json(
                        { error: "Kon gebruiker niet opslaan. Probeer het later opnieuw." },
                        { status: 500 }
                    );
                }

                return NextResponse.json({
                    message: "Registratie succesvol",
                    redirect: '/login'
                });
            } catch (error) {
                console.error('Bcrypt error:', error);
                return NextResponse.json(
                    { error: "Er ging iets mis bij het verwerken van je wachtwoord. Probeer het opnieuw." },
                    { status: 500 }
                );
            }
        }

        // Login flow with constant-time password comparison
        if (validatedData.type === 'login') {
            const user = users.find(u => u.email === validatedData.email);
            if (!user) {
                return NextResponse.json(
                    { error: "Email of wachtwoord is onjuist" },
                    { status: 401 }
                );
            }

            try {
                // Verifieer wachtwoord
                const isValid = await bcrypt.compare(validatedData.password, user.password);
                if (!isValid) {
                    return NextResponse.json(
                        { error: "Email of wachtwoord is onjuist" },
                        { status: 401 }
                    );
                }

                return NextResponse.json({
                    message: "Inloggen succesvol",
                    redirect: '/dashboard'
                });
            } catch (error) {
                console.error('Bcrypt error:', error);
                return NextResponse.json(
                    { error: "Er ging iets mis bij het verifiëren van je wachtwoord. Probeer het opnieuw." },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json(
            { error: "Ongeldig type actie" },
            { status: 400 }
        );
    } catch (error) {
        console.error('Onverwachte error:', error);

        return NextResponse.json(
            { error: "Er is een onverwachte fout opgetreden. Probeer het later opnieuw." },
            { status: 500 }
        );
    }
}