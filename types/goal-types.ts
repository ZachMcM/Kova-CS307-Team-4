// types/goal-types.ts

export interface WeightGoal {
  id: string;
  user_id: string;
  target_weight: number;
  initial_weight: number;
  unit: 'kg' | 'lbs';
  goal_type: 'loss' | 'gain';
  start_date: string;
  target_date: string;
  is_active: boolean;
  achieved_at: string | null;
  created_at: string;
  updated_at: string;
}

export type WeightGoalInsert = Omit<WeightGoal, 'id' | 'created_at' | 'updated_at' | 'is_active' | 'start_date' | 'achieved_at'> & {
    start_date?: string; // Optional on insert, defaults in DB
};

export type WeightGoalUpdate = Partial<Omit<WeightGoal, 'id' | 'user_id' | 'created_at' | 'start_date'>>;