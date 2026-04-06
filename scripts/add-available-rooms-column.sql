-- Add available_rooms column to office_rooms table

ALTER TABLE office_rooms 
ADD COLUMN IF NOT EXISTS available_rooms INT DEFAULT 1 COMMENT 'Number of available rooms of this type';

-- Update existing records to have default value of 1
UPDATE office_rooms SET available_rooms = 1 WHERE available_rooms IS NULL;

-- Verify the change
SELECT 'Office rooms table structure after adding available_rooms column:' as info;
DESCRIBE office_rooms;