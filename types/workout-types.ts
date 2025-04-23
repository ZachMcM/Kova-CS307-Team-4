export type SetData = {
  reps?: number 
  weight?: number
  distance?: number
  time?: number
  done?: boolean
  cooldown?: boolean
}

export type ExerciseData = {
  info: {
    id: string,
    name: string,
    type?: string
  }
  sets: SetData[]
}

export type Workout = {
  templateId: string,
  templateName: string,
  startTime: number,
  endTime: number | null,
  pauseTime: string | null,
  exercises: ExerciseData[]
}

export type WorkoutData = {
  calories?: string;
  duration?: string;
  pauseTime: string;
  exercises: Array<{
      name: string;
      reps?: number;
      sets?: number;
      weight?: string;
  }>;
}