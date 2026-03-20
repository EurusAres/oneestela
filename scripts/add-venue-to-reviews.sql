-- Add venue_id column to reviews table to allow reviews for venues
-- This allows reviews to be linked to either office_rooms OR venues

-- Add venue_id column (nullable, since reviews can be for office_rooms OR venues)
ALTER TABLE reviews 
ADD COLUMN venue_id INT NULL AFTER office_room_id,
ADD CONSTRAINT fk_reviews_venue 
  FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE;

-- Make office_room_id nullable since reviews can be for venues instead
ALTER TABLE reviews 
MODIFY COLUMN office_room_id INT NULL;

-- Add index for better query performance
CREATE INDEX idx_reviews_venue_id ON reviews(venue_id);

-- Add check constraint to ensure either office_room_id OR venue_id is set (not both, not neither)
-- Note: MySQL doesn't support CHECK constraints well in older versions, so we'll handle this in application logic
