import { useCallback, useState } from 'react';

import { apiFetchAuth } from '@/lib/api';
import type {
  JournalEntry,
  JournalEntryPayload,
  JournalListResponse,
  JournalSingleResponse,
} from '@/types/journal';

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await apiFetchAuth<JournalListResponse>('/journal');
      setEntries(data.data ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not load journal';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createEntry = useCallback(async (payload: JournalEntryPayload) => {
    const data = await apiFetchAuth<JournalSingleResponse>('/journal', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setEntries((prev) => [data.data, ...prev]);
    return data.data;
  }, []);

  const updateEntry = useCallback(async (id: string, payload: JournalEntryPayload) => {
    const data = await apiFetchAuth<JournalSingleResponse>(`/journal/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    setEntries((prev) => prev.map((e) => (e.id === id ? data.data : e)));
    return data.data;
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    await apiFetchAuth(`/journal/${id}`, { method: 'DELETE' });
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return {
    entries,
    loading,
    error,
    fetchEntries,
    createEntry,
    updateEntry,
    deleteEntry,
  };
}
