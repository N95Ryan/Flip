export type JournalEntry = {
  id: string;
  user_id?: string;
  session_date: string;
  duration_minutes: number;
  intensity: number;
  notes: string;
  created_at: string;
};

export type JournalEntryPayload = {
  session_date: string;
  duration_minutes: number;
  intensity: number;
  notes: string;
};

export type JournalListResponse = {
  data: JournalEntry[];
  count: number;
};

export type JournalSingleResponse = {
  data: JournalEntry;
};
