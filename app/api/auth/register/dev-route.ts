import { NextRequest, NextResponse } from 'next/server'
import { addDevUser } from '@/lib/dev-auth-store'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Missing fields', message: 'Email and password required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Weak password', message: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const userId = `dev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const user = {
      id: userId,
      email,
      name: name || email.split('@')[0],
      password,
      role: 'user',
      created_at: new Date().toISOString(),
    }

    addDevUser(email, user)

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
        emailConfirmed: true,
      }
    }, { status: 201 })

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Server error', message: error.message },
      { status: 500 }
    )
  }
}
