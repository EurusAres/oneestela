import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'
import bcrypt from 'bcrypt'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const email = 'eares223321@gmail.com'
    const password = 'nelu123'
    
    console.log('Checking for customer account:', email)
    
    // Check if user exists
    const users = await executeQuery(
      'SELECT id, email, full_name, role, created_at FROM users WHERE email = ?',
      [email]
    ) as any[]
    
    if (users.length === 0) {
      // Create new customer account
      console.log('User not found, creating new account...')
      
      const hashedPassword = await bcrypt.hash(password, 10)
      
      const result = await executeQuery(
        'INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, 'Customer User', 'user']
      )
      
      return NextResponse.json({
        success: true,
        message: 'Customer account created successfully',
        email,
        password,
        role: 'user',
        userId: (result as any).insertId
      })
    } else {
      // Update existing user's password
      console.log('User found, updating password...')
      
      const hashedPassword = await bcrypt.hash(password, 10)
      
      await executeQuery(
        'UPDATE users SET password_hash = ?, role = ? WHERE email = ?',
        [hashedPassword, 'user', email]
      )
      
      return NextResponse.json({
        success: true,
        message: 'Customer account password updated successfully',
        email,
        password,
        role: 'user',
        user: users[0]
      })
    }
    
  } catch (error) {
    console.error('Error fixing customer account:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fix customer account', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
