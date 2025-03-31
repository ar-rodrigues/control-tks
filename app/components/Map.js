import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";

// Custom marker icon
const icon = L.icon({
  iconUrl:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%234299E1'%3E%3Ccircle cx='12' cy='12' r='8' fill='white'/%3E%3Ccircle cx='12' cy='12' r='6'/%3E%3C/svg%3E",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Component to handle map updates
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, {
      animate: true,
      duration: 1,
    });
  }, [center, zoom, map]);

  return null;
};

const Map = ({ location, isPlaceholder = false }) => {
  const defaultLocation = { lat: 19.037487, lng: -98.201579 }; // Puebla coordinates
  const mapLocation = isPlaceholder ? defaultLocation : location;
  const zoom = isPlaceholder ? 12 : 15;

  return (
    <MapContainer
      center={[mapLocation.lat, mapLocation.lng]}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
      attributionControl={false}
    >
      <MapUpdater center={[mapLocation.lat, mapLocation.lng]} zoom={zoom} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        className={
          isPlaceholder ? "grayscale-tiles placeholder" : "grayscale-tiles"
        }
      />
      {!isPlaceholder && (
        <Marker position={[mapLocation.lat, mapLocation.lng]} icon={icon}>
          <Popup>Current location</Popup>
        </Marker>
      )}
      <style jsx global>{`
        .grayscale-tiles {
          filter: grayscale(100%) brightness(95%);
          transition: all 0.3s ease-in-out;
        }
        .grayscale-tiles.placeholder {
          opacity: 0.7;
          filter: grayscale(100%) brightness(90%) blur(1px);
        }
        .leaflet-container {
          background: #f0f0f0;
        }
        .leaflet-popup-content-wrapper {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 12px;
        }
        .leaflet-popup-tip {
          background: rgba(255, 255, 255, 0.9);
        }
      `}</style>
    </MapContainer>
  );
};

export default Map;
