-- Add event_name and event_type columns to bookings table
ALTER TABLE bookings 
ADD COLUMN event_name VARCHAR(255) AFTER user_id,
ADD COLUMN event_type VARCHAR(100) AFTER event_name;
