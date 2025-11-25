// ZoneMarkerMap.jsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// default (blue) marker icon
const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// selected (red) marker icon
const selectedIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/**
 * props:
 *  - zones: [{ id, name, lat, lng }, ...]
 *  - selectedZoneId: number | null
 *  - onSelectZone: (zoneId: number) => void
 */
const ZoneMarkerMap = ({ zones = [], selectedZoneId, onSelectZone }) => {
  const defaultCenter = [40.73, -73.95]; // NYC center

  return (
    <div className="w-full h-[360px] rounded-xl overflow-hidden shadow border border-gray-200">
      <MapContainer
        center={defaultCenter}
        zoom={11}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {zones.map((z) => {
          const isSelected = Number(selectedZoneId) === Number(z.id);

          return (
            <Marker
              key={z.id}
              position={[z.lat, z.lng]}
              // 👇 这里根据是否选中切换 icon 颜色
              icon={isSelected ? selectedIcon : defaultIcon}
              eventHandlers={{
                click: () => {
                  if (onSelectZone) {
                    onSelectZone(z.id);
                  }
                },
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{z.name}</div>
                  <div className="text-xs text-gray-600">TLC ID: {z.id}</div>
                  {isSelected ? (
                    <div className="mt-2 text-xs font-semibold text-green-600">
                      This zone is selected.
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-gray-500">
                      Click this marker to select this zone.
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default ZoneMarkerMap;
