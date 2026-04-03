-- Add 'declined' to the status ENUM in bookings table
ALTER TABLE `bookings` 
MODIFY COLUMN `status` ENUM('pending','confirmed','cancelled','completed','declined') 
DEFAULT 'pending';
