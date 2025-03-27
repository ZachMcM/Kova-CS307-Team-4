import { getExercises } from "@/services/exerciseServices";
import { showErrorToast, showSuccessToast } from "@/services/toastServices";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, FieldValues, useForm } from "react-hook-form";
import * as z from "zod";
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from "../ui/alert-dialog";
import { Button, ButtonSpinner, ButtonText } from "../ui/button";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from "../ui/form-control";
import { Heading } from "../ui/heading";
import { Input, InputField } from "../ui/input";
import { Spinner } from "../ui/spinner";
import { Text } from "../ui/text";
import { useToast } from "../ui/toast";
import { VStack } from "../ui/vstack";
import EditExercisePointsForm from "./ExercisePointsForm";

// TODO need to add other fields to schema
const schema = z.object({
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
  weightMultiplier: z
    .number({ required_error: "Must be a valid number" })
    .min(1, { message: "Multiplier cannot be less than 1" })
    .nullish()
    .transform((x) => (x === null || x === undefined ? undefined : x)),
  repMultiplier: z
    .number({ required_error: "Must be a valid number" })
    .min(1, { message: "Multiplier cannot be less than 1" })
    .nullish()
    .transform((x) => (x === null || x === undefined ? undefined : x)),
});

export type NewEventPointsValues = z.infer<typeof schema>;

export default function EventForm({ groupId }: { groupId: string }) {
  const form = useForm<NewEventPointsValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      exercises: [],
      weightMultiplier: 1,
      repMultiplier: 1,
    },
  });

  const { data: allExercises, isPaused: exercisesPending } = useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      const exercises = await getExercises();
      return exercises;
    },
  });

  const toast = useToast();
  const queryClient = useQueryClient();

  const { mutate: createEvent, isPending } = useMutation({
    mutationFn: async (values: NewEventPointsValues) => {
      // call to insert event
      console.log(values);
    },
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({
        queryKey: ["group", { id: groupId }],
      });
      showSuccessToast(toast, "Successfully created new event");
    },
    onError: (err) => {
      console.log(err);
      showErrorToast(toast, err.message);
    },
  });

  const [showAlert, setShowAlert] = useState(false);

  function onSubmit(values: FieldValues) {
    if ((values as NewEventPointsValues).exercises.length != 0) {
      createEvent(values as NewEventPointsValues);
    } else {
      setShowAlert(true);
    }
  }

  return (
    // TODO need to add other fields to UI
    <VStack space="2xl">
      <Controller
        control={form.control}
        name="weightMultiplier"
        render={({ field: { onChange, value }, fieldState }) => (
          <FormControl isInvalid={fieldState.invalid}>
            <VStack space="sm">
              <Heading size="md">Weight Multiplier</Heading>
              <Input>
                <InputField
                  onChangeText={(text) => onChange(Number(text) || 0)}
                  value={value?.toString() || "0"}
                  keyboardType="numeric"
                />
              </Input>
            </VStack>
            <FormControlError>
              <FormControlErrorText>
                {fieldState.error?.message || "Invalid weight multiplier"}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        )}
      />
      <Controller
        control={form.control}
        name="repMultiplier"
        render={({ field: { onChange, value }, fieldState }) => (
          <FormControl isInvalid={fieldState.invalid}>
            <VStack space="sm">
              <Heading size="md">Rep Multiplier</Heading>
              <Input>
                <InputField
                  onChangeText={(text) => onChange(Number(text) || 0)}
                  value={value?.toString() || "0"}
                  keyboardType="numeric"
                />
              </Input>
            </VStack>
            <FormControlError>
              <FormControlErrorText>
                {fieldState.error?.message || "Invalid rep multiplier"}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        )}
      />
      <VStack space="sm">
        <Heading size="md">Edit Exercise Point Values</Heading>
        {exercisesPending ? (
          <Spinner />
        ) : (
          <EditExercisePointsForm form={form} allExercises={allExercises!} />
        )}
      </VStack>
      <Button action="kova" size="lg" onPress={form.handleSubmit(onSubmit)}>
        <ButtonText>Save Event</ButtonText>
        {isPending && <ButtonSpinner color="#FFF" />}
      </Button>
      <AlertDialog isOpen={showAlert}>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading size="md">
              You have no exercise point values configured!
            </Heading>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text size="sm">
              Are you so you want to continue with out any exercise point values
              configured? All exercises will default to 1 point.
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              variant="outline"
              action="secondary"
              size="sm"
              onPress={() => setShowAlert(false)}
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              size="sm"
              onPress={() => {
                setShowAlert(false);
                createEvent(form.getValues());
              }}
            >
              <ButtonText>Continue</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </VStack>
  );
}
