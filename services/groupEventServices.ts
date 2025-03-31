import { supabase } from "@/lib/supabase";
import { ExercisePoints, WorkoutContribution } from "@/types/event-types";
import { Tables } from "@/types/database.types";
import { ExerciseData, Workout } from "@/types/workout-types";
import { getGroupsOfUser } from "./groupServices";
import { EventWithGroup, EventWorkoutWithProfile, ExtendedEventWithGroup } from "@/types/extended-types";
import EditEventDetails, { EditEventDetailsValues } from "@/components/event/EditEventDetails";

export const getEvent = async (
  id: string
): Promise<ExtendedEventWithGroup> => {
  const { data: event, error } = await supabase
    .from("groupEvent")
    .select(
      `*,
    group:groupId(title, id)`
    )
    .eq("id", id)
    .single();

  if (error) {
    console.log("Event Error", error);
    throw new Error(error.message);
  }

  return event;
};

export const getUserEvents = async (
  profileId: string
): Promise<EventWithGroup[]> => {
  const groups = await getGroupsOfUser(profileId);

  const allEvents: EventWithGroup[] = [];

  // add each competition associated with the group into the array
  for (const groupId of groups) {
    const { data: events, error } = await supabase
      .from("groupEvent")
      .select(
        `
        *,
        group:groupId(title, id)`
      )
      .eq("groupId", groupId);
    if (error) {
      throw new Error(error.message);
    }

    events.forEach((event) => allEvents.push(event));
  }

  console.log("Events", allEvents)

  return allEvents;
};

// function to add competitionWorkout to competition

export const addEventWorkout = async (
  workout: Workout,
  profileId: string
) => {
  const events = await getUserEvents(profileId);

  for (const event of events) {
    const { error: insertErr } = await supabase
      .from("eventWorkout")
      .insert({
        groupEventId: event.id,
        workoutData: workout,
        profileId,
      });

    if (insertErr) {
      console.log(insertErr);
      throw new Error(insertErr.message);
    }
  }
};

export const getProfileEventWorkouts = async (
  eventId: string,
  profileId: string
): Promise<EventWorkoutWithProfile[]> => {
  const { data, error } = await supabase
    .from("eventWorkout")
    .select()
    .order("created_at", { ascending: false })
    .eq("groupEventId", eventId)
    .eq("profileId", profileId);

  if (error) {
    console.log(error);
    throw new Error(error.message);
  }

  return data as any;
};

export const getEventWorkouts = async (
  eventId: string
): Promise<EventWorkoutWithProfile[]> => {
  const { data, error } = await supabase
    .from("eventWorkout")
    .select(
      `
      *,
      profile:profileId(id, name, username, avatar)`
    )
    .eq("groupEventId", eventId);
  if (error) {
    console.log(error);
    throw new Error(error.message);
  }

  return data as any;
};

// function to get the total points for a given exercise

export const getExercisePoints = (
  event: Tables<"groupEvent">,
  exercise: ExerciseData
) => {
  const exercisePoints =
    (event.exercise_points as ExercisePoints[]) || [];
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
      event.rep_multiplier! *
      set.weight! *
      event.weight_multiplier!;
    totalPoints += setPoints;
  }

  return totalPoints;
};

// function to get the list of competitions the workout contributed to

export const getWorkoutContributions = async (
  exercises: ExerciseData[],
  profileId: string
): Promise<WorkoutContribution[]> => {
  const events = await getUserEvents(profileId);
  const contributions: WorkoutContribution[] = [];

  for (const event of events) {
    let points = 0;
    for (const exercise of exercises) {
      console.log(exercise);
      points += getExercisePoints(event, exercise);
    }
    contributions.push({
      competition: {
        id: event.id,
        title: event.title!,
      },
      points,
    });
  }

  return contributions;
};

export const getProfilePoints = (
  event: Tables<"groupEvent">,
  workouts: EventWorkoutWithProfile[]
) => {
  let points = 0;
  console.log("Workouts", JSON.stringify(workouts));
  for (const workout of workouts) {
    for (const exercise of workout.workoutData.exercises) {
      points += getExercisePoints(event, exercise);
    }
  }

  return points;
};

export const editEventDetails = async ({ endDate, goal, weightMultiplier, repMultiplier }: EditEventDetailsValues, eventId: string) => {
  const { data, error } = await supabase.from("groupEvent").update({
    end_date: endDate,
    goal,
    rep_multiplier: repMultiplier,
    weight_multiplier: weightMultiplier
  }).eq("id", eventId)

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const editExercisePointValues = async (pointValues: ExercisePoints[], eventId: string) => {
  const { data, error } = await supabase.from("groupEvent").update({
    exercise_points: pointValues
  }).eq("id", eventId)

  if (error) {
    throw new Error(error.message)
  }

  return data
}
