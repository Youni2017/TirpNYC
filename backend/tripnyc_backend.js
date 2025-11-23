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
const QUERIES = require('./queries');
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

const queryAverageTravelTime = async (startId, endId, startTimeStr, endTimeStr) => {
    const queryParams = [startId, endId, startTimeStr, endTimeStr];

    try {
        const result = await pool.query(QUERIES.GET_AVG_TRAVEL_TIME, queryParams);
        
        if (result.rows.length > 0 && result.rows[0].overall_avg_travel_time_seconds !== null) {
            return result.rows[0];
        }
        return null;
        
    } catch (err) {
        console.error("Database query error in queryAverageTravelTime:", err);
        throw new Error("Failed to retrieve average travel time data.");
    }
};

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

// Query for all providers comparison
const queryAllProvidersComparison = async (startId, endId, startTime, endTime) => {
  let queryParams = [startId, endId];
  let paramIndex = 3;
  let timeConditions = [];

  // Build time conditions
  if (startTime) {
    timeConditions.push(`TO_CHAR(pickup_datetime, 'HH24:MI:SS') >= $${paramIndex}`);
    queryParams.push(startTime + ':00');
    paramIndex++;
  }

  if (endTime) {
    timeConditions.push(`TO_CHAR(pickup_datetime, 'HH24:MI:SS') <= $${paramIndex}`);
    queryParams.push(endTime + ':59');
    paramIndex++;
  }

  const timeWhereClause = timeConditions.length > 0 
    ? `AND ${timeConditions.join(' AND ')}`
    : '';

  // Build the query with proper parameter placeholders
  const query = `
    WITH yellow_prices AS (
      SELECT
        'Yellow Taxi' AS service_type,
        total_amount
      FROM yellow_taxi_trip
      WHERE 
        pickup_location = $1         
        AND dropoff_location = $2
        ${timeWhereClause}
    ),
    green_prices AS (
      SELECT
        'Green Taxi' AS service_type,
        total_amount
      FROM green_taxi_trip
      WHERE 
        pickup_location = $1         
        AND dropoff_location = $2
        ${timeWhereClause}
    ),
    uber_prices AS (
      SELECT
        'Uber' AS service_type,
        total_amount
      FROM fhv_trip
      WHERE 
        service_provider = 'Uber'
        AND pickup_location = $1         
        AND dropoff_location = $2
        ${timeWhereClause}
    ),
    lyft_prices AS (
      SELECT
        'Lyft' AS service_type,
        total_amount
      FROM fhv_trip
      WHERE 
        service_provider = 'Lyft'
        AND pickup_location = $1         
        AND dropoff_location = $2
        ${timeWhereClause}
    ),
    other_fhv_prices AS (
      SELECT
        'Other FHV' AS service_type,
        total_amount
      FROM fhv_trip
      WHERE 
        service_provider NOT IN ('Uber', 'Lyft')
        AND pickup_location = $1         
        AND dropoff_location = $2
        ${timeWhereClause}
    ),
    all_prices AS (
      SELECT * FROM yellow_prices
      UNION ALL
      SELECT * FROM green_prices
      UNION ALL
      SELECT * FROM uber_prices
      UNION ALL
      SELECT * FROM lyft_prices
      UNION ALL
      SELECT * FROM other_fhv_prices
    )
    SELECT
      ROUND(MIN(ap.total_amount), 2) AS overall_min_price,
      ROUND(MAX(ap.total_amount), 2) AS overall_max_price,
      ROUND(AVG(ap.total_amount), 2) AS overall_avg_price,
      (
        SELECT service_type
        FROM all_prices
        GROUP BY service_type
        ORDER BY AVG(total_amount) ASC
        LIMIT 1
      ) AS recommended_vehicle_type
    FROM all_prices ap;
  `;

  try {
    const result = await pool.query(query, queryParams);
    return result.rows[0];
  } catch (err) {
    console.error("Database query error in queryAllProvidersComparison:", err);
    throw new Error("Failed to retrieve comparison data.");
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
  console.log('[ESTIMATE-TRIP] Received request body:', JSON.stringify(req.body));
  const { startLocation, endLocation, startTime, endTime, serviceProvider, tripType } = req.body; 

  if (!startLocation || !endLocation) {
    console.log('[ESTIMATE-TRIP] Validation failed: Missing startLocation or endLocation');
    return res.status(400).json({ error: 'Missing startLocation or endLocation.' });
  }

  if (tripType === 'fhv' && !serviceProvider) {
    console.log('[ESTIMATE-TRIP] Validation failed: Missing service provider for FHV');
    return res.status(400).json({ error: 'Service provider is required for FHV trips.' });
  }

  console.log(`[API CALL] Trip Estimate: ${startLocation} to ${endLocation}, Type: ${tripType}, Start: ${startTime || 'N/A'}, End: ${endTime || 'N/A'}`);

  try {
    let result;
    
    if (tripType === 'taxi') {
      result = await queryTaxiData(startLocation, endLocation, startTime || null, endTime || null);
    } else if (tripType === 'fhv') {
      result = await queryFHVData(startLocation, endLocation, startTime || null, endTime || null, serviceProvider);
    } else {
      return res.status(400).json({ error: 'Invalid tripType. Must be "taxi" or "fhv".' });
    }

    // Also get comparison across all providers
    let comparisonResult = null;
    try {
      comparisonResult = await queryAllProvidersComparison(startLocation, endLocation, startTime || null, endTime || null);
    } catch (compErr) {
      console.warn('Failed to fetch all providers comparison:', compErr);
      // Don't fail the main request if comparison fails
    }

    if (!result && !comparisonResult) {
        return res.status(404).json({ error: "No historical data found for this route and time interval." });
    }

    // Combine results
    const response = {
      ...(result || {}),
      ...(comparisonResult || {})
    };

    res.json(response);

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
app.get('/api/route-hotspots', async (req, res) => {
  console.log('[API CALL] /api/route-hotspots (17-19h peak routes)');
  try {
    const hotspots = await queryRouteHotspots();
    res.json(hotspots); 
  } catch (error) {
    console.error('Failed to fetch route hotspots:', error.message);
    res.status(500).json({ error: error.message || 'Internal server error while fetching route hotspots.' });
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


app.get('/api/accessibility-report', async (req, res) => {
  console.log('[API CALL] Accessibility Report requested. Running two queries...');

  try {
    const [fulfillmentData, requestPercentageData, waitTimeData] = await Promise.all([
      queryWavFulfillmentRate(),
      queryWavRequestPercentage(),
      queryWavWaitTime()
    ]);

    const wavFulfillment = fulfillmentData.map(row => ({
      provider: row.service_provider,
      fulfillmentRate: parseFloat(row.fulfillment_percentage || 0),
      totalRequests: parseInt(row.total_wav_requests || 0, 10),
    }));

    const requestPercentages = requestPercentageData.map(row => ({
        provider: row.service_provider,
        percentOfWavRequest: parseFloat(row.percent_of_wav_request || 0),
        totalTrips: parseInt(row.total_trips || 0, 10),
    }));

    const waitTime = waitTimeData.map(row => ({
        provider: row.service_provider,
        avgWavWait: parseFloat(row.avg_wav_wait_sec || 0),
        avgNonWavWait: parseFloat(row.avg_non_wav_wait_sec || 0),
    }));


    // Combine results into a comprehensive report
    const report = {
      wavFulfillment: wavFulfillment,
      requestPercentages: requestPercentages,
      waitTime: waitTime
    };

    setTimeout(() => {
      res.json(report);
    }, 1200);

  } catch (error) {
    console.error("Failed to process accessibility report:", error.message);
    res.status(500).json({ error: error.message || "Internal server error during data fetching." });
  }
});

/*************************************************/


// --- Server Startup ---
app.listen(PORT, () => {
  console.log(`TripNYC Backend running on http://localhost:${PORT}`);
  console.log('To test: Open a browser to http://localhost:3001/api/status');
});
