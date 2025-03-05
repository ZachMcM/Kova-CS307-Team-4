import { supabase } from "@/lib/supabase";
import { Tables } from "@/types/database.types";
import { ExtendedExercise } from "@/types/extended-types";

export async function getExercises(): Promise<ExtendedExercise[]> {
  const { data, error } = await supabase
    .from('exercise')
    .select(`
      id,
      name,
      created_at,
      tags:relTag(tag(*))
    `);
  
  if (error) {
    throw new Error(error.message)
  }
  
  // Correctly transform and type the data
  const exercises = data.map(exercise => ({
    ...exercise,
    tags: exercise.tags.map(item => item.tag as any)
  }));
  
  return exercises as ExtendedExercise[];
}