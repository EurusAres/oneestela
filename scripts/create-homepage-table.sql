-- Create homepage_content table for CMS
CREATE TABLE IF NOT EXISTS homepage_content (
  id INT PRIMARY KEY AUTO_INCREMENT,
  hero_title VARCHAR(255),
  hero_description TEXT,
  hero_image VARCHAR(500),
  about_title VARCHAR(255),
  about_description TEXT,
  about_image VARCHAR(500),
  cta_title VARCHAR(255),
  cta_description TEXT,
  cta_button_text VARCHAR(100),
  cta_image VARCHAR(500),
  features JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default homepage content
INSERT INTO homepage_content (
  hero_title,
  hero_description,
  hero_image,
  about_title,
  about_description,
  cta_title,
  cta_description,
  cta_button_text
) VALUES (
  'Welcome to One Estela Place',
  'The premier event and office space in the heart of the city',
  '',
  'About Us',
  'One Estela Place offers premium event venues and modern office spaces designed for your success.',
  'Ready to Book?',
  'Contact us today to reserve your space',
  'Get Started'
);
