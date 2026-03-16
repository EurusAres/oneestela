import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    let query = `
      SELECT 
        s.id,
        s.user_id as userId,
        u.full_name,
        u.email,
        u.phone,
        s.position,
        s.department,
        s.hire_date as hireDate,
        s.salary,
        s.status,
        s.created_at as createdAt
      FROM staff s
      JOIN users u ON s.user_id = u.id
    `;
    const params: any[] = [];

    if (id) {
      query += ' WHERE s.id = ?';
      params.push(id);
    }

    query += ' ORDER BY u.full_name ASC';

    const results = await executeQuery(query, params) as any[];

    // Split full_name into firstName and lastName
    const staff = results.map((s: any) => {
      const nameParts = (s.full_name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      return {
        id: s.id?.toString() || '',
        userId: s.userId?.toString() || '',
        firstName,
        lastName,
        email: s.email || '',
        phone: s.phone || '',
        position: s.position || '',
        department: s.department || '',
        hireDate: s.hireDate || '',
        salary: s.salary?.toString() || '0',
        status: s.status || 'active',
        createdAt: s.createdAt || new Date().toISOString(),
      };
    });

    return NextResponse.json({ staff });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, position, department, hireDate, salary } = body;

    console.log('=== POST /api/staff ===');
    console.log('Received data:', { firstName, lastName, email, phone, position, department, hireDate, salary });

    // Validate required fields
    if (!firstName || !lastName || !email || !position || !hireDate) {
      console.log('Validation failed: missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: firstName, lastName, email, position, hireDate are required' },
        { status: 400 }
      );
    }

    // Check if user with this email already exists
    console.log('Checking for existing user with email:', email);
    const existingUsers = await executeQuery(
      'SELECT id, role FROM users WHERE email = ?',
      [email]
    ) as any[];

    console.log('Existing users found:', existingUsers.length);

    let userId;

    if (existingUsers.length > 0) {
      // User exists, use their ID
      userId = existingUsers[0].id;
      console.log('Using existing user ID:', userId);
      
      // Check if this user already has a staff record
      const existingStaff = await executeQuery(
        'SELECT id FROM staff WHERE user_id = ?',
        [userId]
      ) as any[];
      
      if (existingStaff.length > 0) {
        console.log('User already has a staff record');
        return NextResponse.json(
          { error: 'A staff record already exists for this email address' },
          { status: 400 }
        );
      }
    } else {
      // Create new user account
      const fullName = `${firstName} ${lastName}`.trim();
      console.log('Creating new user:', { fullName, email, phone });

      try {
        // Hash the default password
        const hashedPassword = await bcrypt.hash('staff123', 10);
        
        const userResult = await executeQuery(
          `INSERT INTO users 
           (full_name, email, phone, password_hash, role, created_at, updated_at)
           VALUES (?, ?, ?, ?, 'staff', NOW(), NOW())`,
          [fullName, email, phone || null, hashedPassword]
        );

        userId = (userResult as any).insertId;
        console.log('Created new user with ID:', userId);
      } catch (userError) {
        console.error('Error creating user:', userError);
        throw new Error(`Failed to create user: ${userError instanceof Error ? userError.message : 'Unknown error'}`);
      }
    }

    // Create staff record
    console.log('Creating staff record with data:', {
      userId,
      position,
      department: department || null,
      hireDate,
      salary: salary || 0
    });

    try {
      const staffResult = await executeQuery(
        `INSERT INTO staff 
         (user_id, position, department, hire_date, salary, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
        [userId, position, department || null, hireDate, parseFloat(salary) || 0]
      );

      const staffId = (staffResult as any).insertId;
      console.log('Staff created successfully with ID:', staffId);

      return NextResponse.json(
        { 
          message: 'Staff member added successfully',
          staffId,
          userId 
        },
        { status: 201 }
      );
    } catch (staffError) {
      console.error('Error creating staff record:', staffError);
      throw new Error(`Failed to create staff record: ${staffError instanceof Error ? staffError.message : 'Unknown error'}`);
    }

  } catch (error) {
    console.error('=== ERROR in POST /api/staff ===');
    console.error('Error:', error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing staff ID' },
        { status: 400 }
      );
    }

    const updates = await request.json();

    // Get the user_id for this staff member
    const [staffRecord] = await executeQuery(
      'SELECT user_id FROM staff WHERE id = ?',
      [id]
    ) as any[];

    if (!staffRecord) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }

    // Update staff table
    const staffUpdates: any = {};
    if (updates.position !== undefined) staffUpdates.position = updates.position;
    if (updates.department !== undefined) staffUpdates.department = updates.department;
    if (updates.hireDate !== undefined) staffUpdates.hire_date = updates.hireDate;
    if (updates.salary !== undefined) staffUpdates.salary = updates.salary;
    if (updates.status !== undefined) staffUpdates.status = updates.status;

    if (Object.keys(staffUpdates).length > 0) {
      const staffSetClause = Object.keys(staffUpdates).map(key => `${key} = ?`).join(', ');
      const staffValues = Object.values(staffUpdates);
      
      await executeQuery(
        `UPDATE staff SET ${staffSetClause}, updated_at = NOW() WHERE id = ?`,
        [...staffValues, id]
      );
    }

    // Update users table if name, email, or phone changed
    const userUpdates: any = {};
    if (updates.firstName || updates.lastName) {
      const firstName = updates.firstName || '';
      const lastName = updates.lastName || '';
      userUpdates.full_name = `${firstName} ${lastName}`.trim();
    }
    if (updates.email !== undefined) userUpdates.email = updates.email;
    if (updates.phone !== undefined) userUpdates.phone = updates.phone;

    if (Object.keys(userUpdates).length > 0) {
      const userSetClause = Object.keys(userUpdates).map(key => `${key} = ?`).join(', ');
      const userValues = Object.values(userUpdates);
      
      await executeQuery(
        `UPDATE users SET ${userSetClause}, updated_at = NOW() WHERE id = ?`,
        [...userValues, staffRecord.user_id]
      );
    }

    return NextResponse.json({ message: 'Staff member updated successfully' });
  } catch (error) {
    console.error('Error updating staff:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing staff ID' },
        { status: 400 }
      );
    }

    // Soft delete - set status to inactive
    await executeQuery(
      'UPDATE staff SET status = ?, updated_at = NOW() WHERE id = ?',
      ['inactive', id]
    );

    return NextResponse.json({ message: 'Staff member deactivated successfully' });
  } catch (error) {
    console.error('Error deleting staff:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
