export type ExercisePoints = {
  exerciseId: string,
  exerciseName: string
  points: number
}

export type WorkoutContribution = {
  competition: {
    title: string,
    id: string,
  },
  value: number,
  type: "minutes" | "points"
}

export type GroupWorkout = {
    id: string,
    groupEventId: string,
    profileId: string,
    created_at: string,
    workoutData: string
}