import { useCallback, useEffect, useState } from 'react';

import type { Technique, TechniqueResponse } from '@/types/technique';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

interface UseTechniqueResult {
  technique: Technique | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTechnique(id: string): UseTechniqueResult {
  const [technique, setTechnique] = useState<Technique | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTechnique = useCallback(async () => {
    if (!id) {
      setTechnique(null);
      setLoading(false);
      setError('Technique id is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/techniques/${encodeURIComponent(id)}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch technique (${response.status})`);
      }

      const json = (await response.json()) as TechniqueResponse;
      setTechnique(json.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      setTechnique(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchTechnique();
  }, [fetchTechnique]);

  return { technique, loading, error, refetch: fetchTechnique };
}
