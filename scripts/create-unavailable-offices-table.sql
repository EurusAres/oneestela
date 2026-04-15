-- Create unavailable_offices table
CREATE TABLE IF NOT EXISTS unavailable_offices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  office_room_id INT NOT NULL,
  reason VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (office_room_id) REFERENCES office_rooms(id) ON DELETE CASCADE,
  INDEX idx_office_room_id (office_room_id),
  INDEX idx_date_range (start_date, end_date)
);