/*/
Setup:
1. Initialize your project: npm init -y
2. Install dependencies: npm install express cors pg
3. Run the server: node tripnyc_backend.js
*/

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const fs = require('fs');
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
  ssl : {
    require: true,
    rejectUnauthorized: false
  }
});


pool.on('connect', () => {
  console.log('Successfully connected to PostgreSQL database.');
});
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});


const queryWavFulfillmentRate = async () => {
  try {
    const result = await pool.query(QUERIES.GET_WAV_FULFILLMENT_RATE);
    return result.rows;
  } catch (err) {
    console.error("Database query error in queryWavFulfillmentRate:", err);
    throw new Error("Failed to retrieve WAV fulfillment data.");
  }
};

const queryWavRequestPercentage = async () => {
  try {
    const result = await pool.query(QUERIES.GET_WAV_REQUEST_PERCENTAGE);
    return result.rows;
  } catch (err) {
    console.error("Database query error in queryWavRequestPercentage:", err);
    throw new Error("Failed to retrieve WAV request percentage data.");
  }
};

const queryWavWaitTime = async () => {
  try {
    const result = await pool.query(QUERIES.GET_WAV_WAIT_TIME);
    return result.rows;
  } catch (err) {
    console.error("Database query error in queryWavWaitTime:", err);
    throw new Error("Failed to retrieve WAV wait time data.");
  }
};

const queryRecommendedDestinations = async (departureZoneId, startTime, endTime) => {
    const queryParams = [departureZoneId, startTime, endTime];
    try {
        const result = await pool.query(QUERIES.GET_RECOMMEND_DEST, queryParams);
        return result.rows; // Returns array of { departure_zone, arrival_zone, trip_count }
    } catch (err) {
        console.error("Database query error in queryRecommendedDestinations:", err);
        throw new Error("Failed to retrieve recommended destinations from the database.");
    }
};


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

app.get('/api/recommend-destinations', async (req, res) => {
    const { departureZoneId, startTime, endTime } = req.query; 

    if (!departureZoneId || !startTime || !endTime) {
        return res.status(400).json({ error: 'Missing departureZoneId, startTime, or endTime parameters.' });
    }

    const depZoneId = parseInt(departureZoneId, 10);
    if (isNaN(depZoneId)) {
        return res.status(400).json({ error: 'Invalid departureZoneId.' });
    }

    console.log(`[API CALL] Recommended Destinations from ${depZoneId} during ${startTime} to ${endTime}`);

    try {
        const destinations = await queryRecommendedDestinations(depZoneId, startTime, endTime);

        if (destinations.length === 0) {
            return res.status(404).json({ message: "No frequent destinations found for this criteria." });
        }

        setTimeout(() => {
            res.json(destinations);
        }, 500);

    } catch (error) {
        console.error("Failed to process destination recommendation:", error.message);
        res.status(500).json({ error: error.message || "Internal server error during data fetching." });
    }
});

const queryRouteHotspots = async () => {
  const sql = `
  WITH zone_cte AS (
  SELECT id, zone_name FROM zone
  ),
  combined_trips AS (
  SELECT
    pickup_location,
    dropoff_location,
    total_amount
  FROM yellow_taxi_trip
  WHERE
    EXTRACT(HOUR FROM pickup_datetime) >= 17
    AND EXTRACT(HOUR FROM pickup_datetime) < 19


  UNION ALL


  SELECT
    pickup_location,
    dropoff_location,
    total_amount
  FROM green_taxi_trip
  WHERE
    EXTRACT(HOUR FROM pickup_datetime) >= 17
    AND EXTRACT(HOUR FROM pickup_datetime) < 19


  UNION ALL


  SELECT
    pickup_location,
    dropoff_location,
    total_amount
  FROM fhv_trip
  WHERE
    EXTRACT(HOUR FROM pickup_datetime) >= 17
    AND EXTRACT(HOUR FROM pickup_datetime) < 19
  ),
  aggregated_routes AS (
    SELECT
        pickup_location,
        dropoff_location,
        COUNT(*) AS total_trip_count,
        ROUND(AVG(total_amount), 2) AS average_fare
    FROM combined_trips
    GROUP BY
        pickup_location,
        dropoff_location
    HAVING pickup_location < dropoff_location
    ORDER BY
        total_trip_count DESC
    LIMIT 10
  )
  SELECT
  pu.zone_name AS departure_zone,
  doo.zone_name AS arrival_zone,
  ar.total_trip_count,
  ar.average_fare
  FROM aggregated_routes ar
  INNER JOIN zone_cte pu ON ar.pickup_location = pu.id
  INNER JOIN zone_cte doo ON ar.dropoff_location = doo.id
  ORDER BY
  ar.total_trip_count DESC;
  `;

  try {
    const result = await pool.query(sql);
    return result.rows; 
  } catch (err) {
    console.error("Database query error in queryRouteHotspots:", err);
    throw new Error("Failed to retrieve route hotspot data from the analytics database.");
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

app.post('/api/route-hotspots', async (req, res) => {
  const { startTime, endTime } = req.body;

  if (!startTime || !endTime) {
    return res.status(400).json({ error: 'Missing startTime or endTime.' });
  }

  console.log(`[API CALL] /api/route-hotspots from ${startTime} to ${endTime}`);

  try {
    const hotspots = await queryRouteHotspots(startTime, endTime);
    if (!hotspots || hotspots.length === 0) {
      return res.status(404).json({ error: 'No data for this time range.' });
    }
    res.json(hotspots);
  } catch (error) {
    console.error('Failed to fetch route hotspots:', error.message);
    res.status(500).json({ error: error.message || 'Internal server error while fetching route hotspots.' });
  }
});

/*************************************************/


// --- Server Startup ---
app.listen(PORT, () => {
  console.log(`TripNYC Backend running on http://localhost:${PORT}`);
  console.log('To test: Open a browser to http://localhost:3001/api/status');
});
