import { ExerciseData } from "@/types/workout-types";

// this function is used to take an ExerciseData[] and format it so it can be a form default value
export function formatExerciseDataToForm(exercises: ExerciseData[]) {
  return exercises.map((exercise) => ({
    info: {
      id: exercise.info.id,
      name: exercise.info.name!,
    },
    sets: exercise.sets.map((set) => ({
      reps: set.reps || 0,
      weight: set.weight || 0,
    })),
  }));
}