import * as z from "zod";

export const liveExerciseSchema = z
  .object({
    // the actual exercise
    info: z.object({
      id: z.string(),
      name: z.string(),
      type: z.string().optional()
    }),
    // an array of sets
    sets: z
      .object({
        reps: z
          .number({ required_error: "Must be a valid number" })
          .int()
          .nonnegative()
          .nullish()
          .transform((x) => (x === null || x === undefined ? undefined : x)),
        weight: z
          .number({ required_error: "Must be a valid number" })
          .nonnegative()
          .nullish()
          .transform((x) => (x === null || x === undefined ? undefined : x)),
        distance: z
          .number({ required_error: "Must be a valid number" })
          .nonnegative()
          .nullish()
          .transform((x) => (x === null || x === undefined ? undefined : x)),
        time: z
          .number({ required_error: "Must be a valid time" })
          .nonnegative()
          .nullish()
          .transform((x) => (x === null || x === undefined ? undefined : x)),
        done: z.boolean().default(false)
      })
      .array()
      .nonempty({ message: "You must have a set" }),
  })
  .array()
  .nonempty({ message: "Exercises cannot be empty" });
