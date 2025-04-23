import { supabase } from "@/lib/supabase";
import { CollabView, CompeteView, GroupEvent } from "@/types/collab-types";
import { GroupWorkout } from "@/types/event-types";
import { EventWithGroup } from "@/types/extended-types";

export async function getEvent(eventId: string): Promise<GroupEvent> {
  const { data, error } = await supabase
    .from("groupEvent")
    .select(
      "id,groupId,title,start_date,end_date,exercise_points,rep_multiplier,weight_multiplier,goal,type"
    )
    .eq("id", eventId);
  if (error) {
    throw new Error(error.message);
  }
  return getGroupEvent(data[0]);
}

export async function getAllEvents(groupId: string): Promise<GroupEvent[]> {
  const { data, error } = await supabase
    .from("groupEvent")
    .select(
      "id,groupId,title,start_date,end_date,exercise_points,rep_multiplier,weight_multiplier,goal,type"
    )
    .eq("groupId", groupId);
  if (error) {
    throw new Error(error.message);
  }
  const events = data.map((row, id) => {
    return getGroupEvent(row);
  });
  return events as GroupEvent[];
}

export async function getCurrentEvents(groupId: string): Promise<EventWithGroup[]> {
  const time = new Date(Date.now()).toISOString()
  console.log("date: " + time)
  const {data, error} = await supabase
    .from("groupEvent")
    .select(
      "*,group:groupId(id,title)")
    .eq("groupId", groupId)
    .lte("start_date", time)
    .gte("end_date", time)
  if (error) {
    throw new Error(error.message)
  }
  const events = [] as EventWithGroup[]
  data.forEach((event) => events.push(event));
  return events
}

export async function getFutureEvents(groupId: string): Promise<EventWithGroup[]> {
  const time = new Date(Date.now()).toISOString()
  const {data, error} = await supabase
    .from("groupEvent")
    .select(
      "*,group:groupId(id,title)")
    .eq("groupId", groupId)
    .gte("start_date", time)
  if (error) {
    throw new Error(error.message)
  }
  const events = [] as EventWithGroup[]
  data.forEach((event) => events.push(event));
  return events
}

export async function getPastEvents(groupId: string): Promise<EventWithGroup[]> {
  const time = new Date(Date.now()).toISOString()
  const {data, error} = await supabase
    .from("groupEvent")
    .select(
      "*,group:groupId(id,title)")
    .eq("groupId", groupId)
    .lte("end_date", time)
  if (error) {
    throw new Error(error.message)
  }
  const events = [] as EventWithGroup[]
  data.forEach((event) => events.push(event));
  return events
}

export async function getGroupWorkouts(
  eventId: string
): Promise<GroupWorkout[]> {
  const { data, error } = await supabase
    .from("eventWorkout")
    .select("id,groupEventId,profileId,created_at,workoutData")
    .eq("groupEventId", eventId);
  if (error) {
    throw new Error(error.message);
  }
  const workouts = data.map((row, id) => {
    return {
      id: row.id,
      groupEventId: row.groupEventId,
      profileId: row.profileId,
      created_at: row.created_at,
      workoutData: row.workoutData,
    };
  });
  return workouts as GroupWorkout[];
}

export function getTotalPoints(
  workouts: GroupWorkout[],
  presets: string
): Map<string, number> {
  const points = new Map<string, number>();
  for (const workout of workouts) {
    points.set(
      workout.id,
      (points.has(workout.id) ? points.get(workout.id)! : 0) +
        getPoints(workout.workoutData, presets)
    );
  }
  return points;
}

export function getPoints(workoutData: string, presets: string) {
  return 0;
}

function getGroupEvent(data: {
  id: any;
  groupId: any;
  title: any;
  start_date: any;
  end_date: any;
  exercise_points: any;
  rep_multiplier: any;
  weight_multiplier: any;
  goal: any;
  type: any;
}): GroupEvent {
  if (data.type === "competition") {
    return getCompeteEvent(data);
  } else {
    return getCollabEvent(data);
  }
}

function getCollabEvent(data: {
  id: any;
  groupId: any;
  title: any;
  start_date: any;
  end_date: any;
  exercise_points: any;
  rep_multiplier: any;
  weight_multiplier: any;
  goal: any;
}): CollabView {
  return {
    id: data.id,
    groupId: data.groupId,
    title: data.title,
    start_date: data.start_date,
    end_date: data.end_date,
    exercise_points: data.exercise_points,
    rep_multiplier: data.rep_multiplier,
    weight_multiplier: data.weight_multiplier,
    goal: data.goal,
  };
}

function getCompeteEvent(data: {
  id: any;
  groupId: any;
  title: any;
  start_date: any;
  end_date: any;
  exercise_points: any;
  rep_multiplier: any;
  weight_multiplier: any;
}): CompeteView {
  return {
    id: data.id,
    groupId: data.groupId,
    title: data.title,
    start_date: data.start_date,
    end_date: data.end_date,
    exercise_points: data.exercise_points,
    rep_multiplier: data.rep_multiplier,
    weight_multiplier: data.weight_multiplier,
  };
}
