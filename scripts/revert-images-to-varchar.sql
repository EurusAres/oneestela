-- Revert image columns back to VARCHAR for storing file paths

-- For venues table
ALTER TABLE venues 
  MODIFY COLUMN image_url VARCHAR(500),
  MODIFY COLUMN image_360_url VARCHAR(500);

-- For office_rooms table
ALTER TABLE office_rooms 
  MODIFY COLUMN image_url VARCHAR(500),
  MODIFY COLUMN image_360_url VARCHAR(500);

-- Verify changes
DESCRIBE venues;
DESCRIBE office_rooms;
