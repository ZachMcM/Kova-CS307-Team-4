export type ExercisePoints = {
  exerciseId: string,
  points: number
}

export type WorkoutContribution = {
  competition: {
    title: string,
    id: string
  },
  points: number
}