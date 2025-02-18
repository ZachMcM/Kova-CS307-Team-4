export type SetData = {
  reps: number
  weight: number
}

export type WorkoutData = {
  exercise_name: string
  exercise_id: string
  sets: SetData[]
}