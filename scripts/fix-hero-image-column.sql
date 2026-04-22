-- Fix hero_image column to support base64 images
-- VARCHAR(500) is too small for base64-encoded images
-- Change to LONGTEXT to support large images

USE one_estela_place;

-- Modify the hero_image column to LONGTEXT
ALTER TABLE homepage_content 
MODIFY COLUMN hero_image LONGTEXT;

-- Verify the change
DESCRIBE homepage_content;
