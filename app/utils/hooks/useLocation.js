import { useState } from "react";

export const useLocation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getLocationByAddress = async (address) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/location/by_address?address=${encodeURIComponent(address)}`,
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_LOCATION_API_KEY,
            "x-internal-request": "true",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al buscar la ubicación");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getLocationByPostalCode = async (postalCode) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/location/by-cp?cp=${encodeURIComponent(postalCode)}`,
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_LOCATION_API_KEY,
            "x-internal-request": "true",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al buscar la ubicación");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getLocationByAddress,
    getLocationByPostalCode,
    isLoading,
    error,
  };
};
