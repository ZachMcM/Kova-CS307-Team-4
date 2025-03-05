import { Session, User, WeakPassword } from "@supabase/auth-js";
import { Tables } from "./database.types";
import { ExerciseData } from "./workout-types";

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

export type ExtendedExercise = Tables<'exercise'> & {
  tags: Tables<'tag'>[]
}