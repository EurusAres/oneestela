import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const includePasswords = searchParams.get('includePasswords') === 'true';

    console.log('API Request params:', { role, status, includePasswords });

    let query = `
      SELECT 
        id,
        full_name,
        email,
        phone,
        role,
        created_at,
        updated_at
        ${includePasswords ? ', password_hash' : ''}
      FROM users
      WHERE 1=1
    `;
    const params: any[] = [];

    // When fetching passwords, get all users regardless of role
    if (!includePasswords) {
      // Filter by role if specified and not fetching passwords
      if (role) {
        query += ' AND role = ?';
        params.push(role);
      }

      // Default to showing only regular users (customers) unless specified
      if (!role) {
        query += ' AND role = ?';
        params.push('user');
      }
    }

    query += ' ORDER BY created_at DESC';

    console.log('Executing query:', query, 'with params:', params);

    const users = await executeQuery(query, params) as any[];
    
    console.log('Query result:', users.length, 'users found');

    // Transform the data for the frontend
    const transformedUsers = users.map((user: any) => ({
      id: user.id?.toString() || '',
      name: user.full_name || 'Unknown',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'user',
      registeredDate: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : '',
      lastUpdated: user.updated_at ? new Date(user.updated_at).toISOString().split('T')[0] : '',
      status: 'Active', // All users in database are considered active
      ...(includePasswords && { password: user.password_hash || '' })
    }));

    // Calculate statistics for customers only
    const allUsersQuery = 'SELECT role FROM users';
    const allUsers = await executeQuery(allUsersQuery) as any[];
    
    const stats = {
      total: allUsers.length,
      active: transformedUsers.filter(u => u.status === 'Active').length,
      inactive: transformedUsers.filter(u => u.status === 'Inactive').length,
      byRole: {
        user: allUsers.filter((u: any) => u.role === 'user').length,
        staff: allUsers.filter((u: any) => u.role === 'staff').length,
        admin: allUsers.filter((u: any) => u.role === 'admin').length,
      }
    };

    console.log('Returning response with', transformedUsers.length, 'users');

    return NextResponse.json({
      users: transformedUsers,
      stats
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const checkQuery = 'SELECT id, role FROM users WHERE id = ?';
    const existingUser = await executeQuery(checkQuery, [id]) as any[];

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deletion of admin users for security
    if (existingUser[0].role === 'admin') {
      return NextResponse.json(
        { error: 'Cannot delete admin users' },
        { status: 403 }
      );
    }

    // Delete the user
    const deleteQuery = 'DELETE FROM users WHERE id = ?';
    await executeQuery(deleteQuery, [id]);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}