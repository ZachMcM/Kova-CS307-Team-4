import { supabase } from "@/lib/supabase";
import { ExercisePoints, WorkoutContribution } from "@/types/competition-types";
import { Tables } from "@/types/database.types";
import {
  CompetitionWithGroup,
  CompetitionWorkoutWithProfile,
  ExtendedCompetitionWithGroup,
} from "@/types/extended-types";
import { ExerciseData, Workout } from "@/types/workout-types";
import { getUserGroups } from "./groupServices";

export const getCompetition = async (
  id: string
): Promise<ExtendedCompetitionWithGroup> => {
  const { data: competition, error: compErr } = await supabase
    .from("competition")
    .select(
      `*,
    group:groupId(title, id)`
    )
    .eq("id", id)
    .single();

  if (compErr) {
    console.log("Competition Error", compErr);
    throw new Error(compErr.message);
  }

  return competition;
};

export const getUserCompetitions = async (
  profileId: string
): Promise<CompetitionWithGroup[]> => {
  const groups = await getUserGroups(profileId);

  const allCompetitions: CompetitionWithGroup[] = [];

  // add each competition associated with the group into the array
  for (const group of groups) {
    const { data: competitions, error: competitionsErr } = await supabase
      .from("competition")
      .select(
        `
        *,
        group:groupId(title, id)`
      )
      .eq("groupId", group.id);
    if (competitionsErr) {
      throw new Error(competitionsErr.message);
    }

    competitions.forEach((comp) => allCompetitions.push(comp));
  }

  return allCompetitions;
};

// function to add competitionWorkout to competition

export const addCompetitionWorkout = async (
  workout: Workout,
  profileId: string
) => {
  const competitions = await getUserCompetitions(profileId);

  for (const comp of competitions) {
    const { error: insertErr } = await supabase
      .from("competitionWorkout")
      .insert({
        competitionId: comp.id,
        workoutData: workout,
        profileId,
      });

    if (insertErr) {
      console.log(insertErr);
      throw new Error(insertErr.message);
    }
  }
};

export const getProfileCompetitionWorkouts = async (
  competitionId: string,
  profileId: string
): Promise<CompetitionWorkoutWithProfile[]> => {
  const { data, error } = await supabase
    .from("competitionWorkout")
    .select()
    .eq("competitionId", competitionId)
    .eq("profileId", profileId);

  if (error) {
    console.log(error);
    throw new Error(error.message);
  }

  return data as any;
};

export const getCompetitionWorkouts = async (
  competitionId: string
): Promise<CompetitionWorkoutWithProfile[]> => {
  const { data, error } = await supabase
    .from("competitionWorkout")
    .select(
      `
      *,
      profile:profileId(id, name, username, avatar)`
    )
    .eq("competitionId", competitionId);
  if (error) {
    console.log(error);
    throw new Error(error.message);
  }

  return data as any;
};

// function to get the total points for a given exercise

export const getExercisePoints = (
  competition: Tables<"competition">,
  exercise: ExerciseData
) => {
  const exercisePoints =
    (competition.exercise_points as ExercisePoints[]) || [];
  let totalPoints = 0;
  let baseValue = 1;
  for (const compExercise of exercisePoints) {
    if (exercise.info.id === compExercise.exerciseId) {
      baseValue = compExercise.points;
    }
  }

  for (const set of exercise.sets) {
    const setPoints =
      baseValue *
      set.reps! *
      competition.rep_multiplier! *
      set.weight! *
      competition.weight_multiplier!;
    totalPoints += setPoints;
  }

  return totalPoints;
};

// function to get the list of competitions the workout contributed to

export const getWorkoutContributions = async (
  exercises: ExerciseData[],
  profileId: string
): Promise<WorkoutContribution[]> => {
  const competitions = await getUserCompetitions(profileId);
  const contributions: WorkoutContribution[] = [];

  for (const comp of competitions) {
    let points = 0;
    for (const exercise of exercises) {
      console.log(exercise);
      points += getExercisePoints(comp, exercise);
    }
    contributions.push({
      competition: {
        id: comp.id,
        title: comp.title!,
      },
      points,
    });
  }

  return contributions;
};

export const getProfilePoints = (
  competition: Tables<"competition">,
  workouts: CompetitionWorkoutWithProfile[]
) => {
  let points = 0;
  console.log("Workouts", JSON.stringify(workouts));
  for (const workout of workouts) {
    for (const exercise of workout.workoutData.exercises) {
      points += getExercisePoints(competition, exercise);
    }
  }

  return points;
};
