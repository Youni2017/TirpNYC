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


// Query for Green/Yellow Taxi (combined)
const queryTaxiData = async (startId, endId, startTime, endTime) => {
  let queryParams = [startId, endId];
  let paramIndex = 3;
  let timeConditions = [];

  // Build time conditions based on provided times
  // Compare only HH:MM portion, treating start as hh:mm:00 and end as hh:mm:59
  if (startTime) {
    // Start time: >= hh:mm:00 (any date)
    timeConditions.push(`TO_CHAR(pickup_datetime, 'HH24:MI:SS') >= $${paramIndex}`);
    queryParams.push(startTime + ':00');
    paramIndex++;
  }

  if (endTime) {
    // End time: <= hh:mm:59 (any date)
    timeConditions.push(`TO_CHAR(pickup_datetime, 'HH24:MI:SS') <= $${paramIndex}`);
    queryParams.push(endTime + ':59');
    paramIndex++;
  }

  const timeWhereClause = timeConditions.length > 0 
    ? `AND ${timeConditions.join(' AND ')}`
    : '';

  const taxiQuery = `
    SELECT
      ROUND(AVG(total_amount), 2) AS avg_total_amount,
      MIN(total_amount) AS min_total_amount,
      MAX(total_amount) AS max_total_amount
    FROM (
      SELECT total_amount 
      FROM yellow_taxi_trip
      WHERE pickup_location = $1
        AND dropoff_location = $2
        ${timeWhereClause}
      
      UNION ALL
      
      SELECT total_amount
      FROM green_taxi_trip
      WHERE pickup_location = $1
        AND dropoff_location = $2
        ${timeWhereClause}
    ) AS combined_taxis;
  `;

  try {
    const taxiResult = await pool.query(taxiQuery, queryParams);

    if (taxiResult.rows.length > 0 && taxiResult.rows[0].avg_total_amount !== null) {
        return taxiResult.rows[0];
    }
    
    return null;

  } catch (err) {
    console.error("Database query error in queryTaxiData:", err);
    throw new Error("Failed to retrieve taxi data from the database.");
  }
};

// Query for FHV (with waiting time)
const queryFHVData = async (startId, endId, startTime, endTime, serviceProvider) => {
  let queryParams = [startId, endId];
  let paramIndex = 3;
  let timeConditions = [];

  // Build time conditions based on provided times
  // Compare only HH:MM portion, treating start as hh:mm:00 and end as hh:mm:59
  if (startTime) {
    // Start time: >= hh:mm:00 (any date)
    timeConditions.push(`TO_CHAR(pickup_datetime, 'HH24:MI:SS') >= $${paramIndex}`);
    queryParams.push(startTime + ':00');
    paramIndex++;
  }

  if (endTime) {
    // End time: <= hh:mm:59 (any date)
    timeConditions.push(`TO_CHAR(pickup_datetime, 'HH24:MI:SS') <= $${paramIndex}`);
    queryParams.push(endTime + ':59');
    paramIndex++;
  }

  // Add service provider condition if provided
  if (serviceProvider) {
    timeConditions.push(`service_provider = $${paramIndex}`);
    queryParams.push(serviceProvider);
    paramIndex++;
  }

  const timeWhereClause = timeConditions.length > 0 
    ? `AND ${timeConditions.join(' AND ')}`
    : '';

  const fhvQuery = `
    SELECT
      ROUND(AVG(total_amount), 2) AS avg_total_amount,
      MIN(total_amount) AS min_total_amount,
      MAX(total_amount) AS max_total_amount,
      ROUND(AVG(EXTRACT(EPOCH FROM (pickup_datetime - request_datetime)) / 60), 2) AS avg_waiting_time
    FROM fhv_trip
    WHERE
      pickup_location = $1
      AND dropoff_location = $2
      ${timeWhereClause};
  `;

  try {
    const fhvResult = await pool.query(fhvQuery, queryParams);

    if (fhvResult.rows.length > 0 && fhvResult.rows[0].avg_total_amount !== null) {
        return fhvResult.rows[0];
    }
    
    return null;

  } catch (err) {
    console.error("Database query error in queryFHVData:", err);
    throw new Error("Failed to retrieve FHV data from the database.");
  }
};

app.post('/api/estimate-trip', async (req, res) => {
  const { startLocation, endLocation, startTime, endTime, serviceProvider, tripType } = req.body; 

  if (!startLocation || !endLocation) {
    return res.status(400).json({ error: 'Missing startLocation or endLocation.' });
  }

  if (!startTime && !endTime) {
    return res.status(400).json({ error: 'At least one time (startTime or endTime) must be provided.' });
  }

  if (tripType === 'fhv' && !serviceProvider) {
    return res.status(400).json({ error: 'Service provider is required for FHV trips.' });
  }

  console.log(`[API CALL] Trip Estimate: ${startLocation} to ${endLocation}, Type: ${tripType}, Start: ${startTime || 'N/A'}, End: ${endTime || 'N/A'}`);

  try {
    let result;
    
    if (tripType === 'taxi') {
      result = await queryTaxiData(startLocation, endLocation, startTime, endTime);
    } else if (tripType === 'fhv') {
      result = await queryFHVData(startLocation, endLocation, startTime, endTime, serviceProvider);
    } else {
      return res.status(400).json({ error: 'Invalid tripType. Must be "taxi" or "fhv".' });
    }

    if (!result) {
        return res.status(404).json({ error: "No historical data found for this route and time interval." });
    }

    res.json(result);

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