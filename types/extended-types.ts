import { Session, User, WeakPassword } from "@supabase/auth-js";
import { Tables } from "./database.types";
import { ExerciseData, Workout } from "./workout-types";

// Extended template type that includes creator's profile
export type ExtendedTemplateWithCreator = Omit<Tables<'template'>, 'data'> & {
  data: ExerciseData[],
  creatorProfile: Tables<'profile'>
}

  export type ExtendedExercise = Tables<'exercise'> & {
    tags: Tables<'tag'>[]
  }

export type AuthAccountResponse = {
  user: User,
  session: Session,
  weakPassword?: WeakPassword
}

export type LikeRelation = {
  postId: string;
  userId: string;
  name: string
}

export type ExtendedGroupWithEvents = Tables<'group'> & {
  events: Tables<'groupEvent'>[]
}

export type ExtendedEventWithGroup = Tables<'groupEvent'> & {
  group: {
    id: string,
    title: string
  }
}

export type EventWithGroup = Tables<'groupEvent'> & {
  group: {
    id: string,
    title: string,
  }
}

export type EventWorkoutWithProfile = Omit<Tables<'eventWorkout'>, 'workoutData'> & {
  workoutData: Workout,
  profile: {
    name: string,
    username: string,
    id: string,
    avatar?: string
  }
}
