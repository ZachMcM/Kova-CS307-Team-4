import { supabase } from "@/lib/supabase";
import { Contribution, ExercisePoints } from "@/types/competition-types";
import { Tables } from "@/types/database.types";
import { ExerciseData } from "@/types/workout-types";

export const getUserCompetitions = async (profileId: string): Promise<Tables<'competition'>[]> => {
  const { data: groups, error: groupErr } = await supabase.from("groupRel").select(
    `groupId`
  ).eq('profileId', profileId)


  if (groupErr) {
    throw new Error(groupErr.message)
  }

  const allCompetitions: Tables<'competition'>[] = []

  // add each competition associated with the group into the array
  for (const group of groups) {
    const { data: competitions, error: competitionsErr } = await supabase.from("competition").select().eq("groupId", group.groupId)
    if (competitionsErr) {
      throw new Error(competitionsErr.message)
    }

    competitions.forEach((comp) => allCompetitions.push(comp))
  }

  return allCompetitions
}

export const getExercisePoints = (competition: Tables<'competition'>, exercise: ExerciseData) => {
  const exercisePoints = competition.exercise_points as ExercisePoints[] || []
  let totalPoints = 0
  let baseValue = 1
  for (const compExercise of exercisePoints) {
    if (exercise.info.id === compExercise.exerciseId) {
      baseValue = compExercise.points
    }
  }

  console.log(exercise)

  for (const set of exercise.sets) {
    console.log("reps", set.reps, "rep mult", competition.rep_multiplier, "weight", set.weight, "weight mult", competition.weight_multiplier)
    const setPoints = baseValue * set.reps! * competition.rep_multiplier! * set.weight! * competition.weight_multiplier!
    console.log(setPoints)
    totalPoints += setPoints
  }

  return totalPoints
}

export const getContributions = async (exercises: ExerciseData[], profileId: string): Promise<Contribution[]> => {
  const competitions = await getUserCompetitions(profileId)
  const contributions: Contribution[] = []

  for (const comp of competitions) {
    let points = 0
    for (const exercise of exercises) {
      console.log(exercise)
      points += getExercisePoints(comp, exercise) 
    }
    contributions.push({
      competition: {
        id: comp.id,
        title: comp.title!
      },
      points
    })
  }

  return contributions
}