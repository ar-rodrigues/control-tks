import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useMemo } from "react";
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
    if (map) {
      map.setView(center, zoom, {
        animate: true,
        duration: 1,
      });
    }
  }, [center, zoom, map]);

  return null;
};

const Map = ({ location, isPlaceholder = false }) => {
  const defaultLocation = { lat: 19.037487, lng: -98.201579 }; // Puebla coordinates
  const mapLocation = useMemo(
    () => (isPlaceholder ? defaultLocation : location),
    [isPlaceholder, location]
  );
  const zoom = isPlaceholder ? 13 : 18;

  // Memoize the MapContainer key to prevent re-initialization
  const mapKey = useMemo(
    () =>
      `map-${isPlaceholder ? "placeholder" : "active"}-${mapLocation?.lat}-${
        mapLocation?.lng
      }`,
    [isPlaceholder, mapLocation]
  );

  return (
    <div className="map-container">
      <MapContainer
        key={mapKey}
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
      </MapContainer>
      <style jsx global>{`
        .map-container {
          height: 100%;
          width: 100%;
          position: relative;
          border-radius: 0 0 24px 24px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .grayscale-tiles {
          filter: grayscale(10%) brightness(95%);
          transition: all 0.3s ease-in-out;
        }
        .grayscale-tiles.placeholder {
          opacity: 0.7;
          filter: grayscale(100%) brightness(95%) blur(0.51px);
        }
        .leaflet-container {
          background: #f0f0f0;
          height: 100%;
          width: 100%;
          border-radius: 0 0 24px 24px;
        }
        .leaflet-popup-content-wrapper {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        .leaflet-popup-tip {
          background: rgba(255, 255, 255, 0.9);
        }
        @media (max-width: 768px) {
          .map-container {
            border-radius: 0 0 16px 16px;
          }
          .leaflet-container {
            border-radius: 0 0 16px 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default Map;
