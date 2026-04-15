-- Add unavailable_rooms column to unavailable_offices table
ALTER TABLE unavailable_offices 
ADD COLUMN unavailable_rooms INT NOT NULL DEFAULT 1 AFTER reason;