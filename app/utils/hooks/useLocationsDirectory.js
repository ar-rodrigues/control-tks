import { useState, useEffect } from "react";

export const useLocationsDirectory = () => {
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all locations
  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/locations-directory");
      if (!response.ok) throw new Error("Failed to fetch locations");
      const data = await response.json();
      setLocations(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Get location by ID
  const getLocationById = async (id) => {
    try {
      const response = await fetch(`/api/locations-directory/${id}`);
      if (!response.ok) throw new Error("Failed to fetch location");
      return await response.json();
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  // Create new location
  const createLocation = async (locationData) => {
    try {
      const response = await fetch("/api/locations-directory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(locationData),
      });
      if (!response.ok) throw new Error("Failed to create location");
      const newLocation = await response.json();
      setLocations((prev) => [...prev, newLocation]);
      return newLocation;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  // Update location
  const updateLocation = async (id, locationData) => {
    try {
      const response = await fetch(`/api/locations-directory/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(locationData),
      });
      if (!response.ok) throw new Error("Failed to update location");
      const updatedLocation = await response.json();
      setLocations((prev) =>
        prev.map((loc) => (loc.id === id ? updatedLocation : loc))
      );
      return updatedLocation;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  // Delete location
  const deleteLocation = async (id) => {
    try {
      const response = await fetch(`/api/locations-directory/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete location");
      setLocations((prev) => prev.filter((loc) => loc.id !== id));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Get coordinates by postal code
  const getCoordinatesByPostalCode = async (postalCode) => {
    try {
      const response = await fetch(`/api/location/by-cp?cp=${postalCode}`);
      if (!response.ok) throw new Error("Failed to get coordinates");
      return await response.json();
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return {
    locations,
    isLoading,
    error,
    fetchLocations,
    getLocationById,
    createLocation,
    updateLocation,
    deleteLocation,
    getCoordinatesByPostalCode,
  };
};
