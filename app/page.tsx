// app/page.tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h1 className="text-4xl font-bold text-center text-gray-900">
            Welkom
          </h1>
          <p className="mt-2 text-center text-gray-600">
            Log in of maak een nieuw account aan
          </p>
        </div>

        <div className="space-y-4">
          <Link 
            href="/login"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Inloggen
          </Link>
          <Link
            href="/register"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Registreren
          </Link>
        </div>
      </div>
    </div>
  );
}