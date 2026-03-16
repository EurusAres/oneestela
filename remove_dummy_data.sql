-- Script to remove all dummy client data from One Estela Place database
-- This will keep the admin user but remove all test bookings and dummy clients

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Delete all bookings (all are dummy data)
DELETE FROM bookings;

-- Delete all chat messages
DELETE FROM chat_messages;

-- Delete all contact messages
DELETE FROM contact_messages;

-- Delete all payment proofs
DELETE FROM payment_proofs;

-- Delete all reviews
DELETE FROM reviews;

-- Delete dummy users (keep only admin user with id = 1)
DELETE FROM users WHERE id != 1;

-- Delete user info for deleted users
DELETE FROM user_info WHERE user_id != 1;

-- Reset auto increment for bookings
ALTER TABLE bookings AUTO_INCREMENT = 1;

-- Reset auto increment for chat_messages
ALTER TABLE chat_messages AUTO_INCREMENT = 1;

-- Reset auto increment for contact_messages
ALTER TABLE contact_messages AUTO_INCREMENT = 1;

-- Reset auto increment for users (start from 2 since admin is 1)
ALTER TABLE users AUTO_INCREMENT = 2;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify the cleanup
SELECT 'Remaining users:' as info;
SELECT id, email, full_name, role FROM users;

SELECT 'Remaining bookings:' as info;
SELECT COUNT(*) as count FROM bookings;

SELECT 'Remaining chat messages:' as info;
SELECT COUNT(*) as count FROM chat_messages;

SELECT 'Remaining contact messages:' as info;
SELECT COUNT(*) as count FROM contact_messages;
