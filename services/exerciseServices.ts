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

export const getFavoriteExercises = async (profileId: string): Promise<ExtendedExercise[]> => {
  const { data: favoriteRels, error } = await supabase
    .from("favoriteRel")
    .select(`*,
      exercise:exerciseId(*)`)

  if (error) {
    console.log(error)
    throw new Error(error.message)
  }

  const exercises: ExtendedExercise[] = []

  for (const rel of favoriteRels) {
    const { data, error } = await supabase
      .from("relTag")
      .select(`
        *,
        tag:tag_id(*)
      `)
      .eq("exercise_id", rel.exerciseId)

    if (error) {
      console.log(error)
      throw new Error(error.message)
    }

    const exercise = rel.exercise

    exercises.push({
      ...exercise,
      tags: data.map(rel => rel.tag)
    })
  }

  return exercises
}

export const removeFavorite = async (profileId: string, exerciseId: string) => {
  const { error } = await supabase.from("favoriteRel").delete().eq("profileId", profileId).eq("exerciseId", exerciseId)

  if (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

export const addFavorite = async (profileId: string, exerciseId: string) => {
  const { error } = await supabase.from("favoriteRel").insert({
    exerciseId,
    profileId
  })

  if (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

export const isExerciseFavorited = async (profileId: string, exerciseId: string): Promise<boolean> => {
  const favorites = await getFavoriteExercises(profileId)

  let favorited = false

  for (const favorite of favorites) {
    if (favorite.id == exerciseId) {
      favorited = true
    }
  }

  return favorited
}