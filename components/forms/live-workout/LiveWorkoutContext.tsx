import { exerciseSchema } from "@/schemas/exerciseSchema";
import { updateWorkout } from "@/services/asyncStorageServices";
import { Workout } from "@/types/workout-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { createContext, ReactNode, useContext, useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import * as z from "zod";

const LiveWorkoutContext = createContext<LiveWorkoutProviderValues | null>(
  null
);

const liveWorkoutSchema = z.object({
  templateId: z.string().nonempty(),
  templateName: z.string().nonempty(),
  startTime: z.number(),
  endTime: z.number().nullable(),
  exercises: exerciseSchema,
});

export type LiveWorkoutValues = z.infer<typeof liveWorkoutSchema>;
export type LiveWorkoutProviderValues = UseFormReturn<LiveWorkoutValues>;

export function LiveWorkoutProvider({
  children,
  initWorkout,
}: {
  children: ReactNode;
  initWorkout: Workout;
}) {
  const form = useForm<LiveWorkoutValues>({
    resolver: zodResolver(liveWorkoutSchema),
    defaultValues: {
      templateId: initWorkout.templateId,
      templateName: initWorkout.templateName,
      startTime: initWorkout.startTime,
      endTime: initWorkout.endTime,
      exercises: initWorkout.exercises,
    },
  });

  // we need to continually update the async storage whenever exercises changes

  const { watch } = form;

  useEffect(() => {
    const subscription = watch(async (updatedValues) => {
      updateWorkout({
        templateId: updatedValues.templateId!,
        templateName: updatedValues.templateName!,
        startTime: updatedValues.startTime!,
        endTime: updatedValues.endTime || null,
        exercises: updatedValues.exercises
          ? updatedValues.exercises?.map((exercise) => ({
              info: {
                id: exercise?.info?.id || "",
                name: exercise?.info?.name || "",
              },
              sets: exercise?.sets
                ? exercise?.sets?.map((set) => ({
                    reps: set?.reps || 0,
                    weight: set?.weight || 0,
                  }))
                : [],
            }))
          : [],
      });
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  return (
    <LiveWorkoutContext.Provider value={form}>
      {children}
    </LiveWorkoutContext.Provider>
  );
}

export function useLiveWorkout() {
  return useContext(LiveWorkoutContext) as LiveWorkoutProviderValues;
}
