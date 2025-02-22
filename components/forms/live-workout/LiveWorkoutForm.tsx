import { Box } from "@/components/ui/box";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { ClockIcon, Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { useElapsedTime } from "@/hooks/useStopwatch";
import { clearWorkout } from "@/services/asyncStorageServices";
import { showErrorToast } from "@/services/toastServices";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Controller, FieldValues, useFieldArray } from "react-hook-form";
import LiveExerciseForm from "./LiveExerciseForm";
import { LiveWorkoutValues, useLiveWorkout } from "./LiveWorkoutContext";

export default function LiveWorkoutForm() {
  const { control, handleSubmit, getValues } = useLiveWorkout();

  const { fields: exercises } = useFieldArray({
    control,
    name: "exercises",
  });

  const { minutes, seconds } = useElapsedTime(getValues("startTime"));

  const toast = useToast();

  const router = useRouter();

  const queryClient = useQueryClient();

  const { mutate: finishWorkout, isPending } = useMutation({
    mutationFn: async (values: LiveWorkoutValues) => {
      console.log(values);
      for (const exercise of values.exercises) {
        console.log(exercise);
      }
      await clearWorkout();
      // TODO implement workout clear
    },
    onSuccess: () => {
      // TODO redirect to post workout page
      // we invalidate the queries so a refetch is done
      queryClient.invalidateQueries({ queryKey: ["live-workout"] });
    },
    onError: (e) => {
      console.log(e);
      showErrorToast(toast, e.message);
    },
  });

  async function onSubmit(values: FieldValues) {
    finishWorkout(values as LiveWorkoutValues);
  }

  return (
    <VStack space="4xl">
      <Box className="flex flex-row items-center justify-between">
        <HStack space="sm" className="items-center">
          <Box className="bg-secondary-500 p-1.5 rounded-md">
            <Icon size="xl" as={ClockIcon} />
          </Box>
          <Text size="xl" className="text-typography-1 font-medium">
            {minutes}:{seconds}
          </Text>
        </HStack>
        <Button size="md" action="kova" onPress={handleSubmit(onSubmit)}>
          <ButtonText size="lg">Finish</ButtonText>
          {isPending && <ButtonSpinner color="#FFF" />}
        </Button>
      </Box>
      <VStack space="2xl">
        <Heading className="text-2xl">{getValues("templateName")}</Heading>
        <VStack space="4xl">
          <VStack space="2xl">
            {exercises.map((exercise, i) => (
              <LiveExerciseForm
                key={exercise.info.id}
                exercise={exercise}
                index={i}
              />
            ))}
          </VStack>
          <Controller
            control={control}
            name="exercises"
            rules={{ required: true }}
            render={({ fieldState }) => (
              <FormControl isInvalid={fieldState.invalid} size="md">
                <FormControlError>
                  <FormControlErrorText>
                    {fieldState.error?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
            )}
          />
        </VStack>
      </VStack>
    </VStack>
  );
}
