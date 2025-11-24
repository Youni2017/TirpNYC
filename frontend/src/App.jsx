import React, { useState, useEffect, useCallback } from 'react';
import { Plane, Compass, BarChart, MapPin, Bus, Car, Zap, Timer, Route } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const TLC_ZONES = [
  { id: 1, name: "Newark Airport" },
  { id: 4, name: "Central Park" },
  { id: 10, name: "Midtown Center" },
  { id: 24, name: "JFK Airport" },
  { id: 70, name: "Zone 70" }, 
]; // to be get from databse later


const API_BASE_URL = 'http://localhost:3001/api'; //server url


const LoadingSpinner = ({ color = 'text-white' }) => (
  <svg className={`animate-spin h-5 w-5 ${color} mr-2`} viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// features
const fetchTripEstimate = async (params) => {
  console.log('Fetching trip estimate for:', params);
  console.log('Sending to:', `${API_BASE_URL}/estimate-trip`);
  try {
    const response = await fetch(`${API_BASE_URL}/estimate-trip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorText}`);
    }

    const data = await response.json();
    console.log('Trip estimate response:', data);
    return data;
  } catch (error) {
    console.error('API Error in fetchTripEstimate:', error);
    throw error;
  }
};

const fetchRecommendedDestinations = async (params) => {
  const { departureZoneId, startTime, endTime } = params;
  const start = startTime || '00:00';
  const end = endTime || '23:59';

  const url = `${API_BASE_URL}/recommend-destinations?departureZoneId=${departureZoneId}&startTime=${start}&endTime=${end}`;
  
  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API Error in fetchRecommendedDestinations:`, error);
    throw error;
  }
};


const fetchTrafficData = async ({ zoneId }) => {
  console.log('Fetching traffic data for Zone:', zoneId);
  try {
    const response = await fetch(
      `${API_BASE_URL}/traffic-dashboard?locationId=${encodeURIComponent(zoneId)}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorText}`);
    }

    const data = await response.json();

    const rows = Array.isArray(data) ? data : data.rows || [];
    return rows;
  } catch (error) {
    console.error('API Error in fetchTrafficData:', error);
    throw error;
  }
};

const fetchAccessibilityReport = async () => {
  console.log('Fetching accessibility data:');
  try {
    const response = await fetch(
      `${API_BASE_URL}/accessibility-report`
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorText}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error('API Error in fetchTrafficData:', error);
    throw error;
  }
};


// --- UI Components ---

const TripPlannerPage = ({ estimate, loading, handleEstimateTrip, recommendedDestinations, handleFetchRecommendedDestinations}) => {
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('23:59');
  const [serviceProvider, setServiceProvider] = useState('');
  const [tripType, setTripType] = useState('taxi'); // 'taxi' or 'fhv'
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    
    // Validation
    if (!startLocation || !endLocation) {
      setError('Please select both start and end locations.');
      return;
    }

    if (tripType === 'fhv' && !serviceProvider) {
      setError('Please enter a service provider for FHV.');
      return;
    }


    const params = {
      startLocation: parseInt(startLocation),
      endLocation: parseInt(endLocation),
      startTime: startTime || null,
      endTime: endTime || null,
      serviceProvider: tripType === 'fhv' ? serviceProvider : null,
      tripType: tripType
    };

    try {
      // Fetch trip estimate (main feature - must work independently)
      await handleEstimateTrip(params);
      
      // Fetch recommended destinations (separate feature - don't break trip planner if it fails)
      if (handleFetchRecommendedDestinations) {
        handleFetchRecommendedDestinations({ 
          departureZoneId: parseInt(startLocation),
          startTime,
          endTime
        }).catch(err => {
          // Silently fail - this is a separate feature
          // The handleFetchRecommendedDestinations will set it to empty array on error
          console.warn('Recommended destinations failed (this is OK):', err);
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch trip estimate.');
    }
  };

  return (
    <div className="space-y-6 p-4 w-full">
      <h2 className="text-2xl font-bold text-gray-800">Trip Planner (Price & Time Estimator)</h2>
      <p className="text-sm text-gray-600">Enter zones and time to compare providers (Cost, Time, Wait).</p>

      {/* Input Form */}
      <div className="bg-gray-100 p-6 rounded-xl shadow border border-gray-200">
        <div className="flex flex-col space-y-4">
          {/* Start Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Location
            </label>
            <select
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
            >
              <option value="">Select start location</option>
              {TLC_ZONES.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} (ID: {z.id})
                </option>
              ))}
            </select>
          </div>

          {/* End Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Location
            </label>
            <select
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={endLocation}
              onChange={(e) => setEndLocation(e.target.value)}
            >
              <option value="">Select end location</option>
              {TLC_ZONES.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} (ID: {z.id})
                </option>
              ))}
            </select>
          </div>

          {/* Time Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time (HH:MM) <span className="text-gray-500 text-xs">(optional)</span>
              </label>
              <input
                type="time"
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                step="60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time (HH:MM) <span className="text-gray-500 text-xs">(optional)</span>
              </label>
              <input
                type="time"
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                step="60"
              />
            </div>
          </div>

          {/* Trip Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trip Type
            </label>
            <div className="flex flex-col space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tripType"
                  value="taxi"
                  checked={tripType === 'taxi'}
                  onChange={(e) => setTripType(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">Green/Yellow Taxi</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tripType"
                  value="fhv"
                  checked={tripType === 'fhv'}
                  onChange={(e) => setTripType(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">FHV</span>
              </label>
            </div>
          </div>

          {/* Service Provider (only for FHV) */}
          {tripType === 'fhv' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Provider
              </label>
              <input
                type="text"
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="e.g., Uber, Lyft"
                value={serviceProvider}
                onChange={(e) => setServiceProvider(e.target.value)}
              />
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full bg-indigo-500 text-white p-3 rounded-lg flex items-center justify-center font-semibold
              ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-600 cursor-pointer'}
            `}
          >
            {loading ? (
                <><LoadingSpinner /> Loading...</> // <--- 确保 LoadingSpinner 被调用
            ) : (
                <><Car className="h-5 w-5 mr-2" /> GET PREDICTIVE ESTIMATES</>
            )}
          </button>
        </div>
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="mt-4">
          <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-200 text-center">
            <div className="flex items-center justify-center">
              <LoadingSpinner color="text-blue-600" />
              <span className="text-blue-700">Loading trip estimate...</span>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && estimate && (
        <div className="mt-4 space-y-4">
          {/* Selected Provider Results */}
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Selected Provider Results</h3>
            <div className="bg-green-50 p-4 rounded-lg shadow border border-green-200">
              <div className="space-y-2">
                {/* Average Cost - always shown */}
                <div className="text-sm">
                  <span className="font-semibold">Average Cost: </span>
                  <span className="text-lg font-bold text-green-700">${estimate.avg_total_amount || 'N/A'}</span>
                </div>
                
                {/* Min Cost */}
                {estimate.min_total_amount !== undefined && estimate.min_total_amount !== null && (
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">Min Cost: </span>${estimate.min_total_amount}
                  </div>
                )}
                
                {/* Max Cost */}
                {estimate.max_total_amount !== undefined && estimate.max_total_amount !== null && (
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">Max Cost: </span>${estimate.max_total_amount}
                  </div>
                )}
                
                {/* Waiting Time - only for FHV */}
                {tripType === 'fhv' && estimate.avg_waiting_time !== undefined && estimate.avg_waiting_time !== null && (
                  <div className="text-sm mt-2 pt-2 border-t border-gray-200">
                    <span className="font-semibold">Average Waiting Time: </span>
                    <span className="text-lg font-bold text-blue-700">{estimate.avg_waiting_time} minutes</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* All Providers Comparison */}
          {estimate.overall_avg_price !== undefined && estimate.overall_avg_price !== null && (
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-3">All Providers Comparison</h3>
              <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-200">
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-semibold">Overall Average Cost: </span>
                    <span className="text-lg font-bold text-blue-700">${estimate.overall_avg_price}</span>
                  </div>
                  
                  {estimate.overall_min_price !== undefined && estimate.overall_min_price !== null && (
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold">Overall Min Cost: </span>${estimate.overall_min_price}
                    </div>
                  )}
                  
                  {estimate.overall_max_price !== undefined && estimate.overall_max_price !== null && (
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold">Overall Max Cost: </span>${estimate.overall_max_price}
                    </div>
                  )}
                  
                  {estimate.recommended_vehicle_type && (
                    <div className="text-sm mt-2 pt-2 border-t border-gray-200">
                      <span className="font-semibold">Recommended Provider: </span>
                      <span className="text-lg font-bold text-purple-700">{estimate.recommended_vehicle_type}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Results Message */}
      {!loading && !estimate && !error && (
        <div className="mt-4">
          <div className="bg-gray-50 p-4 rounded-lg shadow border border-gray-200 text-center text-gray-500">
            Click "GET PREDICTIVE ESTIMATES" to see trip cost information.
          </div>
        </div>
      )}
  

      {/* recommended dest - always show if startLocation is set */}
      {startLocation && (
          <div className="mt-4">
            <h3 className="text-xl font-semibold text-indigo-700 mb-3 flex items-center">
                <Route className="w-5 h-5 mr-2"/> Top Destinations from {TLC_ZONES.find(z => z.id === parseInt(startLocation))?.name || `Zone ${startLocation}`}
            </h3>
            {loading && (
                <div className="text-gray-500 text-sm p-4 text-center border rounded-lg bg-gray-50">
                    Loading destinations...
                </div>
            )}
            {!loading && recommendedDestinations && recommendedDestinations.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {recommendedDestinations.map((rec, index) => (
                        <div key={index} 
                             className="bg-white p-3 rounded-lg shadow border border-indigo-300 text-center cursor-pointer hover:bg-indigo-100 transition"
                             onClick={() => setEndLocation(rec.zone_id.toString())}>
                            <p className="text-lg font-bold text-indigo-600">{rec.arrival_zone}</p>
                        </div>
                    ))}
                </div>
            )}
            {!loading && (!recommendedDestinations || recommendedDestinations.length === 0) && (
                <div className="text-gray-500 text-sm p-4 text-center border rounded-lg bg-gray-50">
                    No high-volume destinations found for this zone/time.
                </div>
            )}
          </div>
      )}
    </div>
  );
};



const TrafficDashboardPage = ({ trafficData, loading, handleFetchTraffic }) => {
  const [selectedZoneId, setSelectedZoneId] = useState(70);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('both'); // 'both' | 'workday' | 'weekend'

  const handleLoadClick = async () => {
    setError('');
    try {
      await handleFetchTraffic({ zoneId: selectedZoneId });
    } catch (err) {
      setError(err.message || 'Failed to load traffic data');
    }
  };


  const chartData = (trafficData || []).map((row) => ({
    hour: row.hour_of_day,
    workday: Number(row.avg_workday_trips ?? 0),
    weekend: Number(row.avg_weekend_trips ?? 0),
  }));

  return (
    <div className="space-y-6 p-2">
      <h2 className="text-2xl font-bold text-gray-800">Traffic Dashboard</h2>
      <p className="text-sm text-gray-600">
        View average hourly inflow/outflow (in &amp; out combined) for a given zone, comparing workdays vs weekends.
      </p>

      {/*  */}
      <div className="bg-gray-100 p-4 rounded-xl shadow border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select TLC Zone
            </label>
            <select
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={selectedZoneId}
              onChange={(e) => setSelectedZoneId(Number(e.target.value))}
            >
              {TLC_ZONES.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} (ID: {z.id})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleLoadClick}
            disabled={loading}
            className={`w-full md:w-auto bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center justify-center font-semibold
              ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-purple-600 cursor-pointer'}
            `}
          >
            <BarChart className="h-5 w-5 mr-2" />
            {loading ? 'Loading...' : 'LOAD TREND DATA'}
          </button>
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-600">
            Error: {error}
          </p>
        )}
      </div>

      {/* graph region */}
      <div className="bg-white p-4 rounded-lg shadow border border-purple-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 space-y-2 md:space-y-0">
          <h3 className="text-xl font-semibold text-gray-700">
            Hourly Average Traffic (Zone {selectedZoneId})
          </h3>

          {/* Workday / Weekend option */}
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 overflow-hidden text-xs">
            <button
              className={`px-3 py-1 ${
                viewMode === 'both'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setViewMode('both')}
            >
              Both
            </button>
            <button
              className={`px-3 py-1 ${
                viewMode === 'workday'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setViewMode('workday')}
            >
              Workday
            </button>
            <button
              className={`px-3 py-1 ${
                viewMode === 'weekend'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setViewMode('weekend')}
            >
              Weekend
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-gray-600 text-sm">Loading traffic data...</div>
        )}

        {!loading && chartData && chartData.length > 0 && (
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 20, right: 24, left:48, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="hour"
                  label={{ value: 'Hour of Day', position: 'insideBottom', offset: -4 }}
                  tickMargin={6}
                />
                <YAxis
                  label={{ value: 'Avg Trips', angle: -90, position: 'insideLeft' }}
                  tickMargin={6}
                />
                <Tooltip />
                <Legend />
                {(viewMode === 'both' || viewMode === 'workday') && (
                  <Line
                    type="monotone"
                    dataKey="workday"
                    name="Workday"
                    stroke="#6366F1"
                    strokeWidth={2}
                    dot={false}
                  />
                )}
                {(viewMode === 'both' || viewMode === 'weekend') && (
                  <Line
                    type="monotone"
                    dataKey="weekend"
                    name="Weekend"
                    stroke="#EC4899"
                    strokeWidth={2}
                    dot={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {!loading && (!chartData || chartData.length === 0) && (
          <div className="text-gray-500 text-sm">
            No data yet. Select a zone and click <span className="font-semibold">LOAD TREND DATA</span>.
          </div>
        )}

        <p className="mt-2 text-xs text-gray-500">
          Each value is the average number of trips (in + out) for that hour, aggregated across the date range
          and split into workdays vs weekends.
        </p>
      </div>

      {/* optional: tables */}
      {!loading && trafficData && trafficData.length > 0 && (
        <div className="mt-4 bg-white p-4 rounded-lg shadow border border-purple-100 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-purple-50">
                <th className="border border-gray-200 px-2 py-1 text-right">Hour</th>
                <th className="border border-gray-200 px-2 py-1 text-right">Avg Workday Trips</th>
                <th className="border border-gray-200 px-2 py-1 text-right">Avg Weekend Trips</th>
              </tr>
            </thead>
            <tbody>
              {trafficData.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-100 px-2 py-1 text-right">
                    {row.hour_of_day}
                  </td>
                  <td className="border border-gray-100 px-2 py-1 text-right">
                    {row.avg_workday_trips}
                  </td>
                  <td className="border border-gray-100 px-2 py-1 text-right">
                    {row.avg_weekend_trips}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};


const AccessibilityReportPage = ({ accessibilityData, loading, handleFetchAccessibility }) => {
  useEffect(() => {
    if (accessibilityData === null && !loading) {
      handleFetchAccessibility();
    }
  }, [accessibilityData, loading, handleFetchAccessibility]);

  if (loading && !accessibilityData) {
    return (
      <div className="w-full space-y-6 p-4">
        <h2 className="text-2xl font-bold text-gray-800">Accessibility Report</h2>
        <div className="bg-gray-100 p-6 rounded-lg h-48 flex items-center justify-center text-gray-500 border border-gray-200">
          <LoadingSpinner color="text-gray-500" /> Compiling Comprehensive Accessibility Report...
        </div>
      </div>
    );
  }

  if (!accessibilityData) {
    return (
        <div className="w-full space-y-6 p-4">
            <h2 className="text-2xl font-bold text-gray-800">Accessibility Report</h2>
            <div className="text-red-600 p-4 border border-red-300 bg-red-50 rounded-lg">
                <p className='font-semibold'>Error: Could not load accessibility data.</p>
                <p className='text-sm'>Please ensure the Node.js backend is running and the PostgreSQL connection details are correct.</p>
            </div>
        </div>
    );
  }
  const { wavFulfillment, requestPercentages, waitTime } = accessibilityData;

  const StatCard = ({ icon: Icon, title, value, unit, description, color }) => (
    <div className={`bg-white p-4 rounded-xl shadow-md border-t-4 border-${color}-500`}>
        <div className="flex items-center space-x-3">
            <Icon className={`w-6 h-6 text-${color}-600`} />
            <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
        </div>
        <p className="text-3xl font-extrabold text-gray-900 mt-2">{value}{unit}</p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
  );

  return (
    <div className="space-y-8 p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">Accessibility Report (WAV Metrics)</h2>
      <p className="text-sm text-gray-600">Analysis of Wheelchair Accessible Vehicle (WAV) request fulfillment, volume, and wait times across ride-hail platforms.</p>
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-green-700 flex items-center"><Zap className="w-5 h-5 mr-2"/> WAV Fulfillment Performance</h3>
        <p className="text-sm text-gray-600">The historical percentage of requested WAV trips that were successfully matched and fulfilled.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {wavFulfillment.map(item => (
            <div key={item.provider} className="bg-green-50 p-4 rounded-lg shadow border border-green-200">
              <span className="font-semibold text-green-800">{item.provider}</span>
              <p className="text-2xl font-bold mt-1 mb-2 text-gray-900">{item.fulfillmentRate.toFixed(2)}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${item.fulfillmentRate}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Total WAV Requests: {item.totalRequests.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-indigo-700 flex items-center"><Timer className="w-5 h-5 mr-2"/> Wait Time Disparity (Seconds)</h3>
        <p className="text-sm text-gray-600">Compares the average wait time for fulfilled WAV requests versus standard non-WAV requests.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {waitTime.map(item => (
                <div key={item.provider} className="bg-indigo-50 p-4 rounded-xl shadow border border-indigo-200">
                    <span className="font-semibold text-indigo-800">{item.provider}</span>
                    <div className="mt-2 space-y-2 text-sm">
                        <div className="flex justify-between items-center bg-indigo-100 p-2 rounded-md">
                            <span className="font-medium text-gray-700">WAV Wait (Avg)</span>
                            <span className="text-lg font-bold text-indigo-700">{Math.round(item.avgWavWait)}s</span>
                        </div>
                        <div className="flex justify-between items-center bg-indigo-100 p-2 rounded-md">
                            <span className="font-medium text-gray-700">Non-WAV Wait (Avg)</span>
                            <span className="text-lg font-bold text-gray-700">{Math.round(item.avgNonWavWait)}s</span>
                        </div>
                        <p className="text-xs italic text-indigo-800 pt-1">
                            WAV wait is **{Math.round(item.avgWavWait - item.avgNonWavWait)}s** longer.
                        </p>
                    </div>
                </div>
            ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-red-700 flex items-center"><MapPin className="w-5 h-5 mr-2"/> WAV Request Volume</h3>
        <p className="text-sm text-gray-600">The percentage of a provider's total trips that were initiated as WAV requests (for context).</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {requestPercentages.map(item => (
                <StatCard 
                    key={item.provider}
                    icon={Bus}
                    title={item.provider}
                    value={item.percentOfWavRequest.toFixed(2)}
                    unit="%"
                    description={`WAV requests out of ${item.totalTrips.toLocaleString()} total trips.`}
                    color="red"
                />
            ))}
        </div>
      </section>
      
    </div>
  );
}

const RouteHotspotsPage = () => (
  <div className="space-y-6 p-4">
    <h2 className="text-2xl font-bold text-gray-800">Route Hotspots</h2>
    <p className="text-sm text-gray-600">See the top 10 busiest routes by hour.</p>
    <div className="bg-gray-100 p-6 rounded-lg h-48 flex items-center justify-center text-gray-500 border border-gray-200">
      <span className="text-base">Placeholder: Interactive Route Analytics</span>
    </div>
  </div>
);


// --- Main Application Component ---

const App = () => {
  const [currentPage, setCurrentPage] = useState('planner');
  const [loading, setLoading] = useState(false);
  const [tripEstimate, setTripEstimate] = useState(null);
  const [trafficData, setTrafficData] = useState(null);
  const [accessibilityData, setAccessibilityData] = useState(null);
  const [recommendedDestinations, setRecommendedDestinations] = useState(null); 

  const handleEstimateTrip = useCallback(async (params) => {
    setLoading(true);
    setTripEstimate(null);
    try {
      const data = await fetchTripEstimate(params);
      setTripEstimate(data);
      return data;
    } catch (error) {
      console.error('Error fetching trip estimate:', error);
      setTripEstimate(null);
      throw error; // Re-throw so handleSubmit can catch it
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFetchRecommendedDestinations = useCallback(async (params) => {
    if (!params) {
        setRecommendedDestinations(null);
        return;
    }
    try {
        const data = await fetchRecommendedDestinations(params);
        setRecommendedDestinations(data);
        return data;
    } catch (error) {
        console.error('Error fetching recommended destinations:', error);
        setRecommendedDestinations([]);
        throw error;
    }
  }, []);

  const handleFetchTraffic = useCallback(async (params) => {
    setLoading(true);
    setTrafficData(null);
    try {
      const data = await fetchTrafficData(params);
      setTrafficData(data);
    } catch (error) {
      console.error('Error fetching traffic data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFetchAccessibility = useCallback(async () => {
    setLoading(true);
    setAccessibilityData(null);
    try {
      const data = await fetchAccessibilityReport();
      setAccessibilityData(data);
    } catch (error) {
      console.error('Error fetching accessibility report:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'planner':
        return <TripPlannerPage estimate={tripEstimate} 
                    loading={loading} 
                    handleEstimateTrip={handleEstimateTrip} 
                    recommendedDestinations={recommendedDestinations} 
                    handleFetchRecommendedDestinations={handleFetchRecommendedDestinations} />;
      case 'traffic':
        return <TrafficDashboardPage trafficData={trafficData} loading={loading} handleFetchTraffic={handleFetchTraffic} />;
      case 'accessibility':
        return <AccessibilityReportPage accessibilityData={accessibilityData} loading={loading} handleFetchAccessibility={handleFetchAccessibility} />;
      case 'hotspots':
        return <RouteHotspotsPage />;
      default:
        return <TripPlannerPage estimate={tripEstimate} loading={loading} handleEstimateTrip={handleEstimateTrip} />;
    }
  };

  const navItems = [
    { id: 'planner', name: 'Trip Planner', icon: Plane },
    { id: 'traffic', name: 'Traffic Dashboard', icon: Compass },
    { id: 'hotspots', name: 'Route Hotspots', icon: MapPin },
    { id: 'accessibility', name: 'Accessibility Report', icon: BarChart },
  ];

  return (
    <div className="min-h-screen w-full bg-gray-50 font-sans antialiased flex flex-col">
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        .font-sans {
          font-family: 'Inter', sans-serif;
        }
      `}</style>

      {/* Header and Navigation */}
      <header className="bg-indigo-700 text-white shadow-xl sticky top-0 z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold tracking-tight">TripNYC</h1>
        </div>
        <nav className="bg-indigo-800">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-start space-x-1 md:space-x-4 overflow-x-auto py-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`flex flex-col items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition duration-150 ease-in-out whitespace-nowrap
                      ${isActive
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      </header>

      <main className="w-full py-4">
        <div className="w-full bg-white p-2 md:p-4">
          {renderPage()}
        </div>
      </main>

      <footer className="mt-10 py-4 text-center text-xs text-gray-500 border-t">
        TripNYC  | Made with Love | Youni, Mengyang, Feiyang, Qingyang
      </footer>
    </div>
  );
};

export default App;
