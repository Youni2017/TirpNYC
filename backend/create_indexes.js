const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  user: 'group29',
  host: 'tripnyc.cdbd5hpbpgyh.us-east-1.rds.amazonaws.com',
  database: 'postgres',
  password: 'younigroup29',
  port: 5432,
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
});

async function createIndexes() {
  try {
    console.log('Connecting to database...');
    
    // Read the SQL file
    const sql = fs.readFileSync('../create_time_indexes.sql', 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => {
        // Remove comments from each line
        return s.split('\n')
          .map(line => {
            const commentIndex = line.indexOf('--');
            return commentIndex >= 0 ? line.substring(0, commentIndex).trim() : line.trim();
          })
          .filter(line => line.length > 0)
          .join(' ');
      })
      .filter(s => s && s.length > 0);
    
    console.log(`Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        console.log(`\nExecuting statement ${i + 1}...`);
        await pool.query(statement);
        console.log('✓ Success');
      }
    }
    
    // Run ANALYZE
    console.log('\nRunning ANALYZE...');
    await pool.query('ANALYZE yellow_taxi_trip;');
    await pool.query('ANALYZE green_taxi_trip;');
    await pool.query('ANALYZE fhv_trip;');
    console.log('✓ ANALYZE complete');
    
    console.log('\n✅ All indexes created successfully!');
    await pool.end();
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
    await pool.end();
    process.exit(1);
  }
}

createIndexes();

