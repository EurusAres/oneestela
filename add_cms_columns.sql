-- Add missing columns to office_rooms and venues tables for CMS functionality

-- Add image_360_url column to venues table if it doesn't exist
ALTER TABLE venues 
ADD COLUMN IF NOT EXISTS image_360_url VARCHAR(500) DEFAULT '';

-- Add image_360_url and type columns to office_rooms table if they don't exist
ALTER TABLE office_rooms 
ADD COLUMN IF NOT EXISTS image_360_url VARCHAR(500) DEFAULT '',
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'office';

-- Update existing records to have default type
UPDATE office_rooms SET type = 'office' WHERE type IS NULL OR type = '';

-- Verify the changes
SELECT 'Venues table structure:' as info;
DESCRIBE venues;

SELECT 'Office rooms table structure:' as info;
DESCRIBE office_rooms;
