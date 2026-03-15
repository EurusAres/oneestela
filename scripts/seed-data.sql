-- Seed data for One Estela Place venue booking system
-- This file contains initial demo data for testing

-- Clear existing data to avoid duplicate key errors
SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE reviews;
TRUNCATE TABLE chat_messages;
TRUNCATE TABLE payment_proofs;
TRUNCATE TABLE contact_messages;
TRUNCATE TABLE bookings;
TRUNCATE TABLE cms_content;
TRUNCATE TABLE staff;
TRUNCATE TABLE office_rooms;
TRUNCATE TABLE venues;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS=1;

-- Insert users first
INSERT INTO users (email, password_hash, full_name, phone, role) VALUES
('admin@oneestela.com', '$2b$10$YourHashedPasswordHere', 'Admin User', '+1-234-567-8900', 'admin'),
('user@example.com', '$2b$10$YourHashedPasswordHere', 'John Doe', '+1-234-567-8901', 'user'),
('client2@example.com', '$2b$10$YourHashedPasswordHere', 'Jane Smith', '+1-234-567-8902', 'user');

-- Insert venue
INSERT INTO venues (id, name, description, location, capacity, price_per_hour, image_url) VALUES
(1, 'One Estela Place', 'Premium event venue with elegant design and world-class facilities', '123 Estela Street, Downtown', 500, 150.00, '/images/venue-main.jpg');

-- Insert office rooms (referencing venue_id = 1)
INSERT INTO office_rooms (venue_id, name, description, capacity, price_per_hour, image_url, amenities) VALUES
(1, 'Executive Suite', 'Premium board room with panoramic views', 20, 250.00, '/images/executive-suite.jpg', '["WiFi", "Projector", "Whiteboard", "Coffee Service"]'),
(1, 'Conference Hall', 'Large conference space suitable for presentations', 100, 150.00, '/images/conference-hall.jpg', '["WiFi", "Audio System", "Stage", "Catering Available"]'),
(1, 'Meeting Room A', 'Intimate meeting space for small teams', 8, 75.00, '/images/meeting-room-a.jpg', '["WiFi", "Whiteboard", "Video Conference Setup"]'),
(1, 'Meeting Room B', 'Flexible meeting space', 10, 85.00, '/images/meeting-room-b.jpg', '["WiFi", "Whiteboard", "Smart TV"]');

INSERT INTO bookings (user_id, office_room_id, check_in_date, check_out_date, number_of_guests, special_requests, status, total_price) VALUES
(2, 1, DATE_ADD(CURDATE(), INTERVAL 7 DAY), DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 7 DAY), INTERVAL 2 HOUR), 15, 'Please arrange catering', 'confirmed', 500.00),
(3, 2, DATE_ADD(CURDATE(), INTERVAL 14 DAY), DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 14 DAY), INTERVAL 3 HOUR), 50, 'Setup projector for presentation', 'pending', 450.00);

INSERT INTO contact_messages (name, email, subject, message, status) VALUES
('John Smith', 'john@example.com', 'Venue Inquiry', 'I am interested in booking your venue for a corporate event', 'unread'),
('Sarah Johnson', 'sarah@example.com', 'Pricing Question', 'Can you provide pricing for a 500-person event?', 'unread');

INSERT INTO staff (user_id, position, department, hire_date, salary, status) VALUES
(2, 'Event Manager', 'Operations', DATE_SUB(CURDATE(), INTERVAL 2 YEAR), 65000.00, 'active'),
(3, 'Technical Manager', 'Technical', DATE_SUB(CURDATE(), INTERVAL 1 YEAR), 60000.00, 'active');

INSERT INTO cms_content (page_type, section_name, content_key, content_value, display_order, is_active) VALUES
('homepage', 'hero', 'title', 'Welcome to One Estela Place', 1, TRUE),
('homepage', 'hero', 'description', 'Premium venue for your perfect event', 2, TRUE),
('homepage', 'features', 'title', 'State-of-the-Art Facilities', 3, TRUE),
('homepage', 'features', 'description', 'Our venue features cutting-edge technology and elegant design', 4, TRUE);

INSERT INTO reviews (user_id, office_room_id, booking_id, rating, title, review_text, is_approved) VALUES
(2, 1, 1, 5, 'Exceptional Experience', 'The executive suite was perfect for our board meeting. Highly professional staff and excellent facilities.', TRUE),
(3, 2, 2, 5, 'Outstanding Service', 'Great venue for our conference. The audio/visual setup was flawless and the team was very helpful.', TRUE);
