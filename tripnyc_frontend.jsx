import React, { useState, useEffect, useCallback } from 'react';
import { Plane, Compass, BarChart, MapPin, Bus, Car } from 'lucide-react';

const TLC_ZONES = [
  { id: 1, name: "Newark Airport" },
  { id: 4, name: "Central Park" },
  { id: 10, name: "Midtown Center" },
  { id: 24, name: "JFK Airport" },
]; // to be get from databse later


const API_BASE_URL = 'http://localhost:3001/api'; //server url

// features
const fetchTripEstimate = async (params) => {
  console.log('Fetching trip estimate for:', params);
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
      throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error in fetchTripEstimate:', error);
    throw error;
  }
};


const fetchTrafficData = async (params) => {
  console.log('Fetching traffic data for Zone:', params.zoneId);
  // TODO
};

// TODO the api call for the route hotspot and accessibility page


// --- UI Components ---

const TripPlannerPage = () => {
  return (
    <div className="space-y-6 p-2">
      <h2 className="text-2xl font-bold text-gray-800">Trip Planner (Price & Time Estimator)</h2>
      <p className="text-sm text-gray-600">Enter zones and time to compare providers (Cost, Time, Wait).</p>

      {/* Placeholder for Input Form */}
      <div className="bg-gray-100 p-6 rounded-xl shadow border border-gray-200">
        <div className="flex flex-col space-y-3">
          <div className="p-3 bg-white rounded-lg border border-gray-300 text-gray-500">
            Input Placeholder: Pickup Zone / Dropoff Zone / Time
          </div>
          <button className="w-full bg-indigo-400 text-white p-3 rounded-lg flex items-center justify-center font-semibold cursor-not-allowed opacity-75">
            <Car className="h-5 w-5 mr-2" />
            GET PREDICTIVE ESTIMATES (Static Button)
          </button>
        </div>
      </div>

      {/* Placeholder for Results */}
      <div className="mt-4">
        <h3 className="text-xl font-semibold text-gray-700 mb-3">Comparison Results (Placeholder)</h3>
        <div className="bg-green-50 p-4 rounded-lg shadow border border-green-200 h-24 flex items-center justify-center text-gray-500">
            Results will appear here after data processing.
        </div>
      </div>
    </div>
  );
};

const TrafficDashboardPage = () => {
  return (
    <div className="space-y-6 p-2">
      <h2 className="text-2xl font-bold text-gray-800">Traffic Dashboard</h2>
      <p className="text-sm text-gray-600">View vehicle inflow/outflow trends by zone and time.</p>

      {/* Placeholder for Input Form */}
      <div className="bg-gray-100 p-4 rounded-xl shadow border border-gray-200">
        <div className="flex flex-col space-y-3">
          <div className="p-3 bg-white rounded-lg border border-gray-300 text-gray-500">
            Input Placeholder: Select Zone for Analysis
          </div>
          <button className="w-full bg-purple-400 text-white p-3 rounded-lg flex items-center justify-center font-semibold cursor-not-allowed opacity-75">
            <BarChart className="h-5 w-5 mr-2" />
            LOAD TREND DATA (Static Button)
          </button>
        </div>
      </div>

      {/* Placeholder for Results */}
      <div className="mt-4">
        <h3 className="text-xl font-semibold text-gray-700 mb-3">Trends (Placeholder)</h3>
        <div className="bg-white p-4 rounded-lg shadow border border-purple-200 h-24 flex items-center justify-center text-gray-500">
            Traffic visualization chart will be embedded here.
        </div>
      </div>
    </div>
  );
};

const AccessibilityReportPage = () => (
  <div className="space-y-6 p-4">
    <h2 className="text-2xl font-bold text-gray-800">Accessibility Report</h2>
    <p className="text-sm text-gray-600">Analyze Wheelchair Accessible Vehicle (WAV) fulfillment rates.</p>
    <div className="bg-gray-100 p-6 rounded-lg h-48 flex items-center justify-center text-gray-500 border border-gray-200">
      <span className="text-base">Placeholder: Visualizing WAV Fulfillment Data</span>
    </div>
  </div>
);

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

  const handleEstimateTrip = useCallback(async (params) => {
    setLoading(true);
    setTripEstimate(null);
    try {
      const data = await fetchTripEstimate(params);
      setTripEstimate(data);
    } catch (error) {
      console.error('Error fetching trip estimate:', error);
    } finally {
      setLoading(false);
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

  const renderPage = () => {
    switch (currentPage) {
      case 'planner':
        return <TripPlannerPage estimate={tripEstimate} loading={loading} handleEstimateTrip={handleEstimateTrip} />;
      case 'traffic':
        return <TrafficDashboardPage trafficData={trafficData} loading={loading} handleFetchTraffic={handleFetchTraffic} />;
      case 'accessibility':
        return <AccessibilityReportPage />;
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
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        .font-sans {
          font-family: 'Inter', sans-serif;
        }
      `}</style>

      {/* Header and Navigation */}
      <header className="bg-indigo-700 text-white shadow-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold tracking-tight">TripNYC</h1>
        </div>
        <nav className="bg-indigo-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-start space-x-1 md:space-x-4 overflow-x-auto py-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition duration-150 ease-in-out whitespace-nowrap
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

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-2xl p-4 md:p-8">
          {renderPage()}
        </div>
      </main>

      <footer className="mt-10 py-4 text-center text-xs text-gray-500 border-t">
        TripNYC  | Made by Group 29
      </footer>
    </div>
  );
};

export default App;
