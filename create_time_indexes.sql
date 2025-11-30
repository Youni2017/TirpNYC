-- Composite indexes for better query performance
-- These indexes combine location and datetime for faster filtering

-- For yellow_taxi_trip - composite index with pickup_datetime
CREATE INDEX IF NOT EXISTS idx_yellow_pickup_dropoff_datetime ON yellow_taxi_trip(pickup_location, dropoff_location, pickup_datetime);

-- For green_taxi_trip - composite index with pickup_datetime
CREATE INDEX IF NOT EXISTS idx_green_pickup_dropoff_datetime ON green_taxi_trip(pickup_location, dropoff_location, pickup_datetime);

-- For fhv_trip - composite indexes with pickup_datetime
CREATE INDEX IF NOT EXISTS idx_fhv_pickup_dropoff_datetime ON fhv_trip(pickup_location, dropoff_location, pickup_datetime);
CREATE INDEX IF NOT EXISTS idx_fhv_provider_pickup_dropoff_datetime ON fhv_trip(service_provider, pickup_location, dropoff_location, pickup_datetime);

-- Note: These functional indexes will significantly speed up time-of-day filtering
-- Run ANALYZE after creating indexes to update statistics:
-- ANALYZE yellow_taxi_trip;
-- ANALYZE green_taxi_trip;
-- ANALYZE fhv_trip;

