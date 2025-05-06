"use client";

import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const LocationMap = ({ workSessions, selectedDate }) => {
  const [locations, setLocations] = useState([]);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    const fetchLocations = async () => {
      const dateData = workSessions.find(
        (session) => session.work_session_date === selectedDate
      );
      const dateSessions = dateData?.employees_sessions || [];

      const locations = dateSessions
        .filter((session) => session.first_check_in_location)
        .map((session) => ({
          ...session,
          address: session.first_check_in_address || "Ubicación no disponible",
        }));

      setLocations(locations);
    };

    fetchLocations();
  }, [workSessions, selectedDate]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initialize map if it doesn't exist
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(
        [19.4326, -99.1332],
        13
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapInstanceRef.current);
    }

    // Clear existing markers
    if (mapInstanceRef.current) {
      mapInstanceRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });
    }

    // Add new markers
    if (mapInstanceRef.current && locations.length > 0) {
      const bounds = L.latLngBounds([]);

      locations.forEach((session) => {
        if (session.first_check_in_location) {
          const checkInTime = new Date(session.first_check_in);
          const isOnTime =
            checkInTime.getHours() < 9 ||
            (checkInTime.getHours() === 9 && checkInTime.getMinutes() <= 10);

          const markerColor = isOnTime ? "#48BB78" : "#F56565";
          const icon = L.divIcon({
            className: "custom-marker",
            html: `<div style="
              background-color: ${markerColor};
              width: 20px;
              height: 20px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 0 10px rgba(0,0,0,0.3);
            "></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          const marker = L.marker(
            [
              session.first_check_in_location.lat,
              session.first_check_in_location.lng,
            ],
            { icon }
          )
            .addTo(mapInstanceRef.current)
            .bindPopup(
              `<div style="font-size: 14px;">
                <strong>${session.profile_name}</strong><br>
                Check-in: ${checkInTime.toLocaleTimeString("es-MX")}<br>
                ${session.address}
              </div>`
            );

          bounds.extend(marker.getLatLng());
        }
      });

      // Fit map to show all markers
      if (!bounds.isValid()) {
        mapInstanceRef.current.setView([19.4326, -99.1332], 13);
      } else {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [locations]);

  return <div ref={mapRef} style={{ height: "100%", width: "100%" }} />;
};

export default LocationMap;
