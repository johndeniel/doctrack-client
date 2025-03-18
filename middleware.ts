import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/jwt'

// Define public paths that don't require authentication
const publicPaths = ['/login', '/api/login'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Get the token from cookies
  const token = request.cookies.get('token')?.value;
  
  // Check if current path is in the public paths list
  const isPublicPath = publicPaths.some(publicPath => path.startsWith(publicPath));
  
  // If user has a valid token and is trying to access login page, redirect to home
  if (isPublicPath && token) {
    try {
      const verifiedToken = await verifyToken(token);
      if (verifiedToken) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch {
      // Token verification failed, continue with normal flow
    }
  }
  
  // Allow access to public paths without token verification
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // No token exists and trying to access protected route
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  try {
    // Verify the token
    const verifiedToken = await verifyToken(token);
    
    // Invalid or expired token
    if (!verifiedToken) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
    
    // Valid token - allow access to protected route
    return NextResponse.next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    
    // On error, redirect to login page
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token'); // Clear potentially corrupted token
    return response;
  }
}

// Apply middleware to all routes except static assets
export const config = {
  matcher: [
    // Apply to all routes except public assets
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};