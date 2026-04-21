-- Database Schema Fix for One Estela Place
-- Run this script to add missing columns and fix schema issues

USE one_estela_place;

-- Add missing columns to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS check_in_date DATE AFTER event_type,
ADD COLUMN IF NOT EXISTS check_out_date DATE AFTER check_in_date,
ADD COLUMN IF NOT EXISTS number_of_guests INT AFTER end_time,
ADD COLUMN IF NOT EXISTS total_price DECIMAL(10, 2) AFTER decline_reason;

-- Add missing columns to office_rooms table
ALTER TABLE office_rooms 
ADD COLUMN IF NOT EXISTS available_rooms INT DEFAULT 1 AFTER price_per_hour,
ADD COLUMN IF NOT EXISTS image_360_url VARCHAR(500) AFTER image_url,
ADD COLUMN IF NOT EXISTS type VARCHAR(100) DEFAULT 'office' AFTER amenities;

-- Add missing column to unavailable_dates table
ALTER TABLE unavailable_dates 
ADD COLUMN IF NOT EXISTS created_by VARCHAR(255) DEFAULT 'admin' AFTER notes;

-- Update unavailable_offices table structure
ALTER TABLE unavailable_offices 
DROP FOREIGN KEY IF EXISTS unavailable_offices_ibfk_1;

DROP TABLE IF EXISTS unavailable_offices;

CREATE TABLE unavailable_offices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  office_room_id INT NOT NULL,
  unavailable_rooms INT NOT NULL DEFAULT 1,
  reason VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (office_room_id) REFERENCES office_rooms(id) ON DELETE CASCADE,
  INDEX idx_office_room_id (office_room_id)
);

-- Update existing office rooms to have available_rooms if NULL
UPDATE office_rooms SET available_rooms = 1 WHERE available_rooms IS NULL;
UPDATE office_rooms SET type = 'office' WHERE type IS NULL;

-- Copy data from total_amount to total_price if needed
UPDATE bookings SET total_price = total_amount WHERE total_price IS NULL AND total_amount IS NOT NULL;

-- Copy data from guest_count to number_of_guests if needed  
UPDATE bookings SET number_of_guests = guest_count WHERE number_of_guests IS NULL AND guest_count IS NOT NULL;

-- Copy data from date to check_in_date if needed
UPDATE bookings SET check_in_date = date WHERE check_in_date IS NULL AND date IS NOT NULL;

-- Set check_out_date to same as check_in_date for single day bookings
UPDATE bookings SET check_out_date = check_in_date WHERE check_out_date IS NULL AND check_in_date IS NOT NULL;

-- Update office rooms amenities to be proper JSON if they're strings
UPDATE office_rooms 
SET amenities = CASE 
  WHEN amenities IS NULL THEN JSON_ARRAY()
  WHEN JSON_VALID(amenities) = 0 THEN JSON_ARRAY(amenities)
  ELSE amenities
END;

-- Ensure admin user exists with correct password hash
INSERT IGNORE INTO users (email, password_hash, full_name, phone, role) VALUES
('admin@oneestela.com', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUBu1qb0PS', 'Admin User', '+1-234-567-8900', 'admin'),
('estelatest1@gmail.com', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUBu1qb0PS', 'Admin User', '+1-234-567-8901', 'admin');

-- Update existing admin passwords to the correct hash for 'admin123'
UPDATE users SET password_hash = '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUBu1qb0PS' 
WHERE email IN ('admin@oneestela.com', 'estelatest1@gmail.com');

SELECT 'Database schema fix completed successfully' as status;