import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET() {
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
    
    // Test all APIs
    const apiTests = [
      '/api/dashboard/stats',
      '/api/payment-proofs',
      '/api/unavailable-dates',
      '/api/office-rooms',
      '/api/users',
      '/api/staff'
    ];
    
    results.apiStatus = [];
    for (const api of apiTests) {
      try {
        // We can't test the actual HTTP endpoints from here, but we can test the database queries
        if (api === '/api/dashboard/stats') {
          await executeQuery('SELECT COUNT(*) FROM bookings');
          results.apiStatus.push(`✅ ${api} - Database ready`);
        } else if (api === '/api/payment-proofs') {
          await executeQuery('SELECT COUNT(*) FROM payment_proofs');
          results.apiStatus.push(`✅ ${api} - Database ready`);
        } else if (api === '/api/unavailable-dates') {
          await executeQuery('SELECT COUNT(*) FROM unavailable_dates');
          results.apiStatus.push(`✅ ${api} - Database ready`);
        } else if (api === '/api/office-rooms') {
          await executeQuery('SELECT COUNT(*) FROM office_rooms');
          results.apiStatus.push(`✅ ${api} - Database ready`);
        } else if (api === '/api/users') {
          await executeQuery('SELECT COUNT(*) FROM users');
          results.apiStatus.push(`✅ ${api} - Database ready`);
        } else if (api === '/api/staff') {
          await executeQuery('SELECT COUNT(*) FROM staff');
          results.apiStatus.push(`✅ ${api} - Database ready`);
        }
      } catch (error: any) {
        results.apiStatus.push(`❌ ${api} - ${error.message}`);
      }
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