import { supabase } from "@/lib/supabase";
import { WeightEntry, WeightEntryInsert, WeightEntryUpdate } from "@/types/weight-types";

/**
 * Get all weight entries for a user
 * @param userId The user ID
 * @returns Array of weight entries
 */
export const getWeightEntries = async (userId: string): Promise<WeightEntry[]> => {
  const { data, error } = await supabase
    .from("weight_entries")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) throw new Error(error.message);
  return data as WeightEntry[];
};

/**
 * Add a new weight entry
 * @param entry The weight entry to add
 * @returns The added weight entry
 */
export const addWeightEntry = async (entry: WeightEntryInsert): Promise<WeightEntry> => {
  const { data, error } = await supabase
    .from("weight_entries")
    .insert(entry)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as WeightEntry;
};

/**
 * Update an existing weight entry
 * @param id The ID of the entry to update
 * @param updates The updates to apply
 * @returns The updated weight entry
 */
export const updateWeightEntry = async (id: string, updates: WeightEntryUpdate): Promise<WeightEntry> => {
  const { data, error } = await supabase
    .from("weight_entries")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as WeightEntry;
};

/**
 * Delete a weight entry
 * @param id The ID of the entry to delete
 */
export const deleteWeightEntry = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("weight_entries")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}; 