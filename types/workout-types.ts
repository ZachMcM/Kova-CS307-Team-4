export type SetData = {
  reps?: number 
  weight?: number
  done?: boolean
}

export type ExerciseData = {
  info: {
    id: string,
    name: string
  }
  sets: SetData[]
}

export type Workout = {
  templateId: string,
  templateName: string,
  startTime: number,
  endTime: number | null,
  exercises: ExerciseData[]
}