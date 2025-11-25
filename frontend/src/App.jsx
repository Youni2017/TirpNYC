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
  { id: 2, name: "Jamaica Bay" },
  { id: 3, name: "Allerton/Pelham Gardens" },
  { id: 4, name: "Alphabet City" },
  { id: 5, name: "Arden Heights" },
  { id: 6, name: "Arrochar/Fort Wadsworth" },
  { id: 7, name: "Astoria" },
  { id: 8, name: "Astoria Park" },
  { id: 9, name: "Auburndale" },
  { id: 10, name: "Baisley Park" },
  { id: 11, name: "Bath Beach" },
  { id: 12, name: "Battery Park" },
  { id: 13, name: "Battery Park City" },
  { id: 14, name: "Bay Ridge" },
  { id: 15, name: "Bay Terrace/Fort Totten" },
  { id: 16, name: "Bayside" },
  { id: 17, name: "Bedford" },
  { id: 18, name: "Bedford Park" },
  { id: 19, name: "Bellerose" },
  { id: 20, name: "Belmont" },
  { id: 21, name: "Bensonhurst East" },
  { id: 22, name: "Bensonhurst West" },
  { id: 23, name: "Bloomfield/Emerson Hill" },
  { id: 24, name: "Bloomingdale" },
  { id: 25, name: "Boerum Hill" },
  { id: 26, name: "Borough Park" },
  { id: 27, name: "Breezy Point/Fort Tilden/Riis Be" },
  { id: 28, name: "Briarwood/Jamaica Hills" },
  { id: 29, name: "Brighton Beach" },
  { id: 30, name: "Broad Channel" },
  { id: 31, name: "Bronx Park" },
  { id: 32, name: "Bronxdale" },
  { id: 33, name: "Brooklyn Heights" },
  { id: 34, name: "Brooklyn Navy Yard" },
  { id: 35, name: "Brownsville" },
  { id: 36, name: "Bushwick North" },
  { id: 37, name: "Bushwick South" },
  { id: 38, name: "Cambria Heights" },
  { id: 39, name: "Canarsie" },
  { id: 40, name: "Carroll Gardens" },
  { id: 41, name: "Central Harlem" },
  { id: 42, name: "Central Harlem North" },
  { id: 43, name: "Central Park" },
  { id: 44, name: "Charleston/Tottenville" },
  { id: 45, name: "Chinatown" },
  { id: 46, name: "City Island" },
  { id: 47, name: "Claremont/Bathgate" },
  { id: 48, name: "Clinton East" },
  { id: 49, name: "Clinton Hill" },
  { id: 50, name: "Clinton West" },
  { id: 51, name: "Co-Op City" },
  { id: 52, name: "Cobble Hill" },
  { id: 53, name: "College Point" },
  { id: 54, name: "Columbia Street" },
  { id: 55, name: "Coney Island" },
  { id: 56, name: "Corona" },
  { id: 57, name: "Corona" },
  { id: 58, name: "Country Club" },
  { id: 59, name: "Crotona Park" },
  { id: 60, name: "Crotona Park East" },
  { id: 61, name: "Crown Heights North" },
  { id: 62, name: "Crown Heights South" },
  { id: 63, name: "Cypress Hills" },
  { id: 64, name: "Douglaston" },
  { id: 65, name: "Downtown Brooklyn/MetroTech" },
  { id: 66, name: "DUMBO/Vinegar Hill" },
  { id: 67, name: "Dyker Heights" },
  { id: 68, name: "East Chelsea" },
  { id: 69, name: "East Concourse/Concourse Village" },
  { id: 70, name: "East Elmhurst" },
  { id: 71, name: "East Flatbush/Farragut" },
  { id: 72, name: "East Flatbush/Remsen Village" },
  { id: 73, name: "East Flushing" },
  { id: 74, name: "East Harlem North" },
  { id: 75, name: "East Harlem South" },
  { id: 76, name: "East New York" },
  { id: 77, name: "East New York/Pennsylvania Avenu" },
  { id: 78, name: "East Tremont" },
  { id: 79, name: "East Village" },
  { id: 80, name: "East Williamsburg" },
  { id: 81, name: "Eastchester" },
  { id: 82, name: "Elmhurst" },
  { id: 83, name: "Elmhurst/Maspeth" },
  { id: 84, name: "Eltingville/Annadale/Prince's Ba" },
  { id: 85, name: "Erasmus" },
  { id: 86, name: "Far Rockaway" },
  { id: 87, name: "Financial District North" },
  { id: 88, name: "Financial District South" },
  { id: 89, name: "Flatbush/Ditmas Park" },
  { id: 90, name: "Flatiron" },
  { id: 91, name: "Flatlands" },
  { id: 92, name: "Flushing" },
  { id: 93, name: "Flushing Meadows-Corona Park" },
  { id: 94, name: "Fordham South" },
  { id: 95, name: "Forest Hills" },
  { id: 96, name: "Forest Park/Highland Park" },
  { id: 97, name: "Fort Greene" },
  { id: 98, name: "Fresh Meadows" },
  { id: 99, name: "Freshkills Park" },
  { id: 100, name: "Garment District" },
  { id: 101, name: "Glen Oaks" },
  { id: 102, name: "Glendale" },
  { id: 103, name: "Governor's Island/Ellis Island/L" },
  { id: 104, name: "Governor's Island/Ellis Island/L" },
  { id: 105, name: "Governor's Island/Ellis Island/L" },
  { id: 106, name: "Gowanus" },
  { id: 107, name: "Gramercy" },
  { id: 108, name: "Gravesend" },
  { id: 109, name: "Great Kills" },
  { id: 110, name: "Great Kills Park" },
  { id: 111, name: "Green-Wood Cemetery" },
  { id: 112, name: "Greenpoint" },
  { id: 113, name: "Greenwich Village North" },
  { id: 114, name: "Greenwich Village South" },
  { id: 115, name: "Grymes Hill/Clifton" },
  { id: 116, name: "Hamilton Heights" },
  { id: 117, name: "Hammels/Arverne" },
  { id: 118, name: "Heartland Village/Todt Hill" },
  { id: 119, name: "Highbridge" },
  { id: 120, name: "Highbridge Park" },
  { id: 121, name: "Hillcrest/Pomonok" },
  { id: 122, name: "Hollis" },
  { id: 123, name: "Homecrest" },
  { id: 124, name: "Howard Beach" },
  { id: 125, name: "Hudson Sq" },
  { id: 126, name: "Hunts Point" },
  { id: 127, name: "Inwood" },
  { id: 128, name: "Inwood Hill Park" },
  { id: 129, name: "Jackson Heights" },
  { id: 130, name: "Jamaica" },
  { id: 131, name: "Jamaica Estates" },
  { id: 132, name: "JFK Airport" },
  { id: 133, name: "Kensington" },
  { id: 134, name: "Kew Gardens" },
  { id: 135, name: "Kew Gardens Hills" },
  { id: 136, name: "Kingsbridge Heights" },
  { id: 137, name: "Kips Bay" },
  { id: 138, name: "LaGuardia Airport" },
  { id: 139, name: "Laurelton" },
  { id: 140, name: "Lenox Hill East" },
  { id: 141, name: "Lenox Hill West" },
  { id: 142, name: "Lincoln Square East" },
  { id: 143, name: "Lincoln Square West" },
  { id: 144, name: "Little Italy/NoLiTa" },
  { id: 145, name: "Long Island City/Hunters Point" },
  { id: 146, name: "Long Island City/Queens Plaza" },
  { id: 147, name: "Longwood" },
  { id: 148, name: "Lower East Side" },
  { id: 149, name: "Madison" },
  { id: 150, name: "Manhattan Beach" },
  { id: 151, name: "Manhattan Valley" },
  { id: 152, name: "Manhattanville" },
  { id: 153, name: "Marble Hill" },
  { id: 154, name: "Marine Park/Floyd Bennett Field" },
  { id: 155, name: "Marine Park/Mill Basin" },
  { id: 156, name: "Mariners Harbor" },
  { id: 157, name: "Maspeth" },
  { id: 158, name: "Meatpacking/West Village West" },
  { id: 159, name: "Melrose South" },
  { id: 160, name: "Middle Village" },
  { id: 161, name: "Midtown Center" },
  { id: 162, name: "Midtown East" },
  { id: 163, name: "Midtown North" },
  { id: 164, name: "Midtown South" },
  { id: 165, name: "Midwood" },
  { id: 166, name: "Morningside Heights" },
  { id: 167, name: "Morrisania/Melrose" },
  { id: 168, name: "Mott Haven/Port Morris" },
  { id: 169, name: "Mount Hope" },
  { id: 170, name: "Murray Hill" },
  { id: 171, name: "Murray Hill-Queens" },
  { id: 172, name: "New Dorp/Midland Beach" },
  { id: 173, name: "North Corona" },
  { id: 174, name: "Norwood" },
  { id: 175, name: "Oakland Gardens" },
  { id: 176, name: "Oakwood" },
  { id: 177, name: "Ocean Hill" },
  { id: 178, name: "Ocean Parkway South" },
  { id: 179, name: "Old Astoria" },
  { id: 180, name: "Ozone Park" },
  { id: 181, name: "Park Slope" },
  { id: 182, name: "Parkchester" },
  { id: 183, name: "Pelham Bay" },
  { id: 184, name: "Pelham Bay Park" },
  { id: 185, name: "Pelham Parkway" },
  { id: 186, name: "Penn Station/Madison Sq West" },
  { id: 187, name: "Port Richmond" },
  { id: 188, name: "Prospect-Lefferts Gardens" },
  { id: 189, name: "Prospect Heights" },
  { id: 190, name: "Prospect Park" },
  { id: 191, name: "Queens Village" },
  { id: 192, name: "Queensboro Hill" },
  { id: 193, name: "Queensbridge/Ravenswood" },
  { id: 194, name: "Randalls Island" },
  { id: 195, name: "Red Hook" },
  { id: 196, name: "Rego Park" },
  { id: 197, name: "Richmond Hill" },
  { id: 198, name: "Ridgewood" },
  { id: 199, name: "Rikers Island" },
  { id: 200, name: "Riverdale/North Riverdale/Fields" },
  { id: 201, name: "Rockaway Park" },
  { id: 202, name: "Roosevelt Island" },
  { id: 203, name: "Rosedale" },
  { id: 204, name: "Rossville/Woodrow" },
  { id: 205, name: "Saint Albans" },
  { id: 206, name: "Saint George/New Brighton" },
  { id: 207, name: "Saint Michaels Cemetery/Woodside" },
  { id: 208, name: "Schuylerville/Edgewater Park" },
  { id: 209, name: "Seaport" },
  { id: 210, name: "Sheepshead Bay" },
  { id: 211, name: "SoHo" },
  { id: 212, name: "Soundview/Bruckner" },
  { id: 213, name: "Soundview/Castle Hill" },
  { id: 214, name: "South Beach/Dongan Hills" },
  { id: 215, name: "South Jamaica" },
  { id: 216, name: "South Ozone Park" },
  { id: 217, name: "South Williamsburg" },
  { id: 218, name: "Springfield Gardens North" },
  { id: 219, name: "Springfield Gardens South" },
  { id: 220, name: "Spuyten Duyvil/Kingsbridge" },
  { id: 221, name: "Stapleton" },
  { id: 222, name: "Starrett City" },
  { id: 223, name: "Steinway" },
  { id: 224, name: "Stuy Town/Peter Cooper Village" },
  { id: 225, name: "Stuyvesant Heights" },
  { id: 226, name: "Sunnyside" },
  { id: 227, name: "Sunset Park East" },
  { id: 228, name: "Sunset Park West" },
  { id: 229, name: "Sutton Place/Turtle Bay North" },
  { id: 230, name: "Times Sq/Theatre District" },
  { id: 231, name: "TriBeCa/Civic Center" },
  { id: 232, name: "Two Bridges/Seward Park" },
  { id: 233, name: "UN/Turtle Bay South" },
  { id: 234, name: "Union Sq" },
  { id: 235, name: "University Heights/Morris Height" },
  { id: 236, name: "Upper East Side North" },
  { id: 237, name: "Upper East Side South" },
  { id: 238, name: "Upper West Side North" },
  { id: 239, name: "Upper West Side South" },
  { id: 240, name: "Van Cortlandt Park" },
  { id: 241, name: "Van Cortlandt Village" },
  { id: 242, name: "Van Nest/Morris Park" },
  { id: 243, name: "Washington Heights North" },
  { id: 244, name: "Washington Heights South" },
  { id: 245, name: "West Brighton" },
  { id: 246, name: "West Chelsea/Hudson Yards" },
  { id: 247, name: "West Concourse" },
  { id: 248, name: "West Farms/Bronx River" },
  { id: 249, name: "West Village" },
  { id: 250, name: "Westchester Village/Unionport" },
  { id: 251, name: "Westerleigh" },
  { id: 252, name: "Whitestone" },
  { id: 253, name: "Willets Point" },
  { id: 254, name: "Williamsbridge/Olinville" },
  { id: 255, name: "Williamsburg (North Side)" },
  { id: 256, name: "Williamsburg (South Side)" },
  { id: 257, name: "Windsor Terrace" },
  { id: 258, name: "Woodhaven" },
  { id: 259, name: "Woodlawn/Wakefield" },
  { id: 260, name: "Woodside" },
  { id: 261, name: "World Trade Center" },
  { id: 262, name: "Yorkville East" },
  { id: 263, name: "Yorkville West" },
];


const ZoneAutocomplete = ({
  label,
  value,
  onChange,          
  placeholder = 'Type zone name or ID',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const clearSelection = () => {
    setInputValue('');
    onChange('');   
    setIsOpen(false);
  };


  useEffect(() => {
    if (value === null || value === undefined || value === '') {
      setInputValue('');
      return;
    }
    const selected = TLC_ZONES.find(z => String(z.id) === String(value));
    if (selected) {
      setInputValue(`${selected.name} (ID: ${selected.id})`);
    }
  }, [value]);

  const handleInputChange = (e) => {
    const v = e.target.value;
    setInputValue(v);
    if (v.trim() === '') {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }

  };

  const handleSelectZone = (zone) => {
    setInputValue(`${zone.name} (ID: ${zone.id})`);
    setIsOpen(false);
    onChange(String(zone.id));
  };

  // 前缀匹配：n -> Newark Airport；c -> Central Park
  const filteredZones = TLC_ZONES.filter((z) => {
    const q = inputValue.trim().toLowerCase();
    if (!q) return true;

    const name = z.name.toLowerCase();
    const nameStartsWith = name.startsWith(q);
    const idStartsWith = String(z.id).startsWith(q);

    return nameStartsWith || idStartsWith;
  });

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
        />

        {/* 清除按钮在这里，能直接访问 inputValue 和 clearSelection */}
        <button
          type="button"
          onClick={clearSelection}
          className="absolute right-2 top-1/4 -translate-y-1/4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>

      {isOpen && filteredZones.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto text-sm">
          {filteredZones.map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => handleSelectZone(z)}
              className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex justify-between items-center"
            >
              <span>{z.name}</span>
              <span className="text-xs text-gray-400">ID: {z.id}</span>
            </button>
          ))}
        </div>
      )}

      {isOpen && filteredZones.length === 0 && inputValue.trim() !== '' && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg text-xs text-gray-500 px-3 py-2">
          No zones match “{inputValue}”
        </div>
      )}
    </div>
  );
};




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
          {/* Start Location */}
          <div>
            <ZoneAutocomplete
              label="Start Location"
              value={startLocation}
              onChange={(id) => setStartLocation(id)}
              placeholder="Type zone name or ID"
            />
          </div>


          {/* End Location */}
          {/* Start Location */}
          <div>
            <ZoneAutocomplete
              label="End Location"
              value={endLocation}
              onChange={(id) => setEndLocation(id)}
              placeholder="Type zone name or ID"
            />
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
              Input TLC Zone
            </label>
            <ZoneAutocomplete
              label="Select TLC Zone"
              value={selectedZoneId?.toString() ?? ''}
              onChange={(id) => setSelectedZoneId(Number(id))}
              placeholder="Type zone name or ID"
            />
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
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <LineChart
                data={chartData}
                margin={{ top: 30, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />

                {/* X */}
                <XAxis
                  dataKey="hour"
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  axisLine={{ stroke: '#D1D5DB' }}
                  tickLine={{ stroke: '#D1D5DB' }}
                  label={{
                    value: 'Hour of Day',
                    position: 'insideBottom',
                    offset: -10,
                    style: { fill: '#6B7280', fontSize: 13 }
                  }}
                />

                {/* Y */}
                <YAxis
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  axisLine={{ stroke: '#D1D5DB' }}
                  tickLine={{ stroke: '#D1D5DB' }}
                  label={{
                    value: 'Avg Trips',
                    angle: 0,
                    position: 'top',
                    dy: -10,     // 再往上推一点
                    style: { fill: '#6B7280', fontSize: 13 }
                  }}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    fontSize: 12
                  }}
                />

                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{
                    paddingBottom: 10,
                    fontSize: 13,
                    color: '#6B7280'
                  }}
                />

                {(viewMode === 'both' || viewMode === 'workday') && (
                  <Line
                    type="monotone"
                    dataKey="workday"
                    name="Workday"
                    stroke="#4F46E5"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                )}

                {(viewMode === 'both' || viewMode === 'weekend') && (
                  <Line
                    type="monotone"
                    dataKey="weekend"
                    name="Weekend"
                    stroke="#EC4899"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 5 }}
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

const RouteHotspotsPage = ({ hotspots, loading, onFetchRouteHotspots }) => {
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('19:00');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!startTime || !endTime) {
      setError('Please select both start and end time.');
      return;
    }

    if (startTime >= endTime) {
      setError('Start time must be earlier than end time.');
      return;
    }

    onFetchRouteHotspots({ startTime, endTime });
  };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold text-gray-800">Route Hotspots</h2>
      <p className="text-sm text-gray-600">
        Enter a time range to see the top 10 busiest routes.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`mt-2 w-full md:w-auto inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold text-white
            ${loading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}
          `}
        >
          <MapPin className="w-4 h-4 mr-2" />
          {loading ? 'Loading...' : 'Load Route Hotspots'}
        </button>
      </form>

      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        {loading && hotspots.length === 0 && (
          <div className="h-24 flex items-center justify-center text-gray-500">
            Fetching data...
          </div>
        )}

        {!loading && hotspots.length === 0 && !error && (
          <div className="h-24 flex items-center justify-center text-gray-500">
            No data yet. Please choose a time range and click &quot;Load Route Hotspots&quot;.
          </div>
        )}

        {!loading && hotspots.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead>
                <tr className="border-b bg-gray-100">
                  <th className="px-4 py-2">Rank</th>
                  <th className="px-4 py-2">Departure Zone</th>
                  <th className="px-4 py-2">Arrival Zone</th>
                </tr>
              </thead>
              <tbody>
                {hotspots.map((row, idx) => (
                  <tr
                    key={`${row.departure_zone}-${row.arrival_zone}-${idx}`}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="px-4 py-2 font-medium">{idx + 1}</td>
                    <td className="px-4 py-2">{row.departure_zone}</td>
                    <td className="px-4 py-2">{row.arrival_zone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};


// --- Main Application Component ---

const App = () => {
  const [currentPage, setCurrentPage] = useState('planner');
  const [loading, setLoading] = useState(false);
  const [tripEstimate, setTripEstimate] = useState(null);
  const [trafficData, setTrafficData] = useState(null);
  const [accessibilityData, setAccessibilityData] = useState(null);
  const [recommendedDestinations, setRecommendedDestinations] = useState(null); 
  const [routeHotspots, setRouteHotspots] = useState([]);

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
  
  const handleFetchRouteHotspots = useCallback(async ({ startTime, endTime }) => {
  setLoading(true);
  setRouteHotspots([]);
  try {
    const data = await fetchRouteHotspots({ startTime, endTime });
    setRouteHotspots(data);
  } catch (error) {
    console.error('Error fetching route hotspots:', error);
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

const fetchRouteHotspots = async ({ startTime, endTime }) => {
  console.log('Fetching route hotspots...', startTime, endTime);
  try {
    const response = await fetch(`${API_BASE_URL}/route-hotspots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ startTime, endTime }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorText}`);
    }

    const data = await response.json();
    return data; 
  } catch (error) {
    console.error('API Error in fetchRouteHotspots:', error);
    throw error;
  }
};

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
        return <RouteHotspotsPage hotspots={routeHotspots} loading={loading} onFetchRouteHotspots={handleFetchRouteHotspots}/>;
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
        <nav className="bg-indigo-800/80 backdrop-blur-md border-b border-indigo-700">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center gap-4 overflow-x-auto py-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={` flex items-center px-5 py-2 rounded-xl text-sm font-medium
                                  transition-all whitespace-nowrap shadow-md
                                  border backdrop-blur-md
                      ${isActive
                        ? 'bg-white/30 border-white/60 text-white shadow-lg'
                        : 'bg-white/10 border-white/20 text-indigo-100 hover:bg-white/20 hover:text-white'
                      }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
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
