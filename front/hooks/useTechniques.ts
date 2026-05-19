import { useCallback, useEffect, useState } from 'react';

import type { CategoryFilterValue, Technique, TechniquesResponse } from '@/types/technique';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

interface UseTechniquesResult {
  techniques: Technique[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTechniques(category: CategoryFilterValue = 'all'): UseTechniquesResult {
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTechniques = useCallback(async () => {
    setLoading(true);
    setError(null);

    const url =
      category === 'all'
        ? `${API_URL}/techniques`
        : `${API_URL}/techniques?category=${encodeURIComponent(category)}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch techniques (${response.status})`);
      }

      const json = (await response.json()) as TechniquesResponse;
      setTechniques(json.data ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      setTechniques([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    void fetchTechniques();
  }, [fetchTechniques]);

  return { techniques, loading, error, refetch: fetchTechniques };
}
