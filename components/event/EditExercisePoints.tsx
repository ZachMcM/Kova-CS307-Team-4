import {
  ExercisePointsFormValues,
  pointValuesSchema,
} from "@/schemas/pointValuesSchema";
import { showErrorToast, showSuccessToast } from "@/services/toastServices";
import { Tables } from "@/types/database.types";
import { ExtendedExercise } from "@/types/extended-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FieldValues, useForm } from "react-hook-form";
import { Button, ButtonIcon, ButtonSpinner, ButtonText } from "../ui/button";
import { HStack } from "../ui/hstack";
import { CheckIcon, CloseIcon } from "../ui/icon";
import { useToast } from "../ui/toast";
import { VStack } from "../ui/vstack";
import EditExercisePointsForm from "./EditExercisePointsForm";
import { editExercisePointValues } from "@/services/groupEventServices";

export default function EditExercisePoints({
  event,
  setEditPointValues,
  allExercises,
}: {
  event: Tables<"groupEvent">;
  setEditPointValues: React.Dispatch<React.SetStateAction<boolean>>;
  allExercises: ExtendedExercise[];
}) {
  const form = useForm<ExercisePointsFormValues>({
    resolver: zodResolver(pointValuesSchema),
    defaultValues: {
      exercises: event.exercise_points as any,
    },
  });

  const toast = useToast();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: ExercisePointsFormValues) => {
      const data = await editExercisePointValues(
        values.exercises.map(({ exerciseId, exerciseName, points }) => ({
          exerciseId,
          exerciseName,
          points: points || 1,
        })),
        event.id
      );

      return data
    },
    onSuccess: (data) => {
      console.log(data);
      showSuccessToast(toast, "Successfully updated exercise point values");
      queryClient.invalidateQueries({
        queryKey: ["event", { id: event.id }],
      });
      setEditPointValues(false);
    },
    onError: (err) => {
      console.log(err);
      showErrorToast(toast, err.message);
    },
  });

  function onSubmit(values: FieldValues) {
    console.log(values);
    mutate(values as ExercisePointsFormValues);
  }

  return (
    <VStack space="2xl">
      <EditExercisePointsForm allExercises={allExercises} form={form} />
      <HStack space="sm">
        {setEditPointValues && (
          <Button action="secondary" onPress={() => setEditPointValues(false)}>
            <ButtonText>Cancel</ButtonText>
            <ButtonIcon as={CloseIcon} />
          </Button>
        )}
        <Button action="kova" onPress={form.handleSubmit(onSubmit)}>
          <ButtonText>Save</ButtonText>
          {isPending ? (
            <ButtonSpinner size="small" color="#FFF" />
          ) : (
            <ButtonIcon as={CheckIcon} />
          )}
        </Button>
      </HStack>
    </VStack>
  );
}
