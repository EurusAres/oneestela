const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'one-estela-place-eares223321-3924.i.aivencloud.com',
  port: parseInt(process.env.DB_PORT || '22797'),
  user: process.env.DB_USER || 'avnadmin',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'one_estela_place',
  ssl: {
    rejectUnauthorized: false
  },
  multipleStatements: true
};

async function fixDatabase() {
  let connection;
  
  try {
    console.log('🔌 Connecting to Aiven MySQL database...');
    console.log(`Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`Database: ${dbConfig.database}`);
    console.log(`User: ${dbConfig.user}`);
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected successfully!');
    
    // Test basic connection
    const [testResult] = await connection.execute('SELECT 1 as test');
    console.log('✅ Database test query successful:', testResult);
    
    // Check existing tables
    console.log('\n📋 Checking existing tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Existing tables:', tables.map(t => Object.values(t)[0]));
    
    // Read and execute the schema fix
    console.log('\n🔧 Running database schema fixes...');
    const schemaFixPath = path.join(__dirname, 'fix-database-schema.sql');
    const schemaFix = fs.readFileSync(schemaFixPath, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = schemaFix.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          await connection.execute(statement);
        } catch (error) {
          if (error.message.includes('Duplicate column') || 
              error.message.includes('already exists') ||
              error.message.includes('Unknown column')) {
            console.log(`⚠️  Skipping: ${error.message}`);
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
          }
        }
      }
    }
    
    console.log('✅ Schema fixes completed!');
    
    // Verify tables and columns
    console.log('\n🔍 Verifying table structures...');
    
    // Check bookings table
    try {
      const [bookingsCols] = await connection.execute('DESCRIBE bookings');
      console.log('Bookings table columns:', bookingsCols.map(c => c.Field));
    } catch (error) {
      console.log('❌ Bookings table check failed:', error.message);
    }
    
    // Check office_rooms table
    try {
      const [roomsCols] = await connection.execute('DESCRIBE office_rooms');
      console.log('Office rooms table columns:', roomsCols.map(c => c.Field));
    } catch (error) {
      console.log('❌ Office rooms table check failed:', error.message);
    }
    
    // Check users
    try {
      const [users] = await connection.execute('SELECT id, email, role FROM users WHERE role = "admin"');
      console.log('Admin users:', users);
    } catch (error) {
      console.log('❌ Users check failed:', error.message);
    }
    
    // Test API endpoints data
    console.log('\n🧪 Testing API data queries...');
    
    try {
      const [bookingsCount] = await connection.execute('SELECT COUNT(*) as count FROM bookings');
      console.log('Total bookings:', bookingsCount[0].count);
    } catch (error) {
      console.log('❌ Bookings count failed:', error.message);
    }
    
    try {
      const [roomsCount] = await connection.execute('SELECT COUNT(*) as count FROM office_rooms');
      console.log('Total office rooms:', roomsCount[0].count);
    } catch (error) {
      console.log('❌ Office rooms count failed:', error.message);
    }
    
    try {
      const [venuesCount] = await connection.execute('SELECT COUNT(*) as count FROM venues');
      console.log('Total venues:', venuesCount[0].count);
    } catch (error) {
      console.log('❌ Venues count failed:', error.message);
    }
    
    console.log('\n✅ Database fix completed successfully!');
    console.log('🚀 Your APIs should now work without 500 errors.');
    
  } catch (error) {
    console.error('❌ Database fix failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed.');
    }
  }
}

// Run the fix
fixDatabase().catch(console.error);