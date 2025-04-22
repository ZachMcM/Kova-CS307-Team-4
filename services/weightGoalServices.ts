import { supabase } from "@/lib/supabase";
import { WeightGoal, WeightGoalInsert, WeightGoalUpdate } from "@/types/weight-types";

/**
 * Get the current weight goal for a user
 * @param userId The user ID
 * @returns The current weight goal or null if no goal exists
 */
export const getCurrentWeightGoal = async (userId: string): Promise<WeightGoal | null> => {
  const { data, error } = await supabase
    .from("weight_goals")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "in_progress")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
    throw new Error(error.message);
  }
  
  return data as WeightGoal | null;
};

/**
 * Get all weight goals for a user
 * @param userId The user ID
 * @returns Array of weight goals
 */
export const getWeightGoals = async (userId: string): Promise<WeightGoal[]> => {
  const { data, error } = await supabase
    .from("weight_goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  
  if (error) throw new Error(error.message);
  return data as WeightGoal[];
};

/**
 * Add a new weight goal
 * @param goal The weight goal to add
 * @returns The added weight goal
 */
export const addWeightGoal = async (goal: WeightGoalInsert): Promise<WeightGoal> => {
  // First, mark any in-progress goals as missed
  await supabase
    .from("weight_goals")
    .update({ status: "missed", updated_at: new Date().toISOString() })
    .eq("user_id", goal.user_id)
    .eq("status", "in_progress");
  
  // Add the new goal
  const { data, error } = await supabase
    .from("weight_goals")
    .insert({
      ...goal,
      status: "in_progress",
    })
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return data as WeightGoal;
};

/**
 * Update an existing weight goal
 * @param id The ID of the goal to update
 * @param updates The updates to apply
 * @returns The updated weight goal
 */
export const updateWeightGoal = async (id: string, updates: WeightGoalUpdate): Promise<WeightGoal> => {
  const { data, error } = await supabase
    .from("weight_goals")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return data as WeightGoal;
};

/**
 * Delete a weight goal
 * @param id The ID of the goal to delete
 */
export const deleteWeightGoal = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("weight_goals")
    .delete()
    .eq("id", id);
  
  if (error) throw new Error(error.message);
};

/**
 * Check if a weight goal has been achieved based on the latest weight entry
 * @param goalId The ID of the goal to check
 * @param currentWeight The current weight to check against
 * @returns True if the goal is achieved, false otherwise
 */
export const checkGoalAchievement = async (goalId: string, currentWeight: number): Promise<boolean> => {
  const { data: goal, error } = await supabase
    .from("weight_goals")
    .select("*")
    .eq("id", goalId)
    .eq("status", "in_progress")
    .single();
  
  if (error) throw new Error(error.message);
  
  if (!goal) return false;
  
  const targetReached = (goal.goal_type === 'loss' && currentWeight <= goal.target_weight) || 
                         (goal.goal_type === 'gain' && currentWeight >= goal.target_weight) || 
                         (goal.goal_type === 'maintain' && Math.abs(currentWeight - goal.target_weight) <= 1);
  
  if (targetReached) {
    // Mark the goal as achieved
    await supabase
      .from("weight_goals")
      .update({ 
        status: "achieved", 
        updated_at: new Date().toISOString() 
      })
      .eq("id", goalId);
    
    return true;
  }
  
  return false;
}; 