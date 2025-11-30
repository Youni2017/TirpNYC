import ZoneMarkerMap from './ZoneMarkerMap';
import React, { useState, useEffect, useCallback } from 'react';
import { Plane, Compass, BarChart, MapPin, Bus, Car, Zap, Timer, Route, Clock } from 'lucide-react';
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

// small region for testing
const MAP_ZONES = [
  { id: 1, name: "Newark Airport", lat: 40.690244, lng: -74.174271 },
  { id: 2, name: "Jamaica Bay", lat: 40.612165, lng: -73.817644 },
  { id: 3, name: "Allerton/Pelham Gardens", lat: 40.864295, lng: -73.846510 },
  { id: 4, name: "Alphabet City", lat: 40.723853, lng: -73.975209 },
  { id: 5, name: "Arden Heights", lat: 40.556678, lng: -74.189803 },
  { id: 6, name: "Arrochar/Fort Wadsworth", lat: 40.601118, lng: -74.071747 },
  { id: 7, name: "Astoria", lat: 40.761434, lng: -73.919365 },
  { id: 8, name: "Astoria Park", lat: 40.778077, lng: -73.923396 },
  { id: 9, name: "Auburndale", lat: 40.750303, lng: -73.790189 },
  { id: 10, name: "Baisley Park", lat: 40.677931, lng: -73.790318 },
  { id: 11, name: "Bath Beach", lat: 40.602692, lng: -74.009023 },
  { id: 12, name: "Battery Park", lat: 40.702091, lng: -74.015477 },
  { id: 13, name: "Battery Park City", lat: 40.709419, lng: -74.017326 },
  { id: 14, name: "Bay Ridge", lat: 40.625196, lng: -74.029246 },
  { id: 15, name: "Bay Terrace/Fort Totten", lat: 40.790995, lng: -73.778606 },
  { id: 16, name: "Bayside", lat: 40.762812, lng: -73.767972 },
  { id: 17, name: "Bedford", lat: 40.692399, lng: -73.950316 },
  { id: 18, name: "Bedford Park", lat: 40.868877, lng: -73.889387 },
  { id: 19, name: "Bellerose", lat: 40.734682, lng: -73.728870 },
  { id: 20, name: "Belmont", lat: 40.858941, lng: -73.885366 },
  { id: 21, name: "Bensonhurst East", lat: 40.596886, lng: -73.990441 },
  { id: 22, name: "Bensonhurst West", lat: 40.608806, lng: -73.995799 },
  { id: 23, name: "Bloomfield/Emerson Hill", lat: 40.604627, lng: -74.190512 },
  { id: 24, name: "Bloomingdale", lat: 40.802947, lng: -73.967739 },
  { id: 25, name: "Boerum Hill", lat: 40.686588, lng: -73.985929 },
  { id: 26, name: "Borough Park", lat: 40.630738, lng: -73.987951 },
  { id: 27, name: "Breezy Point/Fort Tilden/Riis Beach", lat: 40.561299, lng: -73.890820 },
  { id: 28, name: "Briarwood/Jamaica Hills", lat: 40.712314, lng: -73.806984 },
  { id: 29, name: "Brighton Beach", lat: 40.579934, lng: -73.960507 },
  { id: 30, name: "Broad Channel", lat: 40.602882, lng: -73.822896 },
  { id: 31, name: "Bronx Park", lat: 40.860311, lng: -73.875124 },
  { id: 32, name: "Bronxdale", lat: 40.862116, lng: -73.865415 },
  { id: 33, name: "Brooklyn Heights", lat: 40.696964, lng: -73.995501 },
  { id: 34, name: "Brooklyn Navy Yard", lat: 40.702702, lng: -73.974176 },
  { id: 35, name: "Brownsville", lat: 40.663991, lng: -73.910329 },
  { id: 36, name: "Bushwick North", lat: 40.699260, lng: -73.916834 },
  { id: 37, name: "Bushwick South", lat: 40.695465, lng: -73.923919 },
  { id: 38, name: "Cambria Heights", lat: 40.695105, lng: -73.735530 },
  { id: 39, name: "Canarsie", lat: 40.642482, lng: -73.891706 },
  { id: 40, name: "Carroll Gardens", lat: 40.677900, lng: -73.996626 },
  { id: 41, name: "Central Harlem", lat: 40.803356, lng: -73.950573 },
  { id: 42, name: "Central Harlem North", lat: 40.826385, lng: -73.937075 },
  { id: 43, name: "Central Park", lat: 40.781507, lng: -73.966499 },
  { id: 44, name: "Charleston/Tottenville", lat: 40.529940, lng: -74.237350 },
  { id: 45, name: "Chinatown", lat: 40.711568, lng: -73.998049 },
  { id: 46, name: "City Island", lat: 40.850268, lng: -73.785851 },
  { id: 47, name: "Claremont/Bathgate", lat: 40.843214, lng: -73.900472 },
  { id: 48, name: "Clinton East", lat: 40.761398, lng: -73.990744 },
  { id: 49, name: "Clinton Hill", lat: 40.690255, lng: -73.961382 },
  { id: 50, name: "Clinton West", lat: 40.767838, lng: -73.997474 },
  { id: 51, name: "Co-Op City", lat: 40.875532, lng: -73.830370 },
  { id: 52, name: "Cobble Hill", lat: 40.686520, lng: -73.996240 },
  { id: 53, name: "College Point", lat: 40.783240, lng: -73.851061 },
  { id: 54, name: "Columbia Street", lat: 40.687492, lng: -74.003751 },
  { id: 55, name: "Coney Island", lat: 40.575391, lng: -73.987968 },
  { id: 56, name: "Corona", lat: 40.740792, lng: -73.856608 },
  { id: 58, name: "Country Club", lat: 40.843988, lng: -73.815215 },
  { id: 59, name: "Crotona Park", lat: 40.837955, lng: -73.895051 },
  { id: 60, name: "Crotona Park East", lat: 40.835268, lng: -73.883431 },
  { id: 61, name: "Crown Heights North", lat: 40.675124, lng: -73.935579 },
  { id: 62, name: "Crown Heights South", lat: 40.666217, lng: -73.946329 },
  { id: 63, name: "Cypress Hills", lat: 40.680952, lng: -73.884573 },
  { id: 64, name: "Douglaston", lat: 40.762636, lng: -73.748633 },
  { id: 65, name: "Downtown Brooklyn/MetroTech", lat: 40.695871, lng: -73.985238 },
  { id: 66, name: "DUMBO/Vinegar Hill", lat: 40.703133, lng: -73.987687 },
  { id: 67, name: "Dyker Heights", lat: 40.617434, lng: -74.015043 },
  { id: 68, name: "East Chelsea", lat: 40.748251, lng: -74.000554 },
  { id: 69, name: "East Concourse/Concourse Village", lat: 40.830583, lng: -73.915132 },
  { id: 70, name: "East Elmhurst", lat: 40.763274, lng: -73.865871 },
  { id: 71, name: "East Flatbush/Farragut", lat: 40.642760, lng: -73.935957 },
  { id: 72, name: "East Flatbush/Remsen Village", lat: 40.652594, lng: -73.921482 },
  { id: 73, name: "East Flushing", lat: 40.752945, lng: -73.807169 },
  { id: 74, name: "East Harlem North", lat: 40.804589, lng: -73.934012 },
  { id: 75, name: "East Harlem South", lat: 40.788256, lng: -73.941879 },
  { id: 76, name: "East New York", lat: 40.654821, lng: -73.875537 },
  { id: 77, name: "East New York/Pennsylvania Avenue", lat: 40.667111, lng: -73.894884 },
  { id: 78, name: "East Tremont", lat: 40.843783, lng: -73.881202 },
  { id: 79, name: "East Village", lat: 40.726759, lng: -73.986487 },
  { id: 80, name: "East Williamsburg", lat: 40.715051, lng: -73.930822 },
  { id: 81, name: "Eastchester", lat: 40.881657, lng: -73.831025 },
  { id: 82, name: "Elmhurst", lat: 40.737206, lng: -73.879520 },
  { id: 83, name: "Elmhurst/Maspeth", lat: 40.737892, lng: -73.892881 },
  { id: 84, name: "Eltingville/Annadale/Prince's Bay", lat: 40.520526, lng: -74.192551 },
  { id: 85, name: "Erasmus", lat: 40.645797, lng: -73.951888 },
  { id: 86, name: "Far Rockaway", lat: 40.602718, lng: -73.757557 },
  { id: 87, name: "Financial District North", lat: 40.704632, lng: -74.005550 },
  { id: 88, name: "Financial District South", lat: 40.701273, lng: -74.011811 },
  { id: 89, name: "Flatbush/Ditmas Park", lat: 40.636982, lng: -73.962099 },
  { id: 90, name: "Flatiron", lat: 40.742189, lng: -73.996789 },
  { id: 91, name: "Flatlands", lat: 40.628121, lng: -73.929379 },
  { id: 92, name: "Flushing", lat: 40.760281, lng: -73.827662 },
  { id: 93, name: "Flushing Meadows-Corona Park", lat: 40.747520, lng: -73.845893 },
  { id: 94, name: "Fordham South", lat: 40.858689, lng: -73.898926 },
  { id: 95, name: "Forest Hills", lat: 40.721279, lng: -73.844788 },
  { id: 96, name: "Forest Park/Highland Park", lat: 40.699807, lng: -73.864212 },
  { id: 97, name: "Fort Greene", lat: 40.691577, lng: -73.977612 },
  { id: 98, name: "Fresh Meadows", lat: 40.731966, lng: -73.774901 },
  { id: 99, name: "Freshkills Park", lat: 40.568229, lng: -74.203182 },
  { id: 100, name: "Garment District", lat: 40.753386, lng: -73.988716 },
  { id: 101, name: "Glen Oaks", lat: 40.746497, lng: -73.715607 },
  { id: 102, name: "Glendale", lat: 40.701803, lng: -73.877066 },
  { id: 103, name: "Governor's Island/Ellis Island/Liberty Island", lat: 40.690331, lng: -74.045772 },
  { id: 106, name: "Gowanus", lat: 40.673823, lng: -73.991874 },
  { id: 107, name: "Gramercy", lat: 40.736706, lng: -73.984269 },
  { id: 108, name: "Gravesend", lat: 40.586563, lng: -73.988621 },
  { id: 109, name: "Great Kills", lat: 40.543051, lng: -74.143517 },
  { id: 110, name: "Great Kills Park", lat: 40.540366, lng: -74.129981 },
  { id: 111, name: "Green-Wood Cemetery", lat: 40.653079, lng: -73.990663 },
  { id: 112, name: "Greenpoint", lat: 40.734392, lng: -73.950516 },
  { id: 113, name: "Greenwich Village North", lat: 40.731907, lng: -73.994202 },
  { id: 114, name: "Greenwich Village South", lat: 40.727635, lng: -73.996964 },
  { id: 115, name: "Grymes Hill/Clifton", lat: 40.618922, lng: -74.084474 },
  { id: 116, name: "Hamilton Heights", lat: 40.827920, lng: -73.950727 },
  { id: 117, name: "Hammels/Arverne", lat: 40.596829, lng: -73.791317 },
  { id: 118, name: "Heartland Village/Todt Hill", lat: 40.588551, lng: -74.128432 },
  { id: 119, name: "Highbridge", lat: 40.837938, lng: -73.926264 },
  { id: 120, name: "Highbridge Park", lat: 40.844861, lng: -73.931324 },
  { id: 121, name: "Hillcrest/Pomonok", lat: 40.728358, lng: -73.805360 },
  { id: 122, name: "Hollis", lat: 40.710434, lng: -73.764021 },
  { id: 123, name: "Homecrest", lat: 40.598265, lng: -73.964730 },
  { id: 124, name: "Howard Beach", lat: 40.655356, lng: -73.847374 },
  { id: 125, name: "Hudson Sq", lat: 40.725760, lng: -74.008916 },
  { id: 126, name: "Hunts Point", lat: 40.807364, lng: -73.889129 },
  { id: 127, name: "Inwood", lat: 40.862595, lng: -73.917485 },
  { id: 128, name: "Inwood Hill Park", lat: 40.874656, lng: -73.921380 },
  { id: 129, name: "Jackson Heights", lat: 40.759475, lng: -73.887182 },
  { id: 130, name: "Jamaica", lat: 40.706139, lng: -73.790528 },
  { id: 131, name: "Jamaica Estates", lat: 40.719546, lng: -73.777825 },
  { id: 132, name: "JFK Airport", lat: 40.639071, lng: -73.783741 },
  { id: 133, name: "Kensington", lat: 40.640734, lng: -73.976510 },
  { id: 134, name: "Kew Gardens", lat: 40.708555, lng: -73.831620 },
  { id: 135, name: "Kew Gardens Hills", lat: 40.727876, lng: -73.820876 },
  { id: 136, name: "Kingsbridge Heights", lat: 40.865124, lng: -73.907761 },
  { id: 137, name: "Kips Bay", lat: 40.737885, lng: -73.973821 },
  { id: 138, name: "LaGuardia Airport", lat: 40.774628, lng: -73.872821 },
  { id: 139, name: "Laurelton", lat: 40.676719, lng: -73.745068 },
  { id: 140, name: "Lenox Hill East", lat: 40.763907, lng: -73.955720 },
  { id: 141, name: "Lenox Hill West", lat: 40.765620, lng: -73.960113 },
  { id: 142, name: "Lincoln Square East", lat: 40.771314, lng: -73.982296 },
  { id: 143, name: "Lincoln Square West", lat: 40.776394, lng: -73.990065 },
  { id: 144, name: "Little Italy/NoLiTa", lat: 40.720970, lng: -73.996675 },
  { id: 145, name: "Long Island City/Hunters Point", lat: 40.742516, lng: -73.954881 },
  { id: 146, name: "Long Island City/Queens Plaza", lat: 40.753120, lng: -73.935791 },
  { id: 147, name: "Longwood", lat: 40.819743, lng: -73.898566 },
  { id: 148, name: "Lower East Side", lat: 40.718267, lng: -73.991218 },
  { id: 149, name: "Madison", lat: 40.605565, lng: -73.946444 },
  { id: 150, name: "Manhattan Beach", lat: 40.581247, lng: -73.941230 },
  { id: 151, name: "Manhattan Valley", lat: 40.799377, lng: -73.971010 },
  { id: 152, name: "Manhattanville", lat: 40.819640, lng: -73.956132 },
  { id: 153, name: "Marble Hill", lat: 40.874569, lng: -73.911817 },
  { id: 154, name: "Marine Park/Floyd Bennett Field", lat: 40.594565, lng: -73.914743 },
  { id: 155, name: "Marine Park/Mill Basin", lat: 40.613249, lng: -73.901998 },
  { id: 156, name: "Mariners Harbor", lat: 40.640789, lng: -74.173924 },
  { id: 157, name: "Maspeth", lat: 40.723504, lng: -73.903918 },
  { id: 158, name: "Meatpacking/West Village West", lat: 40.736896, lng: -74.010486 },
  { id: 159, name: "Melrose South", lat: 40.819891, lng: -73.913451 },
  { id: 160, name: "Middle Village", lat: 40.719346, lng: -73.882976 },
  { id: 161, name: "Midtown Center", lat: 40.757753, lng: -73.977350 },
  { id: 162, name: "Midtown East", lat: 40.756517, lng: -73.972625 },
  { id: 163, name: "Midtown North", lat: 40.765561, lng: -73.978757 },
  { id: 164, name: "Midtown South", lat: 40.748532, lng: -73.984748 },
  { id: 165, name: "Midwood", lat: 40.621716, lng: -73.958221 },
  { id: 166, name: "Morningside Heights", lat: 40.810671, lng: -73.963613 },
  { id: 167, name: "Morrisania/Melrose", lat: 40.825669, lng: -73.905021 },
  { id: 168, name: "Mott Haven/Port Morris", lat: 40.804260, lng: -73.912070 },
  { id: 169, name: "Mount Hope", lat: 40.848149, lng: -73.906359 },
  { id: 170, name: "Murray Hill", lat: 40.747473, lng: -73.978303 },
  { id: 171, name: "Murray Hill-Queens", lat: 40.768051, lng: -73.807583 },
  { id: 172, name: "New Dorp/Midland Beach", lat: 40.568898, lng: -74.104626 },
  { id: 173, name: "North Corona", lat: 40.754180, lng: -73.861459 },
  { id: 174, name: "Norwood", lat: 40.878665, lng: -73.882016 },
  { id: 175, name: "Oakland Gardens", lat: 40.743646, lng: -73.755258 },
  { id: 176, name: "Oakwood", lat: 40.564555, lng: -74.121358 },
  { id: 177, name: "Ocean Hill", lat: 40.677068, lng: -73.912029 },
  { id: 178, name: "Ocean Parkway South", lat: 40.617847, lng: -73.971504 },
  { id: 179, name: "Old Astoria", lat: 40.772395, lng: -73.930123 },
  { id: 180, name: "Ozone Park", lat: 40.676308, lng: -73.848528 },
  { id: 181, name: "Park Slope", lat: 40.670746, lng: -73.980671 },
  { id: 182, name: "Parkchester", lat: 40.837095, lng: -73.858634 },
  { id: 183, name: "Pelham Bay", lat: 40.849369, lng: -73.831104 },
  { id: 184, name: "Pelham Bay Park", lat: 40.862239, lng: -73.796550 },
  { id: 185, name: "Pelham Parkway", lat: 40.854370, lng: -73.852955 },
  { id: 186, name: "Penn Station/Madison Sq West", lat: 40.748585, lng: -73.991999 },
  { id: 187, name: "Port Richmond", lat: 40.632707, lng: -74.136130 },
  { id: 188, name: "Prospect-Lefferts Gardens", lat: 40.658743, lng: -73.948091 },
  { id: 189, name: "Prospect Heights", lat: 40.676709, lng: -73.968131 },
  { id: 190, name: "Prospect Park", lat: 40.661061, lng: -73.972570 },
  { id: 191, name: "Queens Village", lat: 40.716930, lng: -73.742429 },
  { id: 192, name: "Queensboro Hill", lat: 40.744062, lng: -73.814652 },
  { id: 193, name: "Queensbridge/Ravenswood", lat: 40.762743, lng: -73.939093 },
  { id: 194, name: "Randalls Island", lat: 40.791829, lng: -73.925739 },
  { id: 195, name: "Red Hook", lat: 40.674447, lng: -74.013032 },
  { id: 196, name: "Rego Park", lat: 40.726171, lng: -73.863958 },
  { id: 197, name: "Richmond Hill", lat: 40.695486, lng: -73.829096 },
  { id: 198, name: "Ridgewood", lat: 40.707360, lng: -73.904168 },
  { id: 199, name: "Rikers Island", lat: 40.793489, lng: -73.880683 },
  { id: 200, name: "Riverdale/North Riverdale/Fieldston", lat: 40.898949, lng: -73.908185 },
  { id: 201, name: "Rockaway Park", lat: 40.578754, lng: -73.838247 },
  { id: 202, name: "Roosevelt Island", lat: 40.761763, lng: -73.950211 },
  { id: 203, name: "Rosedale", lat: 40.644091, lng: -73.744925 },
  { id: 204, name: "Rossville/Woodrow", lat: 40.539924, lng: -74.208846 },
  { id: 205, name: "Saint Albans", lat: 40.692876, lng: -73.764272 },
  { id: 206, name: "Saint George/New Brighton", lat: 40.640559, lng: -74.099941 },
  { id: 207, name: "Saint Michaels Cemetery/Woodside", lat: 40.763765, lng: -73.897653 },
  { id: 208, name: "Schuylerville/Edgewater Park", lat: 40.820160, lng: -73.814851 },
  { id: 209, name: "Seaport", lat: 40.708273, lng: -74.002267 },
  { id: 210, name: "Sheepshead Bay", lat: 40.590004, lng: -73.930137 },
  { id: 211, name: "SoHo", lat: 40.723511, lng: -74.002191 },
  { id: 212, name: "Soundview/Bruckner", lat: 40.827967, lng: -73.868166 },
  { id: 213, name: "Soundview/Castle Hill", lat: 40.815351, lng: -73.850366 },
  { id: 214, name: "South Beach/Dongan Hills", lat: 40.583925, lng: -74.079294 },
  { id: 215, name: "South Jamaica", lat: 40.694743, lng: -73.792073 },
  { id: 216, name: "South Ozone Park", lat: 40.676477, lng: -73.817131 },
  { id: 217, name: "South Williamsburg", lat: 40.704057, lng: -73.958038 },
  { id: 218, name: "Springfield Gardens North", lat: 40.672931, lng: -73.772761 },
  { id: 219, name: "Springfield Gardens South", lat: 40.661963, lng: -73.770403 },
  { id: 220, name: "Spuyten Duyvil/Kingsbridge", lat: 40.882296, lng: -73.912050 },
  { id: 221, name: "Stapleton", lat: 40.620458, lng: -74.072192 },
  { id: 222, name: "Starrett City", lat: 40.644776, lng: -73.884129 },
  { id: 223, name: "Steinway", lat: 40.782079, lng: -73.895700 },
  { id: 224, name: "Stuy Town/Peter Cooper Village", lat: 40.731622, lng: -73.974325 },
  { id: 225, name: "Stuyvesant Heights", lat: 40.688738, lng: -73.930469 },
  { id: 226, name: "Sunnyside", lat: 40.727000, lng: -73.925836 },
  { id: 227, name: "Sunset Park East", lat: 40.639752, lng: -74.006864 },
  { id: 228, name: "Sunset Park West", lat: 40.655479, lng: -74.011949 },
  { id: 229, name: "Sutton Place/Turtle Bay North", lat: 40.755784, lng: -73.964284 },
  { id: 230, name: "Times Sq/Theatre District", lat: 40.759607, lng: -73.984313 },
  { id: 231, name: "TriBeCa/Civic Center", lat: 40.718848, lng: -74.009880 },
  { id: 232, name: "Two Bridges/Seward Park", lat: 40.713594, lng: -73.982954 },
  { id: 233, name: "UN/Turtle Bay South", lat: 40.746299, lng: -73.969564 },
  { id: 234, name: "Union Sq", lat: 40.739310, lng: -73.990131 },
  { id: 235, name: "University Heights/Morris Heights", lat: 40.854132, lng: -73.917159 },
  { id: 236, name: "Upper East Side North", lat: 40.780263, lng: -73.957138 },
  { id: 237, name: "Upper East Side South", lat: 40.768456, lng: -73.965666 },
  { id: 238, name: "Upper West Side North", lat: 40.792388, lng: -73.974066 },
  { id: 239, name: "Upper West Side South", lat: 40.784791, lng: -73.983170 },
  { id: 240, name: "Van Cortlandt Park", lat: 40.890801, lng: -73.879084 },
  { id: 241, name: "Van Cortlandt Village", lat: 40.875343, lng: -73.895972 },
  { id: 242, name: "Van Nest/Morris Park", lat: 40.848515, lng: -73.849231 },
  { id: 243, name: "Washington Heights North", lat: 40.857373, lng: -73.937520 },
  { id: 244, name: "Washington Heights South", lat: 40.842850, lng: -73.943256 },
  { id: 245, name: "West Brighton", lat: 40.632347, lng: -74.103797 },
  { id: 246, name: "West Chelsea/Hudson Yards", lat: 40.750105, lng: -74.008111 },
  { id: 247, name: "West Concourse", lat: 40.830234, lng: -73.924077 },
  { id: 248, name: "West Farms/Bronx River", lat: 40.834862, lng: -73.873662 },
  { id: 249, name: "West Village", lat: 40.733811, lng: -74.003081 },
  { id: 250, name: "Westchester Village/Unionport", lat: 40.834345, lng: -73.844962 },
  { id: 251, name: "Westerleigh", lat: 40.616504, lng: -74.126074 },
  { id: 252, name: "Whitestone", lat: 40.795098, lng: -73.814988 },
  { id: 253, name: "Willets Point", lat: 40.762045, lng: -73.842202 },
  { id: 254, name: "Williamsbridge/Olinville", lat: 40.882393, lng: -73.859056 },
  { id: 255, name: "Williamsburg (North Side)", lat: 40.719652, lng: -73.961672 },
  { id: 256, name: "Williamsburg (South Side)", lat: 40.710736, lng: -73.962940 },
  { id: 257, name: "Windsor Terrace", lat: 40.656034, lng: -73.978426 },
  { id: 258, name: "Woodhaven", lat: 40.687641, lng: -73.854732 },
  { id: 259, name: "Woodlawn/Wakefield", lat: 40.900108, lng: -73.853635 },
  { id: 260, name: "Woodside", lat: 40.746439, lng: -73.905908 },
  { id: 261, name: "World Trade Center", lat: 40.707456, lng: -74.013983 },
  { id: 262, name: "Yorkville East", lat: 40.778363, lng: -73.943489 },
  { id: 263, name: "Yorkville West", lat: 40.779020, lng: -73.950199 }
];

const ZoneAutocomplete = ({
  label,
  value,
  onChange,
  placeholder = 'Type zone name or ID',
  onFocusField,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const clearSelection = () => {
    setInputValue('');
    onChange('');
    setIsOpen(false);
  };

  useEffect(() => {
    if (!value) {
      setInputValue('');
      return;
    }
    const selected = TLC_ZONES.find(z => String(z.id) === String(value));
    if (selected) {
      setInputValue(`${selected.name} (ID: ${selected.id})`);
    }
  }, [value]);

  useEffect(() => {
    if (value) {
      setIsOpen(false);
    }
  }, [value]);

  const handleInputChange = (e) => {
    const v = e.target.value;
    setInputValue(v);
    setIsOpen(v.trim() !== '');
  };

  const handleSelectZone = (zone) => {
    setInputValue(`${zone.name} (ID: ${zone.id})`);
    setIsOpen(false);
    onChange(String(zone.id));
  };

  const filteredZones = TLC_ZONES.filter((z) => {
    const q = inputValue.trim().toLowerCase();
    if (!q) return true;
    return (
      z.name.toLowerCase().startsWith(q) ||
      String(z.id).startsWith(q)
    );
  });

  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          className="
            zone-input 
            w-full bg-white border border-gray-300 
            rounded-xl px-4 pr-12 text-base
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            setIsOpen(true);
            if (onFocusField) onFocusField();   
          }}
        />

        {/* clear button */}
        <button
          type="button"
          onClick={clearSelection}
          className="
            absolute right-3 top-1/2 -translate-y-1/2
            h-8 w-8 flex items-center justify-center
            rounded-lg bg-white shadow-sm border border-gray-200
            hover:bg-gray-50 text-gray-500 text-lg
          "
        >
          ×
        </button>
      </div>

      {isOpen && filteredZones.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto text-sm">
          {filteredZones.map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => handleSelectZone(z)}
              className="w-full text-left px-4 py-2 hover:bg-blue-50 flex justify-between"
            >
              <span>{z.name}</span>
              <span className="text-xs text-gray-400">ID: {z.id}</span>
            </button>
          ))}
        </div>
      )}

      {isOpen && filteredZones.length === 0 && inputValue.trim() !== '' && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg text-xs text-gray-500 px-4 py-3">
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
const TripPlannerPage = ({
  estimate,
  loading,
  handleEstimateTrip,
  recommendedDestinations,
  handleFetchRecommendedDestinations
}) => {
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('23:59');
  const [serviceProvider, setServiceProvider] = useState('Uber');
  const [tripType, setTripType] = useState('taxi'); // 'taxi' or 'fhv'
  const [error, setError] = useState('');

  const [activeMapTarget, setActiveMapTarget] = useState('start'); // 'start' | 'end'

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
      await handleEstimateTrip(params);

      if (handleFetchRecommendedDestinations) {
        handleFetchRecommendedDestinations({
          departureZoneId: parseInt(startLocation),
          startTime,
          endTime
        }).catch(err => {
          console.warn('Recommended destinations failed (this is OK):', err);
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch trip estimate.');
    }
  };

  const handleSelectZoneFromMap = (zoneId) => {
    const idStr = zoneId.toString();
    if (activeMapTarget === 'start') {
      setStartLocation(idStr);
    } else {
      setEndLocation(idStr);
    }
  };

  const getZoneLabel = (id) => {
    if (!id) return '';
    const z = TLC_ZONES.find(z => z.id === Number(id));
    return z ? `${z.name} (ID: ${z.id})` : '';
  };

  return (
    <div className="space-y-6 p-4 w-full">
      <h2 className="text-2xl font-bold text-gray-800">Plan Your Perfect NYC Day!</h2>
      <p className="text-sm text-gray-600">
        Enter zones and time to compare providers (Cost, Time, Wait).
      </p>

      {/* table + map */}
      <div className="bg-gray-100 p-6 rounded-xl shadow border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:space-x-6 space-y-6 lg:space-y-0">
          {/* left: for input */}
          <div className="lg:w-1/2 w-full flex flex-col space-y-4">
            {/* Start Location */}
            <ZoneAutocomplete
              label="Start Location"
              value={startLocation}
              onChange={(id) => setStartLocation(id)}
              placeholder="Type zone name or ID"
              onFocusField={() => setActiveMapTarget('start')}
            />

            {/* End Location */}
            <ZoneAutocomplete
              label="End Location"
              value={endLocation}
              onChange={(id) => setEndLocation(id)}
              placeholder="Type zone name or ID"
              onFocusField={() => setActiveMapTarget('end')}
            />

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
              <div className="inline-flex rounded-xl border border-gray-200 bg-white text-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setTripType('taxi')}
                  className={`px-3 py-1 ${
                    tripType === 'taxi'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Green/Yellow Taxi
                </button>
                <button
                  type="button"
                  onClick={() => setTripType('fhv')}
                  className={`px-3 py-1 ${
                    tripType === 'fhv'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  FHV
                </button>
              </div>
            </div>

            {/* Service Provider (only for FHV) */}
            {tripType === 'fhv' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Provider
                </label>
                <select
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={serviceProvider}
                  onChange={(e) => setServiceProvider(e.target.value)}
                >
                  <option value="">Select service provider</option>
                  <option value="Uber">Uber</option>
                  <option value="Lyft">Lyft</option>
                </select>
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
                <>
                  <LoadingSpinner /> Loading...
                </>
              ) : (
                <>
                  <Car className="h-5 w-5 mr-2" /> GET PREDICTIVE ESTIMATES
                </>
              )}
            </button>
          </div>

          {/* right for map */}
          <div className="lg:w-1/2 w-full flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-gray-700">Select zones on map</p>
                <p className="text-xs text-gray-500">
                  Click a marker to set the current {activeMapTarget === 'start' ? 'start' : 'end'} location.
                </p>
              </div>
              <div className="inline-flex rounded-xl border border-gray-200 bg-white text-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setActiveMapTarget('start')}
                  className={`px-3 py-1 ${
                    activeMapTarget === 'start'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Edit Start
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMapTarget('end')}
                  className={`px-3 py-1 ${
                    activeMapTarget === 'end'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Edit End
          </button>
        </div>
      </div>

            <div className="text-xs text-gray-500 mb-2">
              <div>Start: {getZoneLabel(startLocation) || 'Not selected'}</div>
              <div>End:&nbsp;&nbsp;&nbsp;{getZoneLabel(endLocation) || 'Not selected'}</div>
            </div>

            <div className="flex-1 min-h-[260px] rounded-lg overflow-hidden border border-gray-200 bg-white">
              <ZoneMarkerMap
                zones={MAP_ZONES}
                startZoneId={startLocation ? Number(startLocation) : null}
                endZoneId={endLocation ? Number(endLocation) : null}
                activeTarget={activeMapTarget}
                onSelectZone={handleSelectZoneFromMap}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
      <div className="mt-4">
          <div className="bg-indigo-50 p-4 rounded-lg shadow border border-indigo-200 text-center">
            <div className="flex items-center justify-center">
              <LoadingSpinner color="text-indigo-600" />
              <span className="text-indigo-700">Loading trip estimate...</span>
        </div>
      </div>
        </div>
      )}

      {/* Results */}
      {!loading && estimate && (
        <div className="mt-4 space-y-4">
          {/* Selected Provider Results */}
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              Selected Provider Results
            </h3>
            <div className="bg-green-50 p-4 rounded-lg shadow border border-green-200">
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-semibold">Average Cost: </span>
                  <span className="text-lg font-bold text-green-700">
                    ${estimate.avg_total_amount || 'N/A'}
                  </span>
                </div>

                {estimate.min_total_amount !== undefined &&
                  estimate.min_total_amount !== null && (
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold">Min Cost: </span>$
                      {estimate.min_total_amount}
                    </div>
                  )}

                {estimate.max_total_amount !== undefined &&
                  estimate.max_total_amount !== null && (
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold">Max Cost: </span>$
                      {estimate.max_total_amount}
                    </div>
                  )}

                {tripType === 'fhv' &&
                  estimate.avg_waiting_time !== undefined &&
                  estimate.avg_waiting_time !== null && (
                    <div className="text-sm mt-2 pt-2 border-t border-gray-200">
                      <span className="font-semibold">Average Waiting Time: </span>
                      <span className="text-lg font-bold text-blue-700">
                        {estimate.avg_waiting_time} minutes
                      </span>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* All Providers Comparison */}
          {estimate.overall_avg_price !== undefined &&
            estimate.overall_avg_price !== null && (
              <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  All Providers Comparison
                </h3>
                <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-200">
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-semibold">Overall Average Cost: </span>
                      <span className="text-lg font-bold text-blue-700">
                        ${estimate.overall_avg_price}
                      </span>
                    </div>

                    {estimate.overall_min_price !== undefined &&
                      estimate.overall_min_price !== null && (
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold">Overall Min Cost: </span>$
                          {estimate.overall_min_price}
                        </div>
                      )}

                    {estimate.overall_max_price !== undefined &&
                      estimate.overall_max_price !== null && (
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold">Overall Max Cost: </span>$
                          {estimate.overall_max_price}
                        </div>
                      )}

                    {estimate.recommended_vehicle_type && (
                      <div className="text-sm mt-2 pt-2 border-t border-gray-200">
                        <span className="font-semibold">Recommended Provider: </span>
                        <span className="text-lg font-bold text-purple-700">
                          {estimate.recommended_vehicle_type}
                        </span>
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
            <Route className="w-5 h-5 mr-2" /> Top Destinations from{' '}
            {TLC_ZONES.find(z => z.id === parseInt(startLocation))?.name ||
              `Zone ${startLocation}`}
          </h3>
          {loading && (
            <div className="text-gray-500 text-sm p-4 text-center border rounded-lg bg-gray-50">
              Loading destinations...
            </div>
          )}
          {!loading &&
            recommendedDestinations &&
            recommendedDestinations.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {recommendedDestinations.map((rec, index) => (
                  <div
                    key={index}
                    className="bg-white p-3 rounded-lg shadow border border-indigo-300 text-center cursor-pointer hover:bg-indigo-100 transition"
                    onClick={() => setEndLocation(rec.zone_id.toString())}
                  >
                    <p className="text-lg font-bold text-indigo-600">
                      {rec.arrival_zone}
                    </p>
                  </div>
                ))}
              </div>
            )}
          {!loading &&
            (!recommendedDestinations ||
              recommendedDestinations.length === 0) && (
              <div className="text-gray-500 text-sm p-4 text-center border rounded-lg bg-gray-50">
                No high-volume destinations found for this zone/time.
              </div>
            )}
        </div>
      )}
    </div>
  );
};


// Youni's Part
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

  const handleSelectZoneFromMap = async (zoneId) => {
    setSelectedZoneId(zoneId);
    setError('');
    try {
      await handleFetchTraffic({ zoneId });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load traffic data');
    }
  };

  const chartData = (trafficData || []).map((row) => ({
    hour: row.hour_of_day,
    workday: Number(row.avg_workday_trips ?? 0),
    weekend: Number(row.avg_weekend_trips ?? 0),
  }));

  const getZoneLabel = (zoneId) => {
    const z = TLC_ZONES.find((zone) => zone.id === Number(zoneId));
    return z ? `${z.name} (ID: ${z.id})` : '';
  };

  return (
    <div className="space-y-6 p-2">
      <h2 className="text-2xl font-bold text-gray-800">NYC Traffic Pulse</h2>
      <p className="text-sm text-gray-600">
        View average hourly inflow/outflow (in &amp; out combined) for a given zone, comparing workdays vs weekends.
      </p>

      <div className="bg-gray-100 p-4 rounded-xl shadow border border-gray-200">
        <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0 items-stretch">
          <div className="md:w-1/3 w-full flex flex-col">
            <div>
              <div className="text-base font-semibold text-gray-900">
                Input TLC Zone
              </div>
              <div className="text-xs text-gray-500 mb-4">
                Choose how you want to select a zone.
              </div>

              <label className="block text-sm font-medium text-gray-800 mb-1">
                Choose your destination zone
            </label>

              <div className="zone-input">
                <ZoneAutocomplete
                  label=""
                  value={selectedZoneId?.toString() ?? ''}
                  onChange={(id) => setSelectedZoneId(Number(id))}
                  placeholder="Type zone name or ID, or pick from map"
                />
              </div>

              <p className="mt-3 text-xs leading-relaxed text-gray-600">
                You can either type the zone manually or{' '}
                <span className="text-blue-600 font-semibold">
                  use the map on the right
                </span>
                ; this textbox will update automatically.
              </p>
          </div>

          <button
            onClick={handleLoadClick}
            disabled={loading}
              className={`mt-5 w-full inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold
                ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'}
                text-white shadow-sm transition-colors duration-150`}
          >
            <BarChart className="h-5 w-5 mr-2" />
            {loading ? 'Loading...' : 'LOAD TREND DATA'}
          </button>

        {error && (
          <p className="mt-2 text-sm text-red-600">
            Error: {error}
          </p>
        )}
      </div>

          <div className="md:w-2/3 w-full flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Select zone on map
              </span>
              <span className="text-xs text-gray-400">
                Current: {getZoneLabel(selectedZoneId) || 'None'}
              </span>
            </div>

            <div className="flex-1 min-h-[260px] rounded-lg overflow-hidden border border-gray-200 bg-white">
              <ZoneMarkerMap
                zones={MAP_ZONES}
                selectedZoneId={selectedZoneId}
                onSelectZone={handleSelectZoneFromMap}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow border border-purple-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 space-y-2 md:space-y-0">
          <h3 className="text-xl font-semibold text-gray-700">
            Hourly Average Traffic (Zone {selectedZoneId})
          </h3>

          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 overflow-hidden text-xs">
            <button
              className={`px-3 py-1 ${
                viewMode === 'both'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setViewMode('both')}
            >
              Both
            </button>
            <button
              className={`px-3 py-1 ${
                viewMode === 'workday'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setViewMode('workday')}
            >
              Workday
            </button>
            <button
              className={`px-3 py-1 ${
                viewMode === 'weekend'
                  ? 'bg-indigo-600 text-white'
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
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />

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

                <YAxis
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  axisLine={{ stroke: '#D1D5DB' }}
                  tickLine={{ stroke: '#D1D5DB' }}
                  label={{
                    value: 'Avg Trips',
                    angle: 0,
                    position: 'top',
                    dy: -10,
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
                    stroke="#2563EB"
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
            No data yet. Select a zone and click{' '}
            <span className="font-semibold">LOAD TREND DATA</span>.
          </div>
        )}

        <p className="mt-2 text-xs text-gray-500">
          Each value is the average number of trips (in + out) for that hour, aggregated across the date range
          and split into workdays vs weekends.
        </p>
      </div>
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
    <div className="space-y-8 p-4 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">Barrier-Free NYC</h2>
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
              <p className="text-xs text-gray-500 mt-2">Total WAV Requests Last Month: {item.totalRequests.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-indigo-700 flex items-center"><Timer className="w-5 h-5 mr-2"/> Wait Time Disparity (Seconds)</h3>
        <p className="text-sm text-gray-600">Compares the average wait time for fulfilled WAV requests versus standard non-WAV requests.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

const TIME_SLOT_OPTIONS = [
    { key: 'morning', name: 'Morning Peak (7 AM - 10 AM)' },
    { key: 'noon', name: 'Midday / Lunch (10 AM - 2 PM)' },
    { key: 'afternoon', name: 'Afternoon (2 PM - 5 PM)' },
    { key: 'evening', name: 'Evening Peak (5 PM - 8 PM)' },
    { key: 'night', name: 'Late Evening (8 PM - 12 AM)' },
];

const RouteHotspotsPage = ({ hotspots, loading, onFetchRouteHotspots }) => {
  const [timeSlot, setTimeSlot] = useState(TIME_SLOT_OPTIONS[4].key);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!timeSlot) {
      setError('Please select a time slot.');
      return;
    }
    onFetchRouteHotspots({ timeSlot });
  };

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">City Pressure Points</h2>
      <p className="text-md text-gray-600">
        Select a 24-hour time slot to instantly view the top 10 busiest taxi and ride-share routes during that period.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-indigo-50 p-6 rounded-xl border border-indigo-200 shadow-md space-y-4"
      >
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-bold text-indigo-700 mb-2">
              Select Time Slot
            </label>
            {/* 2. Replace time inputs with a single select dropdown */}
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full px-4 py-3 border border-indigo-300 rounded-lg text-base appearance-none focus:outline-none focus:ring-4 focus:ring-indigo-200 shadow-sm transition-all"
            >
              {/* Optional: Add a placeholder option */}
              <option value="" disabled>-- Select a Time Slot --</option>
              {TIME_SLOT_OPTIONS.map(slot => (
                <option key={slot.key} value={slot.key}>
                  {slot.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-100 p-2 rounded-lg mt-2 font-medium">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`mt-4 w-full inline-flex items-center justify-center px-6 py-3 rounded-xl text-lg font-bold text-white transition-all transform hover:scale-[1.01]
            ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-xl'}
          `}
        >
          <Clock className="w-5 h-5 mr-2" />
          {loading ? 'Fetching Hotspots...' : 'View Busiest Routes'}
        </button>
      </form>

      <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100">
        {loading && hotspots.length === 0 && (
          <div className="h-48 flex flex-col items-center justify-center text-indigo-500 animate-pulse">
            <MapPin className="w-8 h-8 mb-3" />
            <p className="text-lg font-medium">Loading Pre-calculated Hotspots...</p>
          </div>
        )}

        {!loading && hotspots.length === 0 && !error && (
          <div className="h-48 flex flex-col items-center justify-center text-gray-500">
            <MapPin className="w-8 h-8 mb-3" />
            <p className="text-lg font-medium">Select a time slot and click "View Busiest Routes".</p>
          </div>
        )}

        {!loading && hotspots.length > 0 && (
          <div className="overflow-x-auto">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Top 10 Busiest Routes ({TIME_SLOT_OPTIONS.find(s => s.key === timeSlot)?.name})
            </h3>
            <table className="min-w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
              <thead className="text-xs text-white uppercase bg-indigo-600">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Departure Zone</th>
                  <th className="px-4 py-3">Arrival Zone</th>
                  <th className="px-4 py-3 text-right">Avg. Fare</th>
                </tr>
              </thead>
              <tbody>
                {hotspots.map((row, idx) => (
                  <tr
                    key={`${row.departure_zone}-${row.arrival_zone}-${idx}`}
                    className={`border-b border-gray-100 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-100`}
                  >
                    <td className="px-4 py-3 font-bold text-indigo-700">{idx + 1}</td>
                    <td className="px-4 py-3">{row.departure_zone}</td>
                    <td className="px-4 py-3">{row.arrival_zone}</td>
                    <td className="px-4 py-3 text-right font-mono">${parseFloat(row.average_fare).toFixed(2)}</td>
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
  
  const handleFetchRouteHotspots = useCallback(async ({ timeSlot }) => {
    setLoading(true);
    setRouteHotspots([]);
    try {
      const data = await fetchRouteHotspots({ timeSlot });
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

const fetchRouteHotspots = async ({ timeSlot }) => {
  console.log('Fetching route hotspots for slot:', timeSlot);
  try {
    const url = `${API_BASE_URL}/route-hotspots?timeSlot=${timeSlot}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },

    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorData.error || 'Unknown error'}`);
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
