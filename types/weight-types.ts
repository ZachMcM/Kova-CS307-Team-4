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

export type GoalType = 'loss' | 'gain' | 'maintain';
export type GoalStatus = 'in_progress' | 'achieved' | 'missed';

export type WeightGoal = {
  id: string;
  user_id: string;
  start_weight: number;
  target_weight: number;
  unit: 'kg' | 'lbs';
  start_date: string; // ISO date string
  target_date: string; // ISO date string
  goal_type: GoalType;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
};

export type WeightGoalInsert = Omit<WeightGoal, 'id' | 'status' | 'created_at' | 'updated_at'>;
export type WeightGoalUpdate = Partial<Omit<WeightGoal, 'id' | 'user_id' | 'created_at'>>; 