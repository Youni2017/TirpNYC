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
    const result = await pool.query(QUERIES.GET_WAV_FULFILLMENT_RATE_MV);
    return result.rows;
  } catch (err) {
    console.error("Database query error in queryWavFulfillmentRate:", err);
    throw new Error("Failed to retrieve WAV fulfillment data.");
  }
};

const queryWavRequestPercentage = async () => {
  try {
    const result = await pool.query(QUERIES.GET_WAV_REQUEST_PERCENTAGE_MV);
    return result.rows;
  } catch (err) {
    console.error("Database query error in queryWavRequestPercentage:", err);
    throw new Error("Failed to retrieve WAV request percentage data.");
  }
};

const queryWavWaitTime = async () => {
  try {
    const result = await pool.query(QUERIES.GET_WAV_WAIT_TIME_MV);
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

// Provider code mapping: display name -> database code
const PROVIDER_CODE_MAP = {
  'Uber': 'HV0003',
  'Lyft': 'HV0005',
};

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
  // Convert display name (Uber/Lyft) to code (HV0003/HV0005) for database query
  if (serviceProvider) {
    const providerCode = PROVIDER_CODE_MAP[serviceProvider] || serviceProvider;
    console.log(`[queryFHVData] Converting "${serviceProvider}" -> "${providerCode}"`);
    timeConditions.push(`service_provider = $${paramIndex}`);
    queryParams.push(providerCode);
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

  console.log(`[queryFHVData] Query params:`, queryParams);
  console.log(`[queryFHVData] SQL query:`, fhvQuery);

  try {
    const fhvResult = await pool.query(fhvQuery, queryParams);
    console.log(`[queryFHVData] Result rows:`, fhvResult.rows.length);
    console.log(`[queryFHVData] Result data:`, fhvResult.rows[0]);

    // Debug: Check if there's ANY FHV data for these locations
    if (fhvResult.rows.length === 0 || fhvResult.rows[0].avg_total_amount === null) {
      const debugQuery = `
        SELECT COUNT(*) as total_count
        FROM fhv_trip
        WHERE pickup_location = $1 AND dropoff_location = $2;
      `;
      const debugResult = await pool.query(debugQuery, [startId, endId]);
      console.log(`[queryFHVData DEBUG] Total FHV trips for ${startId} -> ${endId}:`, debugResult.rows[0]?.total_count || 0);
      
      if (serviceProvider) {
        const providerCode = PROVIDER_CODE_MAP[serviceProvider] || serviceProvider;
        const providerDebugQuery = `
          SELECT COUNT(*) as provider_count
          FROM fhv_trip
          WHERE pickup_location = $1 AND dropoff_location = $2 AND service_provider = $3;
        `;
        const providerDebugResult = await pool.query(providerDebugQuery, [startId, endId, providerCode]);
        console.log(`[queryFHVData DEBUG] Trips for provider "${providerCode}":`, providerDebugResult.rows[0]?.provider_count || 0);
      }
    }

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
        service_provider = 'HV0003'
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
        service_provider = 'HV0005'
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
        service_provider NOT IN ('HV0003', 'HV0005')
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

const TIME_SLOT_MV_MAP = {
    'morning': 'top_morning_routes_mv',      // e.g., 7:00 to 9:59
    'noon': 'top_noon_routes_mv',            // e.g., 10:00 to 13:59
    'afternoon': 'top_afternoon_routes_mv',  // e.g., 14:00 to 16:59
    'evening': 'top_evening_routes_mv',      // e.g., 17:00 to 19:59
    'night': 'top_night_routes_mv',          // e.g., 20:00 to 23:59
};

const queryRouteHotspots = async (timeSlotKey) => {
    const mvName = TIME_SLOT_MV_MAP[timeSlotKey];

    if (!mvName) {
        throw new Error(`Invalid time slot key: ${timeSlotKey}`);
    }

    const query = `
        SELECT *
        FROM ${mvName}
    `;

    try {
        const result = await pool.query(query);
        return result.rows;
    } catch (err) {
        console.error("Database query error in queryRouteHotspots:", err);
        throw new Error(`Failed to retrieve route hotspots from MV: ${mvName}`);
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

  console.log(`[API CALL] Trip Estimate: ${startLocation} to ${endLocation}, Type: ${tripType}, Provider: ${serviceProvider || 'N/A'}, Start: ${startTime || 'N/A'}, End: ${endTime || 'N/A'}`);

  try {
    let result;
    
    if (tripType === 'taxi') {
      result = await queryTaxiData(startLocation, endLocation, startTime || null, endTime || null);
    } else if (tripType === 'fhv') {
      console.log(`[ESTIMATE-TRIP] Calling queryFHVData with serviceProvider: "${serviceProvider}"`);
      result = await queryFHVData(startLocation, endLocation, startTime || null, endTime || null, serviceProvider);
      console.log(`[ESTIMATE-TRIP] queryFHVData returned:`, result);
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
  const result = await pool.query(QUERIES.GET_TRAFFIC_FLOW, [locationId]);
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

// app.post('/api/route-hotspots', async (req, res) => {
//   const { startTime, endTime } = req.body;

//   if (!startTime || !endTime) {
//     return res.status(400).json({ error: 'Missing startTime or endTime.' });
//   }

//   console.log(`[API CALL] /api/route-hotspots from ${startTime} to ${endTime}`);

//   try {
//     const hotspots = await queryRouteHotspots(startTime, endTime);
//     if (!hotspots || hotspots.length === 0) {
//       return res.status(404).json({ error: 'No data for this time range.' });
//     }
//     res.json(hotspots);
//   } catch (error) {
//     console.error('Failed to fetch route hotspots:', error.message);
//     res.status(500).json({ error: error.message || 'Internal server error while fetching route hotspots.' });
//   }
// });

app.get('/api/route-hotspots', async (req, res) => {
    const { timeSlot } = req.query; 

    if (!timeSlot) {
        return res.status(400).json({ error: 'Missing timeSlot parameter.' });
    }

    
    if (!TIME_SLOT_MV_MAP[timeSlot.toLowerCase()]) {
        return res.status(400).json({ error: `Invalid time slot: ${timeSlot}. Must be one of: ${Object.keys(TIME_SLOT_MV_MAP).join(', ')}` });
    }

    console.log(`[API CALL] Top Routes during slot: ${timeSlot}`);

    try {
        const destinations = await queryRouteHotspots(timeSlot.toLowerCase());

        if (destinations.length === 0) {
            return res.status(404).json({ message: "No frequent destinations found for this criteria." });
        }
        res.json(destinations);

    } catch (error) {
        console.error("Failed to process top routes MV query:", error.message);
        res.status(500).json({ error: error.message || "Internal server error during data fetching." });
    }
});

const PROVIDER_MAP = {
  'HV0003': 'Uber',
  'HV0005': 'Lyft',
};

app.get('/api/accessibility-report', async (req, res) => {
  console.log('[API CALL] Accessibility Report requested. Running two queries...');
  
  try {
    const [fulfillmentData, requestPercentageData, waitTimeData] = await Promise.all([
      queryWavFulfillmentRate(),
      queryWavRequestPercentage(),
      queryWavWaitTime()
    ]);

    const wavFulfillment = fulfillmentData.map(row => ({
      provider: PROVIDER_MAP[row.service_provider] || row.service_provider,
      fulfillmentRate: parseFloat(row.fulfillment_percentage || 0),
      totalRequests: parseInt(row.total_wav_requests || 0, 10),
    }));

    const requestPercentages = requestPercentageData.map(row => ({
        provider: PROVIDER_MAP[row.service_provider] || row.service_provider,
        percentOfWavRequest: parseFloat(row.percent_of_wav_request || 0),
        totalTrips: parseInt(row.total_trips || 0, 10),
    }));

    const waitTime = waitTimeData.map(row => ({
        provider: PROVIDER_MAP[row.service_provider] || row.service_provider,
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

app.get('/api/accessibility-report/fulfillment-rate', async (req, res) => {
  try {
    const rows = await queryWavFulfillmentRate();
    const data = rows.map(r => ({ provider: PROVIDER_MAP[r.service_provider] || r.service_provider, fulfillmentRate: parseFloat(r.fulfillment_percentage || 0), totalRequests: Number(r.total_wav_requests || 0) }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch fulfillment rate' });
  }
});

app.get('/api/accessibility-report/request-percentage', async (req, res) => {
  try {
    const rows = await queryWavRequestPercentage();
    const data = rows.map(r => ({ provider: PROVIDER_MAP[r.service_provider] || r.service_provider, percent: parseFloat(r.percent_of_wav_request || 0), totalTrips: Number(r.total_trips || 0) }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch request percentage' });
  }
});

app.get('/api/accessibility-report/wait-time', async (req, res) => {
  try {
    const rows = await queryWavWaitTime();
    const waitTime = rows.map(row => ({
        provider: PROVIDER_MAP[row.service_provider] || row.service_provider,
        avgWavWait: parseFloat(row.avg_wav_wait_sec || 0),
        avgNonWavWait: parseFloat(row.avg_non_wav_wait_sec || 0),
    }));
    res.json(waitTime);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch wait time' });
  }

  

});

/*************************************************/


// --- Server Startup ---
app.listen(PORT, () => {
  console.log(`TripNYC Backend running on http://localhost:${PORT}`);
  console.log('To test: Open a browser to http://localhost:3001/api/status');
});
