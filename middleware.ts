// middleware.ts

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/jwt'

export async function middleware(request: NextRequest) {
  // Get the token from cookies
  const token = request.cookies.get('token')?.value
  
  // Define paths
  const path = request.nextUrl.pathname
  const isLoginPage = path === '/login'
  const isProtectedRoute = path === '/' // Only protecting the root route
  
  // Case 1: No token exists
  if (!token) {
    // If accessing protected route without token -> redirect to login
    if (isProtectedRoute) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
    // Allow access to public routes (including login)
    return NextResponse.next()
  }
  
  // Case 2: Token exists - verify it
  try {
    const verifiedToken = await verifyToken(token)
    
    // Invalid or expired token
    if (!verifiedToken) {
      // Clear invalid token cookie
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('token')
      
      // If protected route, redirect to login
      if (isProtectedRoute) {
        return response
      }
      return NextResponse.next()
    }
    
    // Valid token
    // If on login page with valid token -> redirect to dashboard
    if (isLoginPage) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    // Allow access to requested protected page
    return NextResponse.next()
  } catch (error) {
    console.error('Authentication middleware error:', error)
    
    // On error for protected routes, redirect to login
    if (isProtectedRoute) {
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('token') // Clear potentially corrupted token
      return response
    }
    
    return NextResponse.next()
  }
}

// Configure which routes this middleware applies to
export const config = {
  matcher: ['/', '/login']
}