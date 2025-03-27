import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Create response object
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 },
    )

    // Clear the token cookie by setting it to expire immediately
    response.cookies.set('token', '', {
        httpOnly: true,
        secure: false, 
        sameSite: 'lax' as const, 
        path: '/',
        expires: new Date(0), // This makes the cookie expire immediately
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
  }
}