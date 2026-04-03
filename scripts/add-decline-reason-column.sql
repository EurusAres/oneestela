-- Add decline_reason column to bookings table
ALTER TABLE `bookings` 
ADD COLUMN `decline_reason` TEXT NULL AFTER `special_requests`;
