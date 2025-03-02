import { Tables } from "./database.types";
import { ExerciseData } from "./workout-types";

// Extended template type that includes creator's profile
export type ExtendedTemplateWithCreator = Omit<Tables<'template'>, 'data'> & {
  data: ExerciseData[],
  creatorProfile: Tables<'profile'>
}