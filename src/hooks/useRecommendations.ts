import { useState, useCallback } from 'react';
import { fetchProfile } from '../services/profileService';
import { getRecommendations } from '../services/n8nService';

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch the user's latest profile from Supabase profiles table
      const profile = await fetchProfile(userId);
      if (!profile) {
        throw new Error("No profile found. Please complete your profile details first.");
      }

      // 2. Fetch recommendations from the n8n webhook using the profile data
      const data = await getRecommendations(userId, profile);
      setRecommendations(data);
      return data;
    } catch (err: any) {
      console.error("Error in useRecommendations hook:", err);
      const errMsg = err.message || "Failed to fetch recommendations.";
      setError(errMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    recommendations,
    isLoading,
    error,
    fetchRecommendations,
    setRecommendations
  };
}
