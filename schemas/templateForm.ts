import * as z from "zod";
import { exerciseData } from "./exerciseData";

export const templateFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name cannot be empty" })
    .max(100, { message: "Name cannot be more than 100 characters" }),
  // the object with the actual exercise and the sets array
  data: exerciseData
});
