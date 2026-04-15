-- Update unavailable_offices table to make date columns optional
ALTER TABLE unavailable_offices 
MODIFY COLUMN start_date DATE NULL,
MODIFY COLUMN end_date DATE NULL;