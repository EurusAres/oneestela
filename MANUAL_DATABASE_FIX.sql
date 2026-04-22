-- MANUAL DATABASE FIX FOR ONE ESTELA PLACE
-- Run this script directly in MySQL Workbench or Aiven Console
-- This will create all missing tables and fix the database schema

USE one_estela_place;

-- 1. Create missing email verification tables
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
);

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
);

-- 2. Create missing user_info table
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
);

-- 3. Create missing homepage_content table
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
);

-- 4. Create missing unavailable_offices table
CREATE TABLE IF NOT EXISTS unavailable_offices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  office_room_id INT NOT NULL,
  unavailable_rooms INT NOT NULL DEFAULT 1,
  reason VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_office_room_id (office_room_id)
);

-- 5. Create missing chat_messages table
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
);

-- 6. Add missing columns to existing tables
-- Add check_in_date to bookings if missing
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'bookings' 
   AND COLUMN_NAME = 'check_in_date') = 0,
  'ALTER TABLE bookings ADD COLUMN check_in_date DATE AFTER event_type',
  'SELECT "check_in_date column already exists" as status'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add check_out_date to bookings if missing
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'bookings' 
   AND COLUMN_NAME = 'check_out_date') = 0,
  'ALTER TABLE bookings ADD COLUMN check_out_date DATE AFTER check_in_date',
  'SELECT "check_out_date column already exists" as status'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add number_of_guests to bookings if missing
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'bookings' 
   AND COLUMN_NAME = 'number_of_guests') = 0,
  'ALTER TABLE bookings ADD COLUMN number_of_guests INT AFTER end_time',
  'SELECT "number_of_guests column already exists" as status'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add total_price to bookings if missing
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'bookings' 
   AND COLUMN_NAME = 'total_price') = 0,
  'ALTER TABLE bookings ADD COLUMN total_price DECIMAL(10, 2) AFTER decline_reason',
  'SELECT "total_price column already exists" as status'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add available_rooms to office_rooms if missing
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'office_rooms' 
   AND COLUMN_NAME = 'available_rooms') = 0,
  'ALTER TABLE office_rooms ADD COLUMN available_rooms INT DEFAULT 1 AFTER price_per_hour',
  'SELECT "available_rooms column already exists" as status'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add image_360_url to office_rooms if missing
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'office_rooms' 
   AND COLUMN_NAME = 'image_360_url') = 0,
  'ALTER TABLE office_rooms ADD COLUMN image_360_url VARCHAR(500) AFTER image_url',
  'SELECT "image_360_url column already exists" as status'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add type to office_rooms if missing
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'office_rooms' 
   AND COLUMN_NAME = 'type') = 0,
  'ALTER TABLE office_rooms ADD COLUMN type VARCHAR(100) DEFAULT "office" AFTER amenities',
  'SELECT "type column already exists" as status'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add created_by to unavailable_dates if missing
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'unavailable_dates' 
   AND COLUMN_NAME = 'created_by') = 0,
  'ALTER TABLE unavailable_dates ADD COLUMN created_by VARCHAR(255) DEFAULT "admin" AFTER notes',
  'SELECT "created_by column already exists" as status'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 7. Add missing indexes for performance
ALTER TABLE bookings ADD INDEX IF NOT EXISTS idx_check_in_date (check_in_date);
ALTER TABLE chat_messages ADD INDEX IF NOT EXISTS idx_created_at (created_at);
ALTER TABLE reviews ADD INDEX IF NOT EXISTS idx_is_approved (is_approved);
ALTER TABLE email_verifications ADD INDEX IF NOT EXISTS idx_expires_at (expires_at);
ALTER TABLE verification_codes ADD INDEX IF NOT EXISTS idx_expires_at (expires_at);

-- 8. Update existing data to use new columns
UPDATE office_rooms SET available_rooms = 1 WHERE available_rooms IS NULL;
UPDATE office_rooms SET type = 'office' WHERE type IS NULL OR type = '';

-- Copy legacy data to new columns
UPDATE bookings SET total_price = total_amount WHERE total_price IS NULL AND total_amount IS NOT NULL;
UPDATE bookings SET number_of_guests = guest_count WHERE number_of_guests IS NULL AND guest_count IS NOT NULL;
UPDATE bookings SET check_in_date = date WHERE check_in_date IS NULL AND date IS NOT NULL;
UPDATE bookings SET check_out_date = check_in_date WHERE check_out_date IS NULL AND check_in_date IS NOT NULL;

-- 9. Insert initial homepage content if table is empty
INSERT IGNORE INTO homepage_content (
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
  'Monday - Friday: 9:00 AM - 10:00 PM\nSaturday - Sunday: 10:00 AM - 11:00 PM'
);

-- 10. Ensure admin users exist with correct passwords
INSERT IGNORE INTO users (email, password_hash, full_name, phone, role) VALUES
('admin@oneestela.com', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUBu1qb0PS', 'Admin User', '+1-234-567-8900', 'admin'),
('estelatest1@gmail.com', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUBu1qb0PS', 'Admin User', '+1-234-567-8901', 'admin');

-- Update existing admin passwords to the correct hash for 'admin123'
UPDATE users SET password_hash = '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUBu1qb0PS' 
WHERE email IN ('admin@oneestela.com', 'estelatest1@gmail.com');

-- 11. Ensure initial venue and office rooms exist
INSERT IGNORE INTO venues (id, name, description, location, capacity, price_per_hour, image_url) VALUES
(1, 'One Estela Place', 'Premium event venue with elegant design and world-class facilities', '123 Estela Street, Downtown', 500, 150.00, '/images/venue-main.jpg');

INSERT IGNORE INTO office_rooms (venue_id, name, description, capacity, price_per_hour, image_url, amenities, available_rooms, type) VALUES
(1, 'Executive Suite', 'Premium board room with panoramic views', 20, 250.00, '/images/executive-suite.jpg', '["WiFi", "Projector", "Whiteboard", "Coffee Service"]', 5, 'office'),
(1, 'Conference Hall', 'Large conference space suitable for presentations', 100, 150.00, '/images/conference-hall.jpg', '["WiFi", "Audio System", "Stage", "Catering Available"]', 3, 'office'),
(1, 'Meeting Room A', 'Intimate meeting space for small teams', 8, 75.00, '/images/meeting-room-a.jpg', '["WiFi", "Whiteboard", "Video Conference Setup"]', 10, 'office'),
(1, 'Meeting Room B', 'Flexible meeting space', 10, 85.00, '/images/meeting-room-b.jpg', '["WiFi", "Whiteboard", "Smart TV"]', 8, 'office');

-- 12. Insert initial CMS content
INSERT IGNORE INTO cms_content (page_type, section_name, content_key, content_value, display_order, is_active) VALUES
('homepage', 'hero', 'title', 'Welcome to One Estela Place', 1, TRUE),
('homepage', 'hero', 'description', 'Premium venue for your perfect event', 2, TRUE),
('homepage', 'features', 'title', 'State-of-the-Art Facilities', 3, TRUE),
('homepage', 'features', 'description', 'Our venue features cutting-edge technology and elegant design', 4, TRUE);

SELECT 'Manual database fix completed successfully!' as status;