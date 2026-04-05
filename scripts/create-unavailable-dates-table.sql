-- Create table for admin-managed unavailable dates
CREATE TABLE IF NOT EXISTS unavailable_dates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venue_id INT NOT NULL,
  date DATE NOT NULL,
  reason ENUM('Maintenance', 'Staffing Shortages') NOT NULL,
  notes TEXT,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
  UNIQUE KEY unique_venue_date (venue_id, date)
);