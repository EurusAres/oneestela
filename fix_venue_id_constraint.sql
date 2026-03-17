-- Fix venue_id column to allow NULL values
-- Office rooms don't need to be associated with a venue

ALTER TABLE office_rooms 
MODIFY COLUMN venue_id INT NULL;

-- Verify the change
DESCRIBE office_rooms;
