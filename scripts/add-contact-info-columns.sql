-- Add contact information columns to homepage_content table
ALTER TABLE homepage_content
ADD COLUMN IF NOT EXISTS contact_location TEXT DEFAULT '123 Event Street\nDowntown District\nCity, State 12345',
ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50) DEFAULT '(555) 123-4567',
ADD COLUMN IF NOT EXISTS contact_email VARCHAR(100) DEFAULT 'info@oneestela.com',
ADD COLUMN IF NOT EXISTS contact_hours TEXT DEFAULT 'Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: By appointment only';
