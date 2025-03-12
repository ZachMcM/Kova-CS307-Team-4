export type ExercisePoints = {
  exerciseId: string,
  points: number
}

export type Contribution = {
  competition: {
    title: string,
    id: string
  },
  points: number
}