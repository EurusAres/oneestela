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
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_email (email),
          INDEX idx_role (role)
        )
      `);
      results.fixes.push('✅ Users table ensured');
    } catch (error: any) {
      results.errors.push(`❌ Users table: ${error.message}`);
    }

    // Fix 1.1: Create missing email verification tables
    try {
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS email_verifications (
          id INT PRIMARY KEY AUTO_INCREMENT,
          email VARCHAR(255) UNIQUE NOT NULL,
          code VARCHAR(6) NOT NULL,
          verified BOOLEAN DEFAULT FALSE,
          expires_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_email (email),
          INDEX idx_code (code),
          INDEX idx_expires_at (expires_at)
        )
      `);
      results.fixes.push('✅ Email verifications table ensured');
    } catch (error: any) {
      results.errors.push(`❌ Email verifications table: ${error.message}`);
    }

    try {
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS verification_codes (
          id INT PRIMARY KEY AUTO_INCREMENT,
          email VARCHAR(255) UNIQUE NOT NULL,
          code VARCHAR(6) NOT NULL,
          used BOOLEAN DEFAULT FALSE,
          expires_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_email (email),
          INDEX idx_code (code),
          INDEX idx_expires_at (expires_at)
        )
      `);
      results.fixes.push('✅ Verification codes table ensured');
    } catch (error: any) {
      results.errors.push(`❌ Verification codes table: ${error.message}`);
    }

    // Fix 1.2: Create user_info table
    try {
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS user_info (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL UNIQUE,
          company_name VARCHAR(255),
          company_email VARCHAR(255),
          contact_number VARCHAR(20),
          address VARCHAR(500),
          profile_picture_url VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_user_id (user_id)
        )
      `);
      results.fixes.push('✅ User info table ensured');
    } catch (error: any) {
      results.errors.push(`❌ User info table: ${error.message}`);
    }

    // Fix 1.3: Create homepage_content table
    try {
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS homepage_content (
          id INT PRIMARY KEY AUTO_INCREMENT,
          hero_title VARCHAR(255),
          hero_description LONGTEXT,
          hero_image VARCHAR(500),
          about_title VARCHAR(255),
          about_description LONGTEXT,
          cta_title VARCHAR(255),
          cta_description LONGTEXT,
          cta_button_text VARCHAR(255),
          features JSON,
          contact_location LONGTEXT,
          contact_phone VARCHAR(20),
          contact_email VARCHAR(255),
          contact_hours LONGTEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      results.fixes.push('✅ Homepage content table ensured');
    } catch (error: any) {
      results.errors.push(`❌ Homepage content table: ${error.message}`);
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
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_name (name)
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
          venue_id INT NOT NULL DEFAULT 1,
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
          total_rooms INT DEFAULT 1,
          unavailable_rooms INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_venue_id (venue_id),
          INDEX idx_name (name),
          INDEX idx_status (status)
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
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_user_id (user_id),
          INDEX idx_office_room_id (office_room_id),
          INDEX idx_venue_id (venue_id),
          INDEX idx_status (status),
          INDEX idx_date (date),
          INDEX idx_check_in_date (check_in_date)
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
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_booking_id (booking_id),
          INDEX idx_user_id (user_id),
          INDEX idx_status (status)
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
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY unique_venue_date (venue_id, date),
          INDEX idx_venue_id (venue_id),
          INDEX idx_date (date)
        )
      `);
      results.fixes.push('✅ Unavailable dates table ensured');
    } catch (error: any) {
      results.errors.push(`❌ Unavailable dates table: ${error.message}`);
    }

    // Fix 6.1: Ensure unavailable_offices table
    try {
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS unavailable_offices (
          id INT PRIMARY KEY AUTO_INCREMENT,
          office_room_id INT NOT NULL,
          unavailable_rooms INT NOT NULL DEFAULT 1,
          reason VARCHAR(500),
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_office_room_id (office_room_id)
        )
      `);
      results.fixes.push('✅ Unavailable offices table ensured');
    } catch (error: any) {
      results.errors.push(`❌ Unavailable offices table: ${error.message}`);
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
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_user_id (user_id),
          INDEX idx_status (status)
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
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_user_id (user_id),
          INDEX idx_office_room_id (office_room_id),
          INDEX idx_venue_id (venue_id),
          INDEX idx_rating (rating),
          INDEX idx_is_approved (is_approved),
          INDEX idx_is_featured (is_featured)
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
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_user_id (user_id),
          INDEX idx_status (status),
          INDEX idx_created_at (created_at)
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
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY unique_page_section (page_type, section_name, content_key),
          INDEX idx_page_type (page_type),
          INDEX idx_is_active (is_active)
        )`
      },
      {
        name: 'chat_messages',
        sql: `CREATE TABLE IF NOT EXISTS chat_messages (
          id INT PRIMARY KEY AUTO_INCREMENT,
          sender_id INT NOT NULL,
          receiver_id INT,
          booking_id INT,
          message TEXT,
          message_type ENUM('text', 'file', 'system') DEFAULT 'text',
          file_url VARCHAR(500),
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_sender_id (sender_id),
          INDEX idx_receiver_id (receiver_id),
          INDEX idx_booking_id (booking_id),
          INDEX idx_created_at (created_at),
          INDEX idx_is_read (is_read)
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

    // Fix 8: Add missing columns to existing tables (if they don't exist)
    const columnFixes = [
      {
        table: 'bookings',
        column: 'check_in_date',
        sql: 'ALTER TABLE bookings ADD COLUMN check_in_date DATE AFTER event_type'
      },
      {
        table: 'bookings',
        column: 'check_out_date',
        sql: 'ALTER TABLE bookings ADD COLUMN check_out_date DATE AFTER check_in_date'
      },
      {
        table: 'bookings',
        column: 'number_of_guests',
        sql: 'ALTER TABLE bookings ADD COLUMN number_of_guests INT AFTER end_time'
      },
      {
        table: 'bookings',
        column: 'total_price',
        sql: 'ALTER TABLE bookings ADD COLUMN total_price DECIMAL(10, 2) AFTER decline_reason'
      },
      {
        table: 'office_rooms',
        column: 'available_rooms',
        sql: 'ALTER TABLE office_rooms ADD COLUMN available_rooms INT DEFAULT 1 AFTER price_per_hour'
      },
      {
        table: 'office_rooms',
        column: 'image_360_url',
        sql: 'ALTER TABLE office_rooms ADD COLUMN image_360_url VARCHAR(500) AFTER image_url'
      },
      {
        table: 'office_rooms',
        column: 'type',
        sql: 'ALTER TABLE office_rooms ADD COLUMN type VARCHAR(100) DEFAULT "office" AFTER amenities'
      },
      {
        table: 'unavailable_dates',
        column: 'created_by',
        sql: 'ALTER TABLE unavailable_dates ADD COLUMN created_by VARCHAR(255) DEFAULT "admin" AFTER notes'
      }
    ];

    for (const fix of columnFixes) {
      try {
        // Check if column exists
        const columnExists = await executeQuery(`
          SELECT COUNT(*) as count 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = ? 
          AND COLUMN_NAME = ?
        `, [fix.table, fix.column]) as any[];

        if (columnExists[0].count === 0) {
          await executeQuery(fix.sql);
          results.fixes.push(`✅ Added ${fix.column} column to ${fix.table} table`);
        }
      } catch (error: any) {
        results.errors.push(`❌ Adding ${fix.column} to ${fix.table}: ${error.message}`);
      }
    }
    
    // Fix 9: Add initial data if missing
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

    // Fix 10: Add initial homepage content
    try {
      const [contentCount] = await executeQuery('SELECT COUNT(*) as count FROM homepage_content') as any[];
      if (contentCount.count === 0) {
        await executeQuery(`
          INSERT INTO homepage_content (
            id, hero_title, hero_description, hero_image, 
            about_title, about_description, 
            cta_title, cta_description, cta_button_text,
            features, contact_location, contact_phone, contact_email, contact_hours
          ) VALUES (
            1,
            'Welcome to One Estela Place',
            'The perfect venue for your special events and celebrations',
            '/images/hero-bg.jpg',
            'About Our Venue',
            'One Estela Place offers premium event spaces with elegant design and world-class facilities for all your special occasions.',
            'Book Your Event Today',
            'Ready to host your next event? Contact us to check availability and pricing.',
            'Reserve Now',
            '["WiFi", "Audio/Visual Equipment", "Catering Services", "Parking", "Climate Control", "Professional Staff"]',
            '123 Estela Street, Downtown District, City',
            '+1 (555) 123-4567',
            'info@oneestela.com',
            'Monday - Friday: 9:00 AM - 10:00 PM\\nSaturday - Sunday: 10:00 AM - 11:00 PM'
          )
        `);
        results.fixes.push('✅ Added initial homepage content');
      }
    } catch (error: any) {
      results.errors.push(`❌ Initial homepage content: ${error.message}`);
    }

    // Fix 11: Add initial CMS content
    try {
      const [cmsCount] = await executeQuery('SELECT COUNT(*) as count FROM cms_content') as any[];
      if (cmsCount.count === 0) {
        await executeQuery(`
          INSERT INTO cms_content (page_type, section_name, content_key, content_value, display_order, is_active) VALUES
          ('homepage', 'hero', 'title', 'Welcome to One Estela Place', 1, TRUE),
          ('homepage', 'hero', 'description', 'Premium venue for your perfect event', 2, TRUE),
          ('homepage', 'features', 'title', 'State-of-the-Art Facilities', 3, TRUE),
          ('homepage', 'features', 'description', 'Our venue features cutting-edge technology and elegant design', 4, TRUE)
        `);
        results.fixes.push('✅ Added initial CMS content');
      }
    } catch (error: any) {
      results.errors.push(`❌ Initial CMS content: ${error.message}`);
    }
    
    // Fix 12: Ensure admin users exist with correct passwords
    try {
      const [adminCount] = await executeQuery('SELECT COUNT(*) as count FROM users WHERE role = "admin"') as any[];
      if (adminCount.count === 0) {
        await executeQuery(`
          INSERT INTO users (email, password_hash, full_name, phone, role) VALUES
          ('admin@oneestela.com', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUBu1qb0PS', 'Admin User', '+1-234-567-8900', 'admin'),
          ('estelatest1@gmail.com', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUBu1qb0PS', 'Admin User', '+1-234-567-8901', 'admin')
        `);
        results.fixes.push('✅ Added admin users');
      } else {
        // Update existing admin passwords to ensure they're correct
        await executeQuery(`
          UPDATE users SET password_hash = '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUBu1qb0PS' 
          WHERE email IN ('admin@oneestela.com', 'estelatest1@gmail.com')
        `);
        results.fixes.push('✅ Updated admin user passwords');
      }
    } catch (error: any) {
      results.errors.push(`❌ Admin users: ${error.message}`);
    }

    // Fix 13: Update existing data to use new columns
    try {
      await executeQuery('UPDATE office_rooms SET available_rooms = 1 WHERE available_rooms IS NULL');
      await executeQuery('UPDATE office_rooms SET type = "office" WHERE type IS NULL OR type = ""');
      await executeQuery('UPDATE bookings SET total_price = total_amount WHERE total_price IS NULL AND total_amount IS NOT NULL');
      await executeQuery('UPDATE bookings SET number_of_guests = guest_count WHERE number_of_guests IS NULL AND guest_count IS NOT NULL');
      await executeQuery('UPDATE bookings SET check_in_date = date WHERE check_in_date IS NULL AND date IS NOT NULL');
      await executeQuery('UPDATE bookings SET check_out_date = check_in_date WHERE check_out_date IS NULL AND check_in_date IS NOT NULL');
      results.fixes.push('✅ Updated existing data to use new columns');
    } catch (error: any) {
      results.errors.push(`❌ Updating existing data: ${error.message}`);
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