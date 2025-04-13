// services/goalServices.ts
import { supabase } from "@/lib/supabase";
import { WeightGoal, WeightGoalInsert, WeightGoalUpdate } from "@/types/goal-types";

/**
 * Get the active weight goal for a user
 * @param userId The user ID
 * @returns The active WeightGoal or null if none exists
 */
export const getActiveWeightGoal = async (userId: string): Promise<WeightGoal | null> => {
  const { data, error } = await supabase
    .from("weight_goals")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false }) // Get the most recent active goal
    .limit(1)
    .maybeSingle(); // Use maybeSingle to return null if no row found

  if (error) {
    console.error("Error fetching active weight goal:", error);
    throw new Error(error.message);
  }
  return data as WeightGoal | null;
};

/**
 * Sets all active goals for a user to inactive.
 * Typically used before creating a new goal.
 * @param userId The user ID
 */
const deactivatePreviousGoals = async (userId: string): Promise<void> => {
    const { error } = await supabase
        .from("weight_goals")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("is_active", true);

    if (error) {
        console.error("Error deactivating previous goals:", error);
        throw new Error(error.message);
    }
};

/**
 * Create a new weight goal. Deactivates any existing active goals first.
 * @param goal The goal data to insert
 * @returns The created WeightGoal
 */
export const createWeightGoal = async (goal: WeightGoalInsert): Promise<WeightGoal> => {
  await deactivatePreviousGoals(goal.user_id); // Ensure only one goal is active

  const { data, error } = await supabase
    .from("weight_goals")
    .insert({ ...goal, is_active: true }) // Ensure new goal is active
    .select()
    .single();

  if (error) {
    console.error("Error creating weight goal:", error);
    throw new Error(error.message);
  }
  return data as WeightGoal;
};

/**
 * Update an existing weight goal
 * @param goalId The ID of the goal to update
 * @param updates The updates to apply
 * @returns The updated WeightGoal
 */
export const updateWeightGoal = async (goalId: string, updates: WeightGoalUpdate): Promise<WeightGoal> => {
  const { data, error } = await supabase
    .from("weight_goals")
    .update({ ...updates, updated_at: new Date().toISOString() }) // updated_at handled by trigger, but good practice
    .eq("id", goalId)
    .select()
    .single();

  if (error) {
    console.error("Error updating weight goal:", error);
    throw new Error(error.message);
  }
  return data as WeightGoal;
};

/**
 * Mark a goal as achieved and inactive
 * @param goalId The ID of the goal to mark as achieved
 * @returns The updated WeightGoal
 */
export const achieveWeightGoal = async (goalId: string): Promise<WeightGoal> => {
    const achievedAt = new Date().toISOString();
    const { data, error } = await supabase
        .from("weight_goals")
        .update({ is_active: false, achieved_at: achievedAt, updated_at: achievedAt })
        .eq("id", goalId)
        .select()
        .single();

    if (error) {
        console.error("Error marking goal as achieved:", error);
        throw new Error(error.message);
    }
    return data as WeightGoal;
};

/**
 * Deactivate a goal (e.g., user cancels it)
 * @param goalId The ID of the goal to deactivate
 * @returns The updated WeightGoal
 */
export const deactivateGoal = async (goalId: string): Promise<WeightGoal> => {
    const { data, error } = await supabase
        .from("weight_goals")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", goalId)
        .select()
        .single();

    if (error) {
        console.error("Error deactivating goal:", error);
        throw new Error(error.message);
    }
    return data as WeightGoal;
};