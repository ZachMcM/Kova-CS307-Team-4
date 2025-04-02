import { getExercises } from "@/services/exerciseServices";
import { showErrorToast, showSuccessToast } from "@/services/toastServices";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
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
import { HStack } from "../ui/hstack";
import { CircleIcon } from "../ui/icon";
import { Input, InputField } from "../ui/input";
import {
  Radio,
  RadioGroup,
  RadioIcon,
  RadioIndicator,
  RadioLabel,
} from "../ui/radio";
import { Spinner } from "../ui/spinner";
import { Text } from "../ui/text";
import { useToast } from "../ui/toast";
import { VStack } from "../ui/vstack";
import EditExercisePointsForm from "./ExercisePointsForm";
import { Card } from "../ui/card";
import { newEvent } from "@/services/groupEventServices";
import { useRouter } from "expo-router";

const schema = z
  .object({
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
      .transform((x) => (x === null || x === undefined ? undefined : x)),
    repMultiplier: z
      .number({ required_error: "Must be a valid number" })
      .min(1, { message: "Multiplier cannot be less than 1" })
      .transform((x) => (x === null || x === undefined ? undefined : x)),
    title: z
      .string()
      .min(1, { message: "Title is required" })
      .max(250, { message: "Title must be less than 250 characters" }),
    start_date: z.date({ message: "Must be a valid date" }),
    end_date: z.date({ message: "Must be a valid date" }),
    goal: z
      .number({ required_error: "Must be a valid number" })
      .min(1, { message: "Goal cannot be less than 1" })
      .int()
      .transform((x) => (x === null || x === undefined ? undefined : x)),
    type: z.enum(["competition", "collaboration"]),
  })
  .refine((data) => data.start_date <= data.end_date, {
    message: "End date must be after start date",
    path: ["end_date"]
  });

export type NewEventValues = z.infer<typeof schema>;

export default function EventForm({ groupId }: { groupId: string }) {
  const form = useForm<NewEventValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      exercises: [],
      weightMultiplier: 1,
      repMultiplier: 1,
      start_date: new Date(),
      end_date: new Date(),
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
  const router = useRouter()

  const { mutate: createEvent, isPending } = useMutation({
    mutationFn: async (values: NewEventValues) => {
      // call to insert event
      const data = await newEvent(groupId, values)
      return data
    },
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({
        queryKey: ["group", { id: groupId }],
      });
      showSuccessToast(toast, "Successfully created new event");
      router.push({
        pathname: "/(tabs)/event/[id]",
        params: { id: data?.id }
      })
    },
    onError: (err) => {
      console.log(err);
      showErrorToast(toast, err.message);
    },
  });

  const [showAlert, setShowAlert] = useState(false);

  function onSubmit(values: FieldValues) {
    if ((values as NewEventValues).exercises.length != 0) {
      createEvent(values as NewEventValues);
    } else {
      setShowAlert(true);
    }
  }

  return (
    // TODO need to add other fields to UI
    <VStack space="2xl">
      <Controller
        control={form.control}
        name="title"
        render={({ field: { onChange, value }, fieldState }) => (
          <FormControl isInvalid={fieldState.invalid}>
            <VStack space="sm">
              <Heading size="md">Title</Heading>
              <Input>
                <InputField
                  onChangeText={onChange}
                  value={value}
                  placeholder="Enter a title..."
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
        name="type"
        render={({ field: { onChange, value }, fieldState }) => (
          <FormControl isInvalid={fieldState.invalid}>
            <VStack space="sm">
              <Heading size="md">Type</Heading>
              <RadioGroup value={value} onChange={onChange}>
                <Radio value="competition" size="md">
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon} />
                  </RadioIndicator>
                  <RadioLabel>Competition</RadioLabel>
                </Radio>
                <Radio value="collaboration" size="md">
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon} />
                  </RadioIndicator>
                  <RadioLabel>Collaboration</RadioLabel>
                </Radio>
              </RadioGroup>
            </VStack>
            <FormControlError>
              <FormControlErrorText>
                {fieldState.error?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        )}
      />
      <Controller
        control={form.control}
        name="goal"
        render={({ field: { onChange, value }, fieldState }) => (
          <FormControl isInvalid={fieldState.invalid}>
            <VStack space="sm">
              <Heading size="md">Goal</Heading>
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
                {fieldState.error?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        )}
      />
      <Card variant="outline">
        <VStack space="md">
          <Controller
            control={form.control}
            name="start_date"
            render={({ field: { onChange, value } }) => (
              <FormControl>
                <HStack className="items-center">
                  <Heading size="md">Start Date:</Heading>
                  <DateTimePicker
                    value={value}
                    design="material"
                    style={{
                      flex: 1,
                    }}
                    onChange={(_, date) => {
                      onChange(date);
                    }}
                  />
                </HStack>
              </FormControl>
            )}
          />
          <Controller
            control={form.control}
            name="end_date"
            render={({ field: { onChange, value } }) => (
              <FormControl isInvalid={form.formState.errors.end_date != undefined}>
                <HStack className="items-center">
                  <Heading size="md">End Date:</Heading>
                  <DateTimePicker
                    design="material"
                    style={{
                      flex: 1,
                    }}
                    value={value}
                    onChange={(_, date) => {
                      onChange(date);
                    }}
                  />
                </HStack>
                <FormControlError>
                  <FormControlErrorText>
                  {form.formState.errors.end_date?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
            )}
          />        
        </VStack>        
      </Card>
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
