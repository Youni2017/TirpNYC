const QUERIES = {
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
        GROUP BY service_provider
        ORDER BY avg_wav_wait_sec DESC;
    `,

};

module.exports = QUERIES;