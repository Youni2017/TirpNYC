/*/
Setup:
1. Initialize your project: npm init -y
2. Install dependencies: npm install express cors
3. Run the server: node tripnyc_backend.js
*/

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();
const PORT = 3001;

app.use(cors()); // Allows the React app to access the API
app.use(express.json()); // To parse incoming JSON requests

// Mock Data Structures (get from the database)
const TLC_ZONES = [
  { id: 1, name: "Newark Airport" },
  { id: 4, name: "Central Park" },
  { id: 10, name: "Midtown Center" },
  { id: 24, name: "JFK Airport" },
];

const pool = new Pool({
    user: 'YOUR_DB_USER',       
    host: 'YOUR_AWS_ENDPOINT', 
    database: 'YOUR_DB_NAME',   
    password: 'YOUR_DB_PASSWORD',
    port: 5432,
 
});


pool.on('connect', () => {
  console.log('Successfully connected to PostgreSQL database.');
});
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});


// --- API Endpoints ---

// Health Check
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'TripNYC Backend is running.' });
});


const queryTripData = async (startId, endId, timeInterval) => {

  const [startTimeStr, endTimeStr] = timeInterval.split('-');
  
  const queryParams = [startId, endId, startTimeStr, endTimeStr];

  const taxiQuery = `
      SELECT
          ROUND(AVG(total_amount), 2) AS avg_total_amount,
          MIN(total_amount) AS min_total_amount,
          MAX(total_amount) AS max_total_amount
      FROM trip_analytics.yellow_taxi_trip
      WHERE
          pickup_location_id = $1
          AND dropoff_location_id = $2
          -- Conceptual time filtering based on HH:MM string comparison
          AND TO_CHAR(pickup_datetime, 'HH24:MI') >= $3
          AND TO_CHAR(pickup_datetime, 'HH24:MI') < $4;
  `;

  try {
    const taxiResult = await pool.query(taxiQuery, queryParams);

    if (taxiResult.rows.length > 0 && taxiResult.rows[0].avg_total_amount !== null) {
        return taxiResult.rows[0];
    }
    
    return null;

  } catch (err) {
    console.error("Database query error in queryTripData:", err);
    throw new Error("Failed to retrieve data from the analytics database.");
  }
};

app.post('/api/estimate-trip', async (req, res) => {
  const { startZoneId, endZoneId, timeInterval } = req.body; 

  if (!startZoneId || !endZoneId || !timeInterval) {
    return res.status(400).json({ error: 'Missing startZoneId, endZoneId, or timeInterval.' });
  }

  console.log(`[API CALL] Trip Estimate: ${startZoneId} to ${endZoneId} during ${timeInterval}`);

  try {
    const result = await queryTripData(startZoneId, endZoneId, timeInterval);

    if (!result) {
        return res.status(404).json({ error: "No historical data found for this route and time interval." });
    }

    setTimeout(() => {
      res.json(result);
    }, 500); 

  } catch (error) {
    console.error("Failed to process trip estimate:", error.message);
    res.status(500).json({ error: error.message || "Internal server error during data fetching." });
  }
});

app.get('/api/traffic-dashboard', (req, res) => {
  // TODO
});


// --- Server Startup ---
app.listen(PORT, () => {
  console.log(`TripNYC Backend running on http://localhost:${PORT}`);
  console.log('To test: Open a browser to http://localhost:3001/api/status');
});