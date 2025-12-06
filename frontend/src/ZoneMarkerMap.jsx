import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  Tooltip,
  Polyline,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const defaultIcon = new L.Icon.Default();

// Helper component to fix map initialization issues
const MapInitializer = () => {
  const map = useMap();

  useEffect(() => {
    // Fix click detection by recalculating map size after render
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    // Increase tap tolerance to prevent accidental drags on click
    if (map.tap) {
      map.tap.disable();
      map.tap.enable({ tapTolerance: 15 });
    }

    return () => clearTimeout(timer);
  }, [map]);

  return null;
};

// Helper component to update map bounds when route is selected or single zone is selected
const MapBoundsUpdater = ({ startZone, endZone, selectedZone }) => {
  const map = useMap();

  useEffect(() => {
    if (startZone && endZone) {
      // Create bounds that include both markers (for Trip Planner and Route Hotspots)
      const bounds = L.latLngBounds(
        [startZone.lat, startZone.lng],
        [endZone.lat, endZone.lng]
      );
      
      // Fit the map to show both markers with some padding
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    } else if (selectedZone) {
      // Center on single zone (for Traffic Dashboard)
      map.setView([selectedZone.lat, selectedZone.lng], 13, {
        animate: true,
        duration: 0.5
      });
    }
  }, [map, startZone, endZone, selectedZone]);

  return null;
};

/**
 * props:
 zones: [{ id, name, lat, lng }]
 onSelectZone(zoneId)
 selectedZoneId:  the editing point（Traffic & Planner share）
 startZoneId:     Trip Planner's start
 endZoneId:       Trip Planner's end
 showOnlyRoute:   If true, only show start/end pins (for Route Hotspots). If false, show all pins (for Trip Planner)
 */
const ZoneMarkerMap = ({
  zones,
  onSelectZone,
  selectedZoneId = null,
  startZoneId = null,
  endZoneId = null,
  showOnlyRoute = false,
}) => {
  const center = [40.7128, -74.006]; // NYC

  const [bothHighlight, setBothHighlight] = useState(false);

  useEffect(() => {
    let timer;
    if (startZoneId && endZoneId) {
      setBothHighlight(false);  
      timer = setTimeout(() => {
        setBothHighlight(true);  
      }, 2500); // 2.5 second "sleep"
    } else {
      setBothHighlight(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [startZoneId, endZoneId]);

  const isSameStartEnd =
    startZoneId &&
    endZoneId &&
    Number(startZoneId) === Number(endZoneId);

  // Find the actual zone objects for start, end, and selected
  const startZone = startZoneId ? zones.find(z => z.id === Number(startZoneId)) : null;
  const endZone = endZoneId ? zones.find(z => z.id === Number(endZoneId)) : null;
  const selectedZone = selectedZoneId ? zones.find(z => z.id === Number(selectedZoneId)) : null;

  // Filter zones based on showOnlyRoute prop
  const zonesToRender = showOnlyRoute 
    ? zones.filter(zone => {
        // Only show start, end, or selected zones when in "route only" mode
        const isStart = startZoneId && zone.id === Number(startZoneId);
        const isEnd = endZoneId && zone.id === Number(endZoneId);
        const isSelectedOnly = selectedZoneId && zone.id === Number(selectedZoneId) && !isStart && !isEnd;
        
        return isStart || isEnd || isSelectedOnly;
      })
    : zones; // Show all zones for Trip Planner

  return (
    <MapContainer
      center={center}
      zoom={11}
      style={{ width: '100%', height: '100%' }}
      scrollWheelZoom={true}
      tapTolerance={15}
      tap={true}
    >
      <MapInitializer />
      <MapBoundsUpdater startZone={startZone} endZone={endZone} selectedZone={selectedZone} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Draw line connecting start and end */}
      {startZone && endZone && !isSameStartEnd && (
        <Polyline
          positions={[
            [startZone.lat, startZone.lng],
            [endZone.lat, endZone.lng]
          ]}
          pathOptions={{
            color: '#3b82f6',
            weight: 3,
            opacity: 0.7,
            dashArray: '10, 10'
          }}
        />
      )}

      {zonesToRender.map((zone) => {
        const isStart = !!startZoneId && zone.id === Number(startZoneId);
        const isEnd = !!endZoneId && zone.id === Number(endZoneId);
        const isSelectedOnly =
          !!selectedZoneId &&
          zone.id === Number(selectedZoneId) &&
          !isStart &&
          !isEnd;


        let highlightColor = '#ef4444';  

        if (isStart) highlightColor = '#22c55e';  
        if (isEnd) highlightColor = '#a855f7';  

        // start&dest finished, all orange
        if (bothHighlight && (isStart || isEnd)) {
          highlightColor = '#f97316';  
        }

        const showHighlight = isStart || isEnd || isSelectedOnly;

        // Popup‘s status
        let statusText = '';
        let statusColor = highlightColor;

        if (bothHighlight && (isStart || isEnd)) {
          statusText = 'Both start and end selected';
        } else if (isStart && !isEnd) {
          statusText = 'Selected as START';
        } else if (isEnd && !isStart) {
          statusText = 'Selected as END';
        } else if (isSelectedOnly) {
          statusText = 'This zone is selected';
        }

        const showSameWarning =
          isSameStartEnd && zone.id === Number(startZoneId);

        // label START / END / START / END
        let labelText = '';
        if (isStart && !isEnd) labelText = 'START';
        if (!isStart && isEnd) labelText = 'END';
        if (isStart && isEnd) labelText = 'START / END';

        return (
          <Marker
            key={zone.id}
            position={[zone.lat, zone.lng]}
            icon={defaultIcon}
            eventHandlers={{
              click: () => {
                if (onSelectZone) onSelectZone(zone.id);
              },
            }}
          >
            {showHighlight && (
              <CircleMarker
                center={[zone.lat, zone.lng]}
                radius={15}
                pathOptions={{
                  color: highlightColor,
                  weight: 4,
                  fill: false,
                }}
              />
            )}

            {labelText && (
              <Tooltip
                direction="bottom"
                offset={[0, 16]}
                permanent
                opacity={1}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#111827',
                  }}
                >
                  {labelText}
                </span>
              </Tooltip>
            )}

            <Popup>
              <div style={{ fontSize: 13 }}>
                <div
                  style={{
                    fontWeight: 700,
                    marginBottom: 4,
                  }}
                >
                  {zone.name}
                </div>
                <div style={{ fontSize: 12, marginBottom: 4 }}>
                  TLC ID: {zone.id}
                </div>
                {statusText && (
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: statusColor,
                    }}
                  >
                    {statusText}
                  </div>
                )}
                {showSameWarning && (
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      color: '#dc2626',  
                      fontWeight: 600,
                    }}
                  >
                    Start and end are the same zone.
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default ZoneMarkerMap;
