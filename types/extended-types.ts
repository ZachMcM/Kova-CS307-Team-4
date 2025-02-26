import { Tables } from "@/types/database.types";
import { ExerciseData } from "./workout-types";

// Extended template type that includes creator's profile
export type ExtendedTemplateWithCreator = Omit<Tables<'Template'>, 'data'> & {
  data: ExerciseData[]
  creator: {
    profile: Tables<'Profile'>
  },
  user: {
    id: string,
    email: string
  }
}