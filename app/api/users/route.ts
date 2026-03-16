import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');

    let query = `
      SELECT 
        id,
        full_name,
        email,
        phone,
        role,
        created_at,
        updated_at
      FROM users
      WHERE 1=1
    `;
    const params: any[] = [];

    // Filter by role if specified
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    // Default to showing only regular users (customers) unless specified
    if (!role) {
      query += ' AND role = ?';
      params.push('user');
    }

    query += ' ORDER BY created_at DESC';

    const users = await executeQuery(query, params) as any[];

    // Transform the data for the frontend
    const transformedUsers = users.map((user: any) => ({
      id: user.id?.toString() || '',
      name: user.full_name || 'Unknown',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'user',
      registeredDate: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : '',
      lastUpdated: user.updated_at ? new Date(user.updated_at).toISOString().split('T')[0] : '',
      status: 'Active' // All users in database are considered active
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

    return NextResponse.json({
      users: transformedUsers,
      stats
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}