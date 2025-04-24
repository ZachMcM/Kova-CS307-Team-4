import { NewEventValues } from "@/components/event/EventForm";
import { supabase } from "@/lib/supabase";
import { Tables } from "@/types/database.types";
import { ExercisePoints, WorkoutContribution } from "@/types/event-types";
import {
  EventWithGroup,
  EventWorkoutWithProfile,
  ExtendedEventWithGroup,
} from "@/types/extended-types";
import { ExerciseData, Workout } from "@/types/workout-types";
import { getUserGroups } from "./groupServices";
import { getCurrentEvents } from "./simpleEventServices";

export const newEvent = async (
  groupId: string,
  {
    title,
    start_date,
    end_date,
    goal,
    exercises,
    repMultiplier,
    weightMultiplier,
    type,
  }: NewEventValues
): Promise<Tables<"groupEvent">> => {
  const { data, error } = await supabase
    .from("groupEvent")
    .insert({
      title,
      start_date,
      end_date,
      exercise_points: exercises,
      rep_multiplier: repMultiplier,
      weight_multiplier: weightMultiplier,
      type,
      goal,
      groupId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getEvent = async (id: string): Promise<ExtendedEventWithGroup> => {
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

export const getCurrentUserEvents = async (
  profileId: string
): Promise<EventWithGroup[]> => {
  const groups = await getUserGroups(profileId);

  const allEvents: EventWithGroup[] = [];
  const currentTime = new Date(Date.now()).toISOString()
  // add each competition associated with the group into the array
  for (const groupId of groups) {
    const { data: events, error } = await supabase
      .from("groupEvent")
      .select(
        `
        *,
        group:groupId(title, id)`
      )
      .eq("groupId", groupId)
      .lte("start_date", currentTime)
      .gte("end_date", currentTime);
    if (error) {
      throw new Error(error.message);
    }

    events.forEach((event) => allEvents.push(event));
  }

  return allEvents;
};

export const getUserEvents = async (
  profileId: string
): Promise<EventWithGroup[]> => {
  const groups = await getUserGroups(profileId);

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

  return allEvents;
};

// function to add competitionWorkout to competition

export const addEventWorkout = async (workout: Workout, profileId: string) => {
  let events = await getUserEvents(profileId);
  events = events.filter(
    (event) =>
      new Date(event.start_date!).getTime() <= Date.now() &&
      new Date(event.end_date!).getTime() >= Date.now()
  );

  for (const event of events) {
    const { error: insertErr } = await supabase.from("eventWorkout").insert({
      groupEventId: event.id,
      workoutData: workout,
      profileId,
    });

    if (insertErr) {
      throw new Error(insertErr.message);
    }
  }
};

export const getProfileEventWorkouts = async (
  eventId: string,
  profileId: string
): Promise<EventWorkoutWithProfile[]> => {
  const event = await getEvent(eventId)
  const { data, error } = await supabase
    .from("eventWorkout")
    .select()
    .order("created_at", { ascending: false })
    .eq("groupEventId", eventId)
    .eq("profileId", profileId)
    .gte("created_at", event.start_date)
    .lte("created_at", event.end_date);;

  if (error) {
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
    throw new Error(error.message);
  }

  return data as any;
};

// function to get the total points for a given exercise

export const getExercisePoints = (
  event: Tables<"groupEvent">,
  exercise: ExerciseData
) => {
  const exercisePoints = (event.exercise_points as ExercisePoints[]) || [];
  let totalPoints = 0;
  let baseValue = 1;
  for (const compExercise of exercisePoints) {
    if (exercise.info.id === compExercise.exerciseId) {
      baseValue = compExercise.points;
    }
  }

  for (const set of exercise.sets) {
    const setPoints =
      set.reps! * event.rep_multiplier! +
      set.weight! * event.weight_multiplier!;
    totalPoints += setPoints;
  }

  return totalPoints * baseValue;
};

export const getWorkoutMinutes = (start: number, end: number) => {
  const diffInMilliseconds = end - start;

  let totalSeconds = Math.floor(diffInMilliseconds / 1000);
  let minutes = totalSeconds / 60;

  return minutes;
};

// function to get the list of competitions the workout contributed to

export const getWorkoutPoints = (exercises: ExerciseData[], event: Tables<'groupEvent'>) => {
  let points = 0
  for (const exercise of exercises) {
    points += getExercisePoints(event, exercise)
  }

  return points
}

export const getWorkoutContributions = async (
  exercises: ExerciseData[],
  startTime: number,
  endTime: number,
  profileId: string
): Promise<WorkoutContribution[]> => {
  let events = await getUserEvents(profileId);
  events = events.filter(
    (event) =>
      new Date(event.start_date!).getTime() <= Date.now() &&
      new Date(event.end_date!).getTime() >= Date.now()
  );
  console.log("Events -- " + events)
  const contributions: WorkoutContribution[] = [];
  for (const event of events) {
    let value = 0;
    if (event.type == "total-time") {
      value = getWorkoutMinutes(startTime, endTime);
    } else {
      value = getWorkoutPoints(exercises, event)
    }
    contributions.push({
      competition: {
        id: event.id,
        title: event.title!,
      },
      value,
      type: event.type == "total-time" ? "minutes" : "points",
    });
  }
  console.log("Constributions -- " + contributions)

  return contributions;
};

export const getProfileMinutes = (workouts: EventWorkoutWithProfile[]) => {
  let mintues = 0;
  for (const workout of workouts) {
    mintues += getWorkoutMinutes(
      workout.workoutData.startTime,
      workout.workoutData.endTime!
    );
  }

  return mintues;
};

export const getProfilePoints = (
  event: Tables<"groupEvent">,
  workouts: EventWorkoutWithProfile[]
) => {
  let points = 0;
  for (const workout of workouts) {
    for (const exercise of workout.workoutData.exercises) {
      points += getExercisePoints(event, exercise);
    }
  }

  return points;
};

export const editEventDetails = async (
  {
    end_date,
    goal,
    weightMultiplier,
    repMultiplier,
  }: {
    end_date: Date;
    goal?: number | null;
    weightMultiplier?: number | null;
    repMultiplier?: number | null;
  },
  eventId: string
) => {
  const { data, error } = await supabase
    .from("groupEvent")
    .update({
      end_date,
      goal,
      rep_multiplier: repMultiplier,
      weight_multiplier: weightMultiplier,
    })
    .eq("id", eventId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const editTitle = async (title: string, eventId: string) => {
  const { data, error } = await supabase
    .from("groupEvent")
    .update({
      title,
    })
    .eq("id", eventId)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const editExercisePointValues = async (
  pointValues: ExercisePoints[],
  eventId: string
) => {
  const { data, error } = await supabase
    .from("groupEvent")
    .update({
      exercise_points: pointValues,
    })
    .eq("id", eventId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
