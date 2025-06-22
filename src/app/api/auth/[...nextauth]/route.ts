import { NextRequest, NextResponse } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'

export const runtime = 'edge'

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret')

async function createToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, csrfToken } = await request.json()

    // CSRF protection
    if (csrfToken !== 'admin-login') {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
    }

    // 環境変数による簡易認証
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = await createToken({
        sub: '1',
        email,
        role: 'admin',
        name: 'Admin'
      })

      const response = NextResponse.json({ 
        user: { id: '1', name: 'Admin', email, role: 'admin' },
        message: 'Logged in successfully'
      })

      // HTTPOnly Cookie設定
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 // 7 days
      })

      return response
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // CSRF Token endpoint
    return NextResponse.json({ csrfToken: 'admin-login' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get CSRF token' }, { status: 500 })
  }
}

// Logout endpoint
export async function DELETE() {
  const response = NextResponse.json({ message: 'Logged out successfully' })
  response.cookies.delete('auth-token')
  return response
}