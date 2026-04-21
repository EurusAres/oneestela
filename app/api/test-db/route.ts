import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const emergencyFix = searchParams.get('emergency') === 'true';
  
  if (emergencyFix) {
    return runEmergencyFix();
  }
  
  try {
    console.log('Testing database connection...')
    console.log('DB_HOST:', process.env.DB_HOST)
    console.log('DB_USER:', process.env.DB_USER)
    console.log('DB_NAME:', process.env.DB_NAME)
    console.log('DB_PORT:', process.env.DB_PORT)
    console.log('DB_PASSWORD exists:', !!process.env.DB_PASSWORD)
    
    // Test basic connection
    const result = await executeQuery('SELECT 1 as test')
    
    // Test users table
    const userCount = await executeQuery('SELECT COUNT(*) as count FROM users')
    
    // Get actual users (without passwords)
    const users = await executeQuery('SELECT id, email, full_name, role FROM users')
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      testQuery: result,
      userCount: userCount,
      users: users,
      env: {
        DB_HOST: process.env.DB_HOST,
        DB_USER: process.env.DB_USER,
        DB_NAME: process.env.DB_NAME,
        DB_PORT: process.env.DB_PORT,
        hasPassword: !!process.env.DB_PASSWORD
      }
    })
  } catch (error: any) {
    console.error('Database connection test failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      errno: error.errno,
      env: {
        DB_HOST: process.env.DB_HOST,
        DB_USER: process.env.DB_USER,
        DB_NAME: process.env.DB_NAME,
        DB_PORT: process.env.DB_PORT,
        hasPassword: !!process.env.DB_PASSWORD
      }
    }, { status: 500 })
  }
}

export async function POST() {
  return runEmergencyFix();
}

async function runEmergencyFix() {
  const results: any = {
    timestamp: new Date().toISOString(),
    fixes: [],
    errors: []
  };
  
  try {
    console.log('🚨 EMERGENCY DATABASE FIX STARTING...');
    
    // Fix 1: Ensure basic tables exist
    try {
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS users (
          id INT PRIMARY KEY AUTO_INCREMENT,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(255),
          phone VARCHAR(20),
          role ENUM('user', 'admin', 'staff') DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      results.fixes.push('✅ Users table ensured');
    } catch (error: any) {
      results.errors.push(`❌ Users table: ${error.message}`);
    }
    
    // Fix 2: Ensure venues table
    try {
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS venues (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(255) NOT NULL,
          description LONGTEXT,
          location VARCHAR(500),
          capacity INT,
          price_per_hour DECIMAL(10, 2),
          image_url VARCHAR(500),
          amenities JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      results.fixes.push('✅ Venues table ensured');
    } catch (error: any) {
      results.errors.push(`❌ Venues table: ${error.message}`);
    }
    
    // Fix 3: Ensure office_rooms table with all columns
    try {
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS office_rooms (
          id INT PRIMARY KEY AUTO_INCREMENT,
          venue_id INT DEFAULT 1,
          name VARCHAR(255) NOT NULL,
          description LONGTEXT,
          capacity INT,
          price_per_hour DECIMAL(10, 2),
          available_rooms INT DEFAULT 1,
          image_url VARCHAR(500),
          image_360_url VARCHAR(500),
          amenities JSON,
          type VARCHAR(100) DEFAULT 'office',
          status ENUM('available', 'maintenance', 'booked') DEFAULT 'available',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      results.fixes.push('✅ Office rooms table ensured');
    } catch (error: any) {
      results.errors.push(`❌ Office rooms table: ${error.message}`);
    }
    
    // Fix 4: Ensure bookings table with all columns
    try {
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS bookings (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          office_room_id INT,
          venue_id INT,
          event_name VARCHAR(255),
          event_type VARCHAR(100),
          check_in_date DATE,
          check_out_date DATE,
          date DATE,
          start_time TIME,
          end_time TIME,
          number_of_guests INT,
          guest_count INT,
          special_requests LONGTEXT,
          status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'declined') DEFAULT 'pending',
          decline_reason TEXT,
          total_price DECIMAL(10, 2),
          total_amount DECIMAL(10, 2),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      results.fixes.push('✅ Bookings table ensured');
    } catch (error: any) {
      results.errors.push(`❌ Bookings table: ${error.message}`);
    }
    
    // Fix 5: Ensure payment_proofs table
    try {
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS payment_proofs (
          id INT PRIMARY KEY AUTO_INCREMENT,
          booking_id INT NOT NULL,
          user_id INT NOT NULL,
          payment_method VARCHAR(100),
          amount DECIMAL(10, 2),
          proof_url VARCHAR(500),
          status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
          verification_notes LONGTEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      results.fixes.push('✅ Payment proofs table ensured');
    } catch (error: any) {
      results.errors.push(`❌ Payment proofs table: ${error.message}`);
    }
    
    // Fix 6: Ensure unavailable_dates table
    try {
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS unavailable_dates (
          id INT PRIMARY KEY AUTO_INCREMENT,
          venue_id INT NOT NULL DEFAULT 1,
          date DATE NOT NULL,
          reason VARCHAR(500),
          notes TEXT,
          created_by VARCHAR(255) DEFAULT 'admin',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      results.fixes.push('✅ Unavailable dates table ensured');
    } catch (error: any) {
      results.errors.push(`❌ Unavailable dates table: ${error.message}`);
    }
    
    // Fix 7: Ensure other required tables
    const otherTables = [
      {
        name: 'staff',
        sql: `CREATE TABLE IF NOT EXISTS staff (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          position VARCHAR(255),
          department VARCHAR(255),
          hire_date DATE,
          salary DECIMAL(10, 2),
          status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`
      },
      {
        name: 'reviews',
        sql: `CREATE TABLE IF NOT EXISTS reviews (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          office_room_id INT,
          venue_id INT,
          booking_id INT,
          rating INT CHECK (rating >= 1 AND rating <= 5),
          title VARCHAR(500),
          review_text LONGTEXT,
          is_approved BOOLEAN DEFAULT FALSE,
          is_featured BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`
      },
      {
        name: 'contact_messages',
        sql: `CREATE TABLE IF NOT EXISTS contact_messages (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT,
          name VARCHAR(255),
          email VARCHAR(255),
          subject VARCHAR(500),
          message LONGTEXT,
          status ENUM('unread', 'read', 'replied') DEFAULT 'unread',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`
      },
      {
        name: 'cms_content',
        sql: `CREATE TABLE IF NOT EXISTS cms_content (
          id INT PRIMARY KEY AUTO_INCREMENT,
          page_type ENUM('homepage', 'venue', 'office_room', 'about', 'faq', 'reviews') DEFAULT 'homepage',
          section_name VARCHAR(255),
          content_key VARCHAR(255),
          content_value LONGTEXT,
          display_order INT DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`
      }
    ];
    
    for (const table of otherTables) {
      try {
        await executeQuery(table.sql);
        results.fixes.push(`✅ ${table.name} table ensured`);
      } catch (error: any) {
        results.errors.push(`❌ ${table.name} table: ${error.message}`);
      }
    }
    
    // Fix 8: Add initial data if missing
    try {
      const [venueCount] = await executeQuery('SELECT COUNT(*) as count FROM venues') as any[];
      if (venueCount.count === 0) {
        await executeQuery(`
          INSERT INTO venues (id, name, description, location, capacity, price_per_hour, image_url) VALUES
          (1, 'One Estela Place', 'Premium event venue with elegant design and world-class facilities', '123 Estela Street, Downtown', 500, 150.00, '/images/venue-main.jpg')
        `);
        results.fixes.push('✅ Added initial venue data');
      }
    } catch (error: any) {
      results.errors.push(`❌ Initial venue data: ${error.message}`);
    }
    
    try {
      const [roomCount] = await executeQuery('SELECT COUNT(*) as count FROM office_rooms') as any[];
      if (roomCount.count === 0) {
        await executeQuery(`
          INSERT INTO office_rooms (venue_id, name, description, capacity, price_per_hour, image_url, amenities, available_rooms, type) VALUES
          (1, 'Executive Suite', 'Premium board room with panoramic views', 20, 250.00, '/images/executive-suite.jpg', '["WiFi", "Projector", "Whiteboard", "Coffee Service"]', 5, 'office'),
          (1, 'Conference Hall', 'Large conference space suitable for presentations', 100, 150.00, '/images/conference-hall.jpg', '["WiFi", "Audio System", "Stage", "Catering Available"]', 3, 'office'),
          (1, 'Meeting Room A', 'Intimate meeting space for small teams', 8, 75.00, '/images/meeting-room-a.jpg', '["WiFi", "Whiteboard", "Video Conference Setup"]', 10, 'office'),
          (1, 'Meeting Room B', 'Flexible meeting space', 10, 85.00, '/images/meeting-room-b.jpg', '["WiFi", "Whiteboard", "Smart TV"]', 8, 'office')
        `);
        results.fixes.push('✅ Added initial office room data');
      }
    } catch (error: any) {
      results.errors.push(`❌ Initial office room data: ${error.message}`);
    }
    
    // Fix 9: Ensure admin users exist
    try {
      const [adminCount] = await executeQuery('SELECT COUNT(*) as count FROM users WHERE role = "admin"') as any[];
      if (adminCount.count === 0) {
        await executeQuery(`
          INSERT INTO users (email, password_hash, full_name, phone, role) VALUES
          ('admin@oneestela.com', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUBu1qb0PS', 'Admin User', '+1-234-567-8900', 'admin'),
          ('estelatest1@gmail.com', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUBu1qb0PS', 'Admin User', '+1-234-567-8901', 'admin')
        `);
        results.fixes.push('✅ Added admin users');
      }
    } catch (error: any) {
      results.errors.push(`❌ Admin users: ${error.message}`);
    }
    
    console.log('🎉 EMERGENCY FIX COMPLETED!');
    
    return NextResponse.json({
      success: true,
      message: '🚨 EMERGENCY DATABASE FIX COMPLETED! 🎉',
      ...results
    });
    
  } catch (error) {
    console.error('❌ Emergency fix failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Emergency fix failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      ...results
    }, { status: 500 });
  }
}