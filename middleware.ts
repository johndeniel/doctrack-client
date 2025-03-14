import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/jwt'

export async function middleware(request: NextRequest) {
  // Get the token from cookies
  const token = request.cookies.get('token')?.value

  // Define the current path
  const path = request.nextUrl.pathname

  // Define public and protected paths
  const publicPaths = ['/', '/login']
  const isPublicPath = publicPaths.includes(path)
  const protectedPaths = ['/admin', '/dashboard'] // Add all protected routes here

  // If no token exists
  if (!token) {
    // If trying to access a protected route, redirect to login
    if (protectedPaths.some(protectedPath => path.startsWith(protectedPath))) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // If on a public path, allow access
    return NextResponse.next()
  }

  try {
    // Verify the token
    const verifiedToken = await verifyToken(token)

    // If token is invalid or expired
    if (!verifiedToken) {
      // Redirect to login for protected routes
      if (protectedPaths.some(protectedPath => path.startsWith(protectedPath))) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      return NextResponse.next()
    }

    // If on login page and token is valid, redirect to dashboard
    if (isPublicPath && verifiedToken) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    // Allow access to the requested page
    return NextResponse.next()
  } catch (error) {
    // Any verification error redirects to login for protected routes
    if (protectedPaths.some(protectedPath => path.startsWith(protectedPath))) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/admin/:path*'  // This ensures all admin routes are covered
  ]
}