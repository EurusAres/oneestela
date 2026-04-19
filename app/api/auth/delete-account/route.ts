import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'
import bcrypt from 'bcrypt'

export async function DELETE(request: Request) {
  try {
    const { userId, password } = await request.json()

    if (!userId || !password) {
      return NextResponse.json(
        { error: 'User ID and password are required' },
        { status: 400 }
      )
    }

    // Verify user exists and password is correct
    const users = await executeQuery(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    )

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user = users[0] as any

    // Check if user has a password set
    if (!user.password || user.password === '') {
      // For accounts without password (e.g., OAuth accounts), allow deletion without password verification
      // Or you could implement alternative verification here
      console.log('Deleting account without password verification (no password set)')
    } else {
      // Verify password
      try {
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
          return NextResponse.json(
            { error: 'Invalid password' },
            { status: 401 }
          )
        }
      } catch (bcryptError) {
        console.error('Bcrypt error:', bcryptError)
        return NextResponse.json(
          { error: 'Password verification failed' },
          { status: 500 }
        )
      }
    }

    // Delete user's related data first (foreign key constraints)
    // Use try-catch for each deletion to handle missing tables gracefully
    try {
      await executeQuery('DELETE FROM bookings WHERE user_id = ?', [userId])
    } catch (err) {
      console.log('Bookings deletion skipped:', err)
    }
    
    try {
      await executeQuery('DELETE FROM payment_proofs WHERE user_id = ?', [userId])
    } catch (err) {
      console.log('Payment proofs deletion skipped:', err)
    }
    
    try {
      await executeQuery('DELETE FROM reviews WHERE user_id = ?', [userId])
    } catch (err) {
      console.log('Reviews deletion skipped:', err)
    }
    
    try {
      await executeQuery('DELETE FROM messages WHERE user_id = ?', [userId])
    } catch (err) {
      console.log('Messages deletion skipped:', err)
    }
    
    try {
      await executeQuery('DELETE FROM chat_conversations WHERE user_id = ?', [userId])
    } catch (err) {
      console.log('Chat conversations deletion skipped:', err)
    }
    
    try {
      await executeQuery('DELETE FROM staff WHERE user_id = ?', [userId])
    } catch (err) {
      console.log('Staff deletion skipped:', err)
    }

    try {
      await executeQuery('DELETE FROM email_verifications WHERE user_id = ?', [userId])
    } catch (err) {
      console.log('Email verifications deletion skipped:', err)
    }

    // Finally, delete the user account
    await executeQuery('DELETE FROM users WHERE id = ?', [userId])

    return NextResponse.json(
      { message: 'Account deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      { error: `Failed to delete account: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
