import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'one_estela_place',
});

// Insert venue first if not exists
await connection.execute(`
  INSERT IGNORE INTO venues (id, name, description, location, capacity, price_per_hour, image_url)
  VALUES (1, 'One Estela Place', 'Premium event venue with elegant design and world-class facilities', '123 Estela Street, Downtown', 500, 150.00, '/images/venue-main.jpg')
`);

// Insert office rooms
await connection.execute(`
  INSERT IGNORE INTO office_rooms (id, venue_id, name, description, capacity, price_per_hour, image_url, amenities)
  VALUES
    (1, 1, 'Executive Suite', 'Premium board room with panoramic views', 20, 250.00, '/images/executive-suite.jpg', '["WiFi", "Projector", "Whiteboard", "Coffee Service"]'),
    (2, 1, 'Conference Hall', 'Large conference space suitable for presentations', 100, 150.00, '/images/conference-hall.jpg', '["WiFi", "Audio System", "Stage", "Catering Available"]'),
    (3, 1, 'Meeting Room A', 'Intimate meeting space for small teams', 8, 75.00, '/images/meeting-room-a.jpg', '["WiFi", "Whiteboard", "Video Conference Setup"]'),
    (4, 1, 'Meeting Room B', 'Flexible meeting space', 10, 85.00, '/images/meeting-room-b.jpg', '["WiFi", "Whiteboard", "Smart TV"]')
`);

console.log('✓ Venue and office rooms seeded');
await connection.end();
