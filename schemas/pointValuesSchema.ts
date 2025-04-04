import * as z from "zod";

export const pointValuesSchema = z.object({
  exercises: z
    .object({
      exerciseId: z.string(),
      exerciseName: z.string(),
      points: z.coerce
        .number({ invalid_type_error: "Must be a valid number" })
        .min(1, { message: "Points cannot be less than 1" })
        .nonnegative()
        .nullish(),
    })
    .array(),
});

export type ExercisePointsFormValues = z.infer<typeof pointValuesSchema>;
