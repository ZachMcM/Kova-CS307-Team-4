import * as z from "zod";

export const exerciseSchema = z
  .object({
    // the actual exercise
    info: z.object({
      id: z.string(),
      name: z.string(),
    }),
    // an array of sets
    sets: z
      .object({
        reps: z
          .number({ required_error: "Must be a valid whole number" })
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
      })
      .array()
      .nonempty({ message: "You must have a set" }),
  })
  .array()
  .nonempty({ message: "Exercises cannot be empty" });
