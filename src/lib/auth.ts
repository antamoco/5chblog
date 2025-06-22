import { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret')

export interface User {
  id: string
  email: string
  name: string
  role: string
}

export async function getSession(request: NextRequest): Promise<User | null> {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return null
    }

    const { payload } = await jwtVerify(token, secret)
    
    return {
      id: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string
    }
  } catch (error) {
    return null
  }
}

export async function requireAuth(request: NextRequest): Promise<User> {
  const user = await getSession(request)
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
}