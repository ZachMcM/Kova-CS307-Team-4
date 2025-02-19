const exerciseErrorMessages = [
  "Reps cannot be negative",
  "Weight cannot be negative",
  "Reps must be a valid number",
  "Weight must be a valid number",
  "You must have at least 1 exercise"
] as const

export type ExerciseErrorMessage = typeof exerciseErrorMessages[number]