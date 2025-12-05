const QUERIES = {
    GET_AVG_TRAVEL_TIME: `
        SELECT
            doo.zone_name AS arrival_zone,
            rs.dropoff_location AS zone_id,
            rs.trip_count
        FROM
        (
            SELECT
                dropoff_location,
                COUNT(*) AS trip_count
            FROM
            (
                SELECT dropoff_location
                FROM yellow_taxi_trip
                WHERE
                    pickup_location = $1
                    AND (pickup_datetime::time) >= $2::time
                    AND (pickup_datetime::time) < $3::time

                UNION ALL

                SELECT dropoff_location
                FROM green_taxi_trip
                WHERE
                    pickup_location = $1
                    AND (pickup_datetime::time) >= $2::time
                    AND (pickup_datetime::time) < $3::time

                UNION ALL

                SELECT dropoff_location
                FROM fhv_trip
                WHERE
                    pickup_location = $1
                    AND (pickup_datetime::time) >= $2::time
                    AND (pickup_datetime::time) < $3::time
            ) AS combined_trips
            GROUP BY dropoff_location
        ) AS rs
        JOIN zone doo ON rs.dropoff_location = doo.id
        WHERE rs.dropoff_location != $1
        ORDER BY rs.trip_count DESC
        LIMIT 5;
    `,
    
    GET_TRAFFIC_FLOW: `
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
    `,

    GET_ROUTE_HOTSPOT_LEGACY: `
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
        `,

    // WAV Fulfillment Percentage
    GET_WAV_FULFILLMENT_RATE: `
        SELECT
            service_provider,
            SUM(CASE WHEN wav_request_flag = 'Y' THEN 1 ELSE 0 END) AS total_wav_requests, 
            SUM(CASE WHEN wav_request_flag = 'Y' AND wav_match_flag = 'Y' THEN 1 ELSE 0 END) AS total_wav_fulfilled, 
            (CAST(SUM(CASE WHEN wav_request_flag = 'Y' AND wav_match_flag = 'Y' THEN 1 ELSE 0 END) AS DECIMAL(10, 2)) / 
             CAST(SUM(CASE WHEN wav_request_flag = 'Y' THEN 1 ELSE 0 END) AS DECIMAL(10, 2))) * 100 AS fulfillment_percentage 
        FROM fhv_trip 
        GROUP BY service_provider
        HAVING SUM(CASE WHEN wav_request_flag = 'Y' THEN 1 ELSE 0 END) > 0 
        ORDER BY fulfillment_percentage DESC;
    `,

    // Percentage of Trips that Requested WAV (For Uber/Lyft)
    GET_WAV_REQUEST_PERCENTAGE: `
        SELECT
            service_provider,
            SUM(CASE WHEN wav_request_flag = 'Y' THEN 1 ELSE 0 END) AS total_wav_requests,
            COUNT(*) AS total_trips,
            ROUND(
                (CAST(SUM(CASE WHEN wav_request_flag = 'Y' THEN 1 ELSE 0 END) AS DECIMAL(10, 2)) / 
                 CAST(COUNT(*) AS DECIMAL(10, 2))) * 100, 2) AS percent_of_wav_request
        FROM
            fhv_trip
        WHERE
            service_provider IN ('HV0003', 'HV0005')
        GROUP BY
            service_provider
        ORDER BY
            percent_of_wav_request DESC;
    `,

    GET_WAV_WAIT_TIME: `
        SELECT service_provider,
            ROUND(
                AVG(
                    CASE
                        WHEN wav_match_flag = 'Y'
                        THEN EXTRACT(EPOCH FROM (pickup_datetime - request_datetime))
                        ELSE NULL
                    END
                ),
                2
            ) AS avg_wav_wait_sec,
            ROUND(
                AVG(
                    CASE
                        WHEN wav_request_flag = 'N'
                        THEN EXTRACT(EPOCH FROM (pickup_datetime - request_datetime))
                        ELSE NULL
                    END
                ),
                2
            ) AS avg_non_wav_wait_sec
        FROM fhv_trip
        WHERE request_datetime IS NOT NULL
            AND pickup_datetime IS NOT NULL
        GROUP BY service_provider;
    `,

    GET_WAV_FULFILLMENT_RATE_MV: `
        SELECT * FROM mv_wav_fulfillment_rate;
    `,

    GET_WAV_REQUEST_PERCENTAGE_MV: `
        SELECT * FROM mv_wav_request_percentage;
    `,

    GET_WAV_WAIT_TIME_MV: `
        SELECT * FROM mv_wav_wait_time;
    `,
    
    GET_RECOMMEND_DEST: `
        WITH combined_trips AS (
            SELECT pickup_location, dropoff_location 
            FROM yellow_taxi_trip
            WHERE pickup_location = $1
                AND TO_CHAR(pickup_datetime, 'HH24:MI') >= $2
                AND TO_CHAR(pickup_datetime, 'HH24:MI') < $3

            UNION ALL

            SELECT pickup_location, dropoff_location 
            FROM green_taxi_trip
            WHERE pickup_location = $1
                AND TO_CHAR(pickup_datetime, 'HH24:MI') >= $2
                AND TO_CHAR(pickup_datetime, 'HH24:MI') < $3

            UNION ALL

            SELECT pickup_location, dropoff_location 
            FROM fhv_trip
            WHERE pickup_location = $1
                AND TO_CHAR(pickup_datetime, 'HH24:MI') >= $2
                AND TO_CHAR(pickup_datetime, 'HH24:MI') < $3
        ),
        route_stats AS (
            SELECT
                pickup_location,
                dropoff_location,
                COUNT(*) AS trip_count
            FROM combined_trips
            GROUP BY pickup_location, dropoff_location
        )
        SELECT doo.zone_name AS arrival_zone, doo.id AS zone_id
        FROM route_stats rs
        JOIN zone pu ON rs.pickup_location = pu.id
        JOIN zone doo ON rs.dropoff_location = doo.id
        WHERE rs.pickup_location != rs.dropoff_location
        ORDER BY rs.trip_count DESC
        LIMIT 5;
    `,

};


module.exports = QUERIES;