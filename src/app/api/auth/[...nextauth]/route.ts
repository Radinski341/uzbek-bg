import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Export the NextAuth handler for both GET and POST requests
export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);