-- One Estela Place - Complete Database Schema for Deployment
-- This file contains the complete database structure and initial data

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS one_estela_place;
USE one_estela_place;

-- Create Users table
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
);

-- Create User Info table
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
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

-- Create Venues table
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
);

-- Create Office Rooms table
CREATE TABLE IF NOT EXISTS office_rooms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  venue_id INT NOT NULL,
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
  FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
  INDEX idx_venue_id (venue_id),
  INDEX idx_name (name),
  INDEX idx_status (status)
);

-- Create Bookings table with all required columns
CREATE TABLE IF NOT EXISTS bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  office_room_id INT,
  venue_id INT,
  event_name VARCHAR(255),
  event_type VARCHAR(100),
  check_in_date DATE,
  check_out_date DATE,
  date DATE, -- Legacy column for compatibility
  start_time TIME,
  end_time TIME,
  number_of_guests INT,
  guest_count INT, -- Legacy column for compatibility
  special_requests LONGTEXT,
  status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'declined') DEFAULT 'pending',
  decline_reason TEXT,
  total_price DECIMAL(10, 2),
  total_amount DECIMAL(10, 2), -- Legacy column for compatibility
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (office_room_id) REFERENCES office_rooms(id) ON DELETE SET NULL,
  FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_office_room_id (office_room_id),
  INDEX idx_venue_id (venue_id),
  INDEX idx_status (status),
  INDEX idx_date (date),
  INDEX idx_check_in_date (check_in_date)
);

-- Create Contact Messages table
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
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Create Payment Proofs table
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
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_booking_id (booking_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);

-- Create Staff table
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
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);

-- Create CMS Content table
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
);

-- Create Chat Messages table
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
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  INDEX idx_sender_id (sender_id),
  INDEX idx_receiver_id (receiver_id),
  INDEX idx_booking_id (booking_id),
  INDEX idx_created_at (created_at),
  INDEX idx_is_read (is_read)
);

-- Create Reviews table
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
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (office_room_id) REFERENCES office_rooms(id) ON DELETE SET NULL,
  FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE SET NULL,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_office_room_id (office_room_id),
  INDEX idx_venue_id (venue_id),
  INDEX idx_rating (rating),
  INDEX idx_is_approved (is_approved),
  INDEX idx_is_featured (is_featured)
);

-- Create Unavailable Dates table
CREATE TABLE IF NOT EXISTS unavailable_dates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  venue_id INT NOT NULL,
  date DATE NOT NULL,
  reason VARCHAR(500),
  notes TEXT,
  created_by VARCHAR(255) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
  UNIQUE KEY unique_venue_date (venue_id, date),
  INDEX idx_venue_id (venue_id),
  INDEX idx_date (date)
);

-- Create Unavailable Offices table
CREATE TABLE IF NOT EXISTS unavailable_offices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  office_room_id INT NOT NULL,
  unavailable_rooms INT NOT NULL DEFAULT 1,
  reason VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (office_room_id) REFERENCES office_rooms(id) ON DELETE CASCADE,
  INDEX idx_office_room_id (office_room_id)
);

-- Insert initial admin user (password: admin123)
INSERT IGNORE INTO users (email, password_hash, full_name, phone, role) VALUES
('admin@oneestela.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', '+1-234-567-8900', 'admin');

-- Insert initial venue
INSERT IGNORE INTO venues (id, name, description, location, capacity, price_per_hour, image_url) VALUES
(1, 'One Estela Place', 'Premium event venue with elegant design and world-class facilities', '123 Estela Street, Downtown', 500, 150.00, '/images/venue-main.jpg');

-- Insert initial office rooms
INSERT IGNORE INTO office_rooms (venue_id, name, description, capacity, price_per_hour, image_url, amenities, total_rooms) VALUES
(1, 'Executive Suite', 'Premium board room with panoramic views', 20, 250.00, '/images/executive-suite.jpg', '["WiFi", "Projector", "Whiteboard", "Coffee Service"]', 5),
(1, 'Conference Hall', 'Large conference space suitable for presentations', 100, 150.00, '/images/conference-hall.jpg', '["WiFi", "Audio System", "Stage", "Catering Available"]', 3),
(1, 'Meeting Room A', 'Intimate meeting space for small teams', 8, 75.00, '/images/meeting-room-a.jpg', '["WiFi", "Whiteboard", "Video Conference Setup"]', 10),
(1, 'Meeting Room B', 'Flexible meeting space', 10, 85.00, '/images/meeting-room-b.jpg', '["WiFi", "Whiteboard", "Smart TV"]', 8);

-- Insert initial CMS content
INSERT IGNORE INTO cms_content (page_type, section_name, content_key, content_value, display_order, is_active) VALUES
('homepage', 'hero', 'title', 'Welcome to One Estela Place', 1, TRUE),
('homepage', 'hero', 'description', 'Premium venue for your perfect event', 2, TRUE),
('homepage', 'features', 'title', 'State-of-the-Art Facilities', 3, TRUE),
('homepage', 'features', 'description', 'Our venue features cutting-edge technology and elegant design', 4, TRUE);