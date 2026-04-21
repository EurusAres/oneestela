import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function POST() {
  try {
    console.log('🔧 Starting database schema fixes...');
    
    const fixes = [];
    
    // Add missing columns to bookings table
    try {
      await executeQuery(`
        ALTER TABLE bookings 
        ADD COLUMN IF NOT EXISTS check_in_date DATE AFTER event_type
      `);
      fixes.push('Added check_in_date column to bookings');
    } catch (error: any) {
      if (!error.message.includes('Duplicate column')) {
        console.log('check_in_date column issue:', error.message);
      }
    }
    
    try {
      await executeQuery(`
        ALTER TABLE bookings 
        ADD COLUMN IF NOT EXISTS check_out_date DATE AFTER check_in_date
      `);
      fixes.push('Added check_out_date column to bookings');
    } catch (error: any) {
      if (!error.message.includes('Duplicate column')) {
        console.log('check_out_date column issue:', error.message);
      }
    }
    
    try {
      await executeQuery(`
        ALTER TABLE bookings 
        ADD COLUMN IF NOT EXISTS number_of_guests INT AFTER end_time
      `);
      fixes.push('Added number_of_guests column to bookings');
    } catch (error: any) {
      if (!error.message.includes('Duplicate column')) {
        console.log('number_of_guests column issue:', error.message);
      }
    }
    
    try {
      await executeQuery(`
        ALTER TABLE bookings 
        ADD COLUMN IF NOT EXISTS total_price DECIMAL(10, 2) AFTER decline_reason
      `);
      fixes.push('Added total_price column to bookings');
    } catch (error: any) {
      if (!error.message.includes('Duplicate column')) {
        console.log('total_price column issue:', error.message);
      }
    }
    
    // Add missing columns to office_rooms table
    try {
      await executeQuery(`
        ALTER TABLE office_rooms 
        ADD COLUMN IF NOT EXISTS available_rooms INT DEFAULT 1 AFTER price_per_hour
      `);
      fixes.push('Added available_rooms column to office_rooms');
    } catch (error: any) {
      if (!error.message.includes('Duplicate column')) {
        console.log('available_rooms column issue:', error.message);
      }
    }
    
    try {
      await executeQuery(`
        ALTER TABLE office_rooms 
        ADD COLUMN IF NOT EXISTS image_360_url VARCHAR(500) AFTER image_url
      `);
      fixes.push('Added image_360_url column to office_rooms');
    } catch (error: any) {
      if (!error.message.includes('Duplicate column')) {
        console.log('image_360_url column issue:', error.message);
      }
    }
    
    try {
      await executeQuery(`
        ALTER TABLE office_rooms 
        ADD COLUMN IF NOT EXISTS type VARCHAR(100) DEFAULT 'office' AFTER amenities
      `);
      fixes.push('Added type column to office_rooms');
    } catch (error: any) {
      if (!error.message.includes('Duplicate column')) {
        console.log('type column issue:', error.message);
      }
    }
    
    // Add missing column to unavailable_dates table
    try {
      await executeQuery(`
        ALTER TABLE unavailable_dates 
        ADD COLUMN IF NOT EXISTS created_by VARCHAR(255) DEFAULT 'admin' AFTER notes
      `);
      fixes.push('Added created_by column to unavailable_dates');
    } catch (error: any) {
      if (!error.message.includes('Duplicate column')) {
        console.log('created_by column issue:', error.message);
      }
    }
    
    // Update existing data
    try {
      await executeQuery(`UPDATE office_rooms SET available_rooms = 1 WHERE available_rooms IS NULL`);
      fixes.push('Updated NULL available_rooms to 1');
    } catch (error: any) {
      console.log('available_rooms update issue:', error.message);
    }
    
    try {
      await executeQuery(`UPDATE office_rooms SET type = 'office' WHERE type IS NULL`);
      fixes.push('Updated NULL type to office');
    } catch (error: any) {
      console.log('type update issue:', error.message);
    }
    
    try {
      await executeQuery(`UPDATE bookings SET total_price = total_amount WHERE total_price IS NULL AND total_amount IS NOT NULL`);
      fixes.push('Copied total_amount to total_price');
    } catch (error: any) {
      console.log('total_price copy issue:', error.message);
    }
    
    try {
      await executeQuery(`UPDATE bookings SET number_of_guests = guest_count WHERE number_of_guests IS NULL AND guest_count IS NOT NULL`);
      fixes.push('Copied guest_count to number_of_guests');
    } catch (error: any) {
      console.log('number_of_guests copy issue:', error.message);
    }
    
    try {
      await executeQuery(`UPDATE bookings SET check_in_date = date WHERE check_in_date IS NULL AND date IS NOT NULL`);
      fixes.push('Copied date to check_in_date');
    } catch (error: any) {
      console.log('check_in_date copy issue:', error.message);
    }
    
    try {
      await executeQuery(`UPDATE bookings SET check_out_date = check_in_date WHERE check_out_date IS NULL AND check_in_date IS NOT NULL`);
      fixes.push('Set check_out_date to check_in_date for single day bookings');
    } catch (error: any) {
      console.log('check_out_date copy issue:', error.message);
    }
    
    // Ensure all required tables exist
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
      fixes.push('Ensured payment_proofs table exists');
    } catch (error: any) {
      console.log('payment_proofs table creation issue:', error.message);
    }
    
    try {
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS cms_content (
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
        )
      `);
      fixes.push('Ensured cms_content table exists');
    } catch (error: any) {
      console.log('cms_content table creation issue:', error.message);
    }
    
    try {
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS chat_messages (
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
        )
      `);
      fixes.push('Ensured chat_messages table exists');
    } catch (error: any) {
      console.log('chat_messages table creation issue:', error.message);
    }
    
    try {
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS contact_messages (
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
        )
      `);
      fixes.push('Ensured contact_messages table exists');
    } catch (error: any) {
      console.log('contact_messages table creation issue:', error.message);
    }
    
    try {
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS reviews (
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
        )
      `);
      fixes.push('Ensured reviews table exists');
    } catch (error: any) {
      console.log('reviews table creation issue:', error.message);
    }
    
    try {
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS staff (
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
        )
      `);
      fixes.push('Ensured staff table exists');
    } catch (error: any) {
      console.log('staff table creation issue:', error.message);
    }
    
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
      fixes.push('Ensured venues table exists');
    } catch (error: any) {
      console.log('venues table creation issue:', error.message);
    }
    
    // Add initial data if tables are empty
    try {
      const [venueCount] = await executeQuery('SELECT COUNT(*) as count FROM venues') as any[];
      if (venueCount.count === 0) {
        await executeQuery(`
          INSERT INTO venues (id, name, description, location, capacity, price_per_hour, image_url) VALUES
          (1, 'One Estela Place', 'Premium event venue with elegant design and world-class facilities', '123 Estela Street, Downtown', 500, 150.00, '/images/venue-main.jpg')
        `);
        fixes.push('Added initial venue data');
      }
    } catch (error: any) {
      console.log('Initial venue data issue:', error.message);
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
        fixes.push('Added initial office room data');
      }
    } catch (error: any) {
      console.log('Initial office room data issue:', error.message);
    }
    
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
        fixes.push('Added initial CMS content data');
      }
    } catch (error: any) {
      console.log('Initial CMS content data issue:', error.message);
    }
    
    try {
      await executeQuery(`DROP TABLE IF EXISTS unavailable_offices`);
      await executeQuery(`
        CREATE TABLE unavailable_offices (
          id INT PRIMARY KEY AUTO_INCREMENT,
          office_room_id INT NOT NULL,
          unavailable_rooms INT NOT NULL DEFAULT 1,
          reason VARCHAR(500),
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (office_room_id) REFERENCES office_rooms(id) ON DELETE CASCADE,
          INDEX idx_office_room_id (office_room_id)
        )
      `);
      fixes.push('Recreated unavailable_offices table with correct structure');
    } catch (error: any) {
      console.log('unavailable_offices table issue:', error.message);
    }
    
    // Verify table structures
    const verifications = [];
    
    try {
      const bookingsCols = await executeQuery('DESCRIBE bookings') as any[];
      verifications.push({
        table: 'bookings',
        columns: bookingsCols.map((c: any) => c.Field)
      });
    } catch (error: any) {
      console.log('Bookings verification failed:', error.message);
    }
    
    try {
      const roomsCols = await executeQuery('DESCRIBE office_rooms') as any[];
      verifications.push({
        table: 'office_rooms',
        columns: roomsCols.map((c: any) => c.Field)
      });
    } catch (error: any) {
      console.log('Office rooms verification failed:', error.message);
    }
    
    console.log('✅ Database schema fixes completed!');
    
    return NextResponse.json({
      success: true,
      message: 'Database schema fixes completed successfully',
      fixes,
      verifications
    });
    
  } catch (error) {
    console.error('❌ Database fix failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Database fix failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Database fix endpoint. Use POST to run fixes.',
    usage: 'POST /api/fix-database'
  });
}