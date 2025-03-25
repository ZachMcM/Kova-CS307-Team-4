import * as z from "zod";

export const pointValuesSchema = z.object({
  exercises: z
    .object({
      exerciseId: z.string(),
      exerciseName: z.string(),
      points: z
        .number({ required_error: "Must be a valid number" })
        .nonnegative()
        .nullish()
        .transform((x) => (x === null || x === undefined ? undefined : x)),
    })
    .array(),
});

export type ExercisePointsFormValues = z.infer<typeof pointValuesSchema>;