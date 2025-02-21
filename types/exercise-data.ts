import { ExtendedExerciseWithTags } from "./extended-types"

export type SetData = {
  reps?: string 
  weight?: string
}

export type ExerciseData = {
  info: ExtendedExerciseWithTags
  sets: SetData[]
}