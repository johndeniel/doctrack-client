import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'

// More secure secret generation
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET_KEY

// Token configuration constants
const TOKEN_EXPIRES_IN = 60 * 60 * 24 // 1 day in seconds
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
}

interface TokenPayload {
  id: string
  username: string
  exp?: number
}

export async function generateToken(payload: Omit<TokenPayload, 'exp'>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${TOKEN_EXPIRES_IN}s`)
    .sign(new TextEncoder().encode(JWT_SECRET))
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    )
    return payload as unknown as TokenPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

export async function setTokenCookie(token: string) {
  (await cookies()).set('token', token, {
    ...COOKIE_OPTIONS,
    maxAge: TOKEN_EXPIRES_IN,
  })
}

export async function removeTokenCookie() {
  (await cookies()).delete('token')
}

export async function getTokenFromCookie(): Promise<string | null> {
  return (await cookies()).get('token')?.value || null
}

// Optional: Token refresh mechanism
export async function refreshToken(currentToken: string): Promise<string | null> {
  try {
    const payload = await verifyToken(currentToken)
    
    if (payload) {
      // Generate a new token with the same payload
      return generateToken({
        id: payload.id,
        username: payload.username
      })
    }
    return null
  } catch (error) {
    console.error('Token refresh failed:', error)
    return null
  }
}