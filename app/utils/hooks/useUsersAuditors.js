import { useState, useEffect } from "react";

export const useUsersAuditors = () => {
  const [auditors, setAuditors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all auditors
  const fetchAuditors = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/users/auditors");
      if (!response.ok) throw new Error("Failed to fetch auditors");
      const data = await response.json();
      setAuditors(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Get auditor by ID
  const getAuditorById = async (id) => {
    try {
      const response = await fetch(`/api/users/auditors/${id}`);
      if (!response.ok) throw new Error("Failed to fetch auditor");
      return await response.json();
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  // Update auditor
  const updateAuditor = async (id, auditorData) => {
    try {
      const response = await fetch(`/api/users/auditors/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(auditorData),
      });
      if (!response.ok) throw new Error("Failed to update auditor");
      const updatedAuditor = await response.json();
      setAuditors((prev) =>
        prev.map((aud) => (aud.id === id ? updatedAuditor : aud))
      );
      return updatedAuditor;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  useEffect(() => {
    fetchAuditors();
  }, []);

  return {
    auditors,
    isLoading,
    error,
    fetchAuditors,
    getAuditorById,
    updateAuditor,
  };
};
