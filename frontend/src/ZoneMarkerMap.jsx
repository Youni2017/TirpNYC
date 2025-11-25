import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  Tooltip,
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

/**
 * props:
 zones: [{ id, name, lat, lng }]
 onSelectZone(zoneId)
 selectedZoneId:  the editing point（Traffic & Planner share）
 startZoneId:     Trip Planner's start
 endZoneId:       Trip Planner's end
 */
const ZoneMarkerMap = ({
  zones,
  onSelectZone,
  selectedZoneId = null,
  startZoneId = null,
  endZoneId = null,
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

  return (
    <MapContainer
      center={center}
      zoom={11}
      style={{ width: '100%', height: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {zones.map((zone) => {
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
