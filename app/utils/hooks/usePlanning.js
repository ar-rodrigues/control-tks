import { useState } from "react";

export function usePlanning() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPlannings = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = queryParams
        ? `/api/planning?${queryParams}`
        : "/api/planning";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch plannings");
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPlanning = async (id, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = queryParams
        ? `/api/planning/${id}?${queryParams}`
        : `/api/planning/${id}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch planning");
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createPlanning = async (planningData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/planning", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(planningData),
      });
      if (!response.ok) throw new Error("Failed to create planning");
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePlanning = async (id, planningData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/planning/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(planningData),
      });
      if (!response.ok) throw new Error("Failed to update planning");
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePlanning = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/planning/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete planning");
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getPlannings,
    getPlanning,
    createPlanning,
    updatePlanning,
    deletePlanning,
  };
}
