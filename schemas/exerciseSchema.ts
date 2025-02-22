import * as z from "zod";

export const exerciseSchema = z
  .object({
    // the actual exercise
    info: z.object(
      {
        id: z.string(),
        name: z.string(),
      },
    ),
    // an array of sets
    sets: z
      .object(
        {
          reps: z
            .number({ required_error: "Must be a valid number" })
            .int()
            .nonnegative()
            .nullish()
            .transform((x) => (x ? x : undefined)),
          weight: z
            .number({ required_error: "Must be a valid number" })
            .nonnegative()
            .nullish()
            .transform((x) => (x ? x : undefined)),
        },
      )
      .array(),
  })
  .array()
  .nonempty();
