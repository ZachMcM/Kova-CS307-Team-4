export type ExercisePoints = {
  exerciseId: string,
  exerciseName: string
  points: number
}

export type WorkoutContribution = {
  competition: {
    title: string,
    id: string
  },
  points: number
}