export type WeightEntry = {
  id: string;
  user_id: string;
  weight: number;
  unit: 'kg' | 'lbs';
  date: string; // ISO date string
  created_at: string;
  updated_at: string;
};

export type WeightEntryInsert = Omit<WeightEntry, 'id' | 'created_at' | 'updated_at'>;
export type WeightEntryUpdate = Partial<Omit<WeightEntry, 'id' | 'user_id' | 'created_at'>>; 