/*/
Setup:
1. Initialize your project: npm init -y
2. Install dependencies: npm install express cors pg
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
    user: 'group29',       
    host: 'tripnyc.cdbd5hpbpgyh.us-east-1.rds.amazonaws.com', 
    database: 'postgres',   
    password: 'younigroup29',
    port: 5432,
    ssl: {
      require: true,                 
      rejectUnauthorized: false,     
    },
    
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

// app.get('/api/traffic-dashboard', (req, res) => {
//   // TODO
// });
/*************************************************/
//Youni's part
// ---- Traffic Dashboard Query ----
const queryTrafficFlow = async (locationId) => {
  const trafficQuery = `
    WITH all_trips AS (
        SELECT pickup_datetime AS trip_time
        FROM yellow_taxi_trip
        WHERE pickup_location = $1
          AND pickup_datetime >= '2025-08-01 00:00:00'
          AND pickup_datetime <  '2025-08-31 00:00:00'

        UNION ALL

        SELECT pickup_datetime AS trip_time
        FROM green_taxi_trip
        WHERE pickup_location = $1
          AND pickup_datetime >= '2025-08-01 00:00:00'
          AND pickup_datetime <  '2025-08-31 00:00:00'

        UNION ALL

        SELECT pickup_datetime AS trip_time
        FROM fhv_trip
        WHERE pickup_location = $1
          AND pickup_datetime >= '2025-08-01 00:00:00'
          AND pickup_datetime <  '2025-08-31 00:00:00'

        UNION ALL

        SELECT dropoff_datetime AS trip_time
        FROM yellow_taxi_trip
        WHERE dropoff_location = $1
          AND dropoff_datetime >= '2025-08-01 00:00:00'
          AND dropoff_datetime <  '2025-08-31 00:00:00'

        UNION ALL

        SELECT dropoff_datetime AS trip_time
        FROM green_taxi_trip
        WHERE dropoff_location = $1
          AND dropoff_datetime >= '2025-08-01 00:00:00'
          AND dropoff_datetime <  '2025-08-31 00:00:00'

        UNION ALL

        SELECT dropoff_datetime AS trip_time
        FROM fhv_trip
        WHERE dropoff_location = $1
          AND dropoff_datetime >= '2025-08-01 00:00:00'
          AND dropoff_datetime <  '2025-08-31 00:00:00'
    ),

    days AS (
        SELECT generate_series(
            '2025-08-01'::date,
            '2025-08-31'::date - INTERVAL '1 day',
            INTERVAL '1 day'
        )::date AS d
    ),

    hours AS (
        SELECT generate_series(0, 23) AS hour_of_day
    ),

    calendar AS (
        SELECT
            d.d AS trip_date,
            h.hour_of_day,
            CASE
                WHEN EXTRACT(ISODOW FROM d.d) IN (6, 7) THEN 'weekend'
                ELSE 'workday'
            END AS day_type
        FROM days d
        CROSS JOIN hours h
    ),


    per_day_hour AS (
        SELECT
            date_trunc('day', trip_time)::date AS trip_date,
            EXTRACT(HOUR FROM trip_time)::int AS hour_of_day,
            COUNT(*) AS trip_count
        FROM all_trips
        GROUP BY
            date_trunc('day', trip_time)::date,
            EXTRACT(HOUR FROM trip_time)::int
    ),

    calendar_with_counts AS (
        SELECT
            c.trip_date,
            c.hour_of_day,
            c.day_type,
            COALESCE(p.trip_count, 0) AS trip_count
        FROM calendar c
        LEFT JOIN per_day_hour p
          ON c.trip_date = p.trip_date
         AND c.hour_of_day = p.hour_of_day
    )

    SELECT
        hour_of_day,
        ROUND(AVG(CASE WHEN day_type = 'workday' THEN trip_count END), 2) AS avg_workday_trips,
        ROUND(AVG(CASE WHEN day_type = 'weekend' THEN trip_count END), 2) AS avg_weekend_trips
    FROM
        calendar_with_counts
    GROUP BY
        hour_of_day
    ORDER BY
        hour_of_day;
  `;

  const result = await pool.query(trafficQuery, [locationId]);
  return result.rows;  
};

app.get('/api/traffic-dashboard', async (req, res) => {
  const { locationId } = req.query;

  const loc = parseInt(locationId, 10);
  if (!loc || Number.isNaN(loc)) {
    return res.status(400).json({ error: 'Missing or invalid locationId.' });
  }

  console.log(`[API CALL] Traffic Dashboard for location ${loc}`);

  try {
    const rows = await queryTrafficFlow(loc);
    res.json(rows);
  } catch (err) {
    console.error('Failed to fetch traffic dashboard data:', err.message);
    res.status(500).json({ error: 'Internal server error while fetching traffic dashboard data.' });
  }
});

/*************************************************/


// --- Server Startup ---
app.listen(PORT, () => {
  console.log(`TripNYC Backend running on http://localhost:${PORT}`);
  console.log('To test: Open a browser to http://localhost:3001/api/status');
});
