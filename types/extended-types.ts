import { Tables } from "@/types/database.types";
import { ExerciseData } from "./exercise-data";

// Extended template type that includes creator's profile
export type ExtendedTemplateWithCreator = Omit<Tables<'Template'>, 'data'> & {
  data: ExerciseData[]
  creator: {
    profile: Tables<'Profile'>
  }
}

export type ExtendedExerciseWithTags = Tables<'Exercise'> & {
  tags: Array<Tables<'Tag'>>
}