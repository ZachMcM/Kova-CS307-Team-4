import { getExercises } from "@/services/exerciseServices";
import { showErrorToast, showSuccessToast } from "@/services/toastServices";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, FieldValues, useForm, useWatch } from "react-hook-form";
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
import { CircleIcon, CloseIcon, Icon, InfoIcon } from "../ui/icon";
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
import { Pressable } from "../ui/pressable";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
} from "../ui/modal";
import { View } from "react-native";

const schema = z
  .object({
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
    weightMultiplier: z.coerce
      .number({ invalid_type_error: "Must be a valid number" })
      .nullish(),
    repMultiplier: z.coerce
      .number({ invalid_type_error: "Must be a valid number" })
      .nullish(),
    title: z
      .string()
      .min(1, { message: "Title is required" })
      .max(250, { message: "Title must be less than 250 characters" }),
    start_date: z.date({ message: "Must be a valid date" }),
    end_date: z.date({ message: "Must be a valid date" }),
    goal: z.coerce
      .number({ invalid_type_error: "Must be a valid number" })
      .min(1, { message: "Goal cannot be less than 1" })
      .nonnegative()
      .nullish(),
    type: z.enum(["competition", "collaboration", "total-time"]),
  })
  .superRefine((data, ctx) => {
    // Validate that end_date is after start_date
    if (data.start_date > data.end_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be after start date",
        path: ["end_date"],
      });
    }

    // Only validate multipliers if type is not "total-time"
    if (data.type !== "total-time") {
      if (
        data.weightMultiplier !== null &&
        data.weightMultiplier !== undefined
      ) {
        if (data.weightMultiplier < 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Weight Multiplier cannot be less than 1",
            path: ["weightMultiplier"],
          });
        }
      }

      if (data.repMultiplier !== null && data.repMultiplier !== undefined) {
        if (data.repMultiplier < 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Rep Multiplier cannot be less than 1",
            path: ["repMultiplier"],
          });
        }
      }
    }
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

  const { data: allExercises, isPending: exercisesPending } = useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      const exercises = await getExercises();
      return exercises;
    },
  });

  const toast = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate: createEvent, isPending } = useMutation({
    mutationFn: async (values: NewEventValues) => {
      // call to insert event
      const data = await newEvent(groupId, values);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["group", { id: groupId }],
      });
      showSuccessToast(toast, "Successfully created new event");
      router.push({
        pathname: "/(tabs)/event/[id]",
        params: { id: data?.id },
      });
    },
    onError: (err) => {
      console.log(err);
      showErrorToast(toast, err.message);
    },
  });

  const [showAlert, setShowAlert] = useState(false);

  function onSubmit(values: FieldValues) {
    if (eventType == "total-time") {
      createEvent(values as NewEventValues);
    } else {
      if ((values as NewEventValues).exercises.length != 0) {
        createEvent(values as NewEventValues);
      } else {
        setShowAlert(true);
      }
    }
  }

  const [typeModal, setTypeModal] = useState(false);

  const eventType = form.watch("type");

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
              <HStack space="sm" className="items-center">
                <Heading size="md">Type</Heading>
                <Pressable onPress={() => setTypeModal(true)}>
                  <Icon size="md" as={InfoIcon} />
                </Pressable>
              </HStack>
              <RadioGroup value={value} onChange={onChange}>
                <Radio value="collaboration" size="md">
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon} />
                  </RadioIndicator>
                  <RadioLabel>Collaboration</RadioLabel>
                </Radio>
                <Radio value="competition" size="md">
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon} />
                  </RadioIndicator>
                  <RadioLabel>Default Competition</RadioLabel>
                </Radio>
                <Radio value="total-time" size="md">
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon} />
                  </RadioIndicator>
                  <RadioLabel>Total Time Competition</RadioLabel>
                </Radio>
              </RadioGroup>
            </VStack>
            <FormControlError>
              <FormControlErrorText>
                {fieldState.error?.message}
              </FormControlErrorText>
            </FormControlError>
            <Modal
              isOpen={typeModal}
              onClose={() => setTypeModal(false)}
              size="md"
              closeOnOverlayClick
            >
              <ModalBackdrop />
              <ModalContent>
                <ModalHeader>
                  <Heading size="lg">About Event Types</Heading>
                  <ModalCloseButton>
                    <Icon
                      as={CloseIcon}
                      className="stroke-background-400 group-[:hover]/modal-close-button:stroke-background-700 group-[:active]/modal-close-button:stroke-background-900 group-[:focus-visible]/modal-close-button:stroke-background-900"
                    />
                  </ModalCloseButton>
                </ModalHeader>
                <ModalBody className="mt-6">
                  <Text size="md" className="text-typography-700">
                    <VStack space="sm">
                      <Text className="text-typography-950">
                        <Text className="font-bold text-typography-950">
                          Collaboration
                        </Text>
                        : Aggregate everyones' workout points together to work
                        toward a common goal.
                      </Text>
                      <Text className="text-typography-950">
                        <Text className="font-bold text-typography-950">
                          Default Competition
                        </Text>
                        : Rank users based on an aggregation of their workout
                        points percentage to the goal, and whoever reaches the
                        goal first wins.
                      </Text>
                      <Text className="text-typography-950">
                        <Text className="font-bold text-typography-950">
                          Total Time Competition
                        </Text>
                        : Rank users based on an aggregation of their workout
                        times, and whoever reaches the goal first wins.
                      </Text>

                      <Text className="text-typography-950">
                        <Text className="font-bold text-typography-950">
                          Personal Best Competition
                        </Text>
                        : Rank users based on singular workout point totals, and
                        the user that had the singular workout with the most
                        points by the end of the event wins.
                      </Text>
                    </VStack>
                  </Text>
                </ModalBody>
              </ModalContent>
            </Modal>
          </FormControl>
        )}
      />
      <Controller
        control={form.control}
        name="goal"
        render={({ field: { onChange, value }, fieldState }) => (
          <FormControl isInvalid={fieldState.invalid}>
            <VStack space="sm">
              <Heading size="md">
                Goal{" "}
                {eventType &&
                  (eventType == "total-time"
                    ? "(Number of minutes)"
                    : "(Number of exercise points)")}
              </Heading>
              <Input>
                <InputField
                  onChangeText={onChange}
                  value={value?.toString()}
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
                    minimumDate={new Date()}
                  />
                </HStack>
              </FormControl>
            )}
          />
          <Controller
            control={form.control}
            name="end_date"
            render={({ field: { onChange, value } }) => (
              <FormControl
                isInvalid={form.formState.errors.end_date != undefined}
              >
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
                    minimumDate={new Date()}
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
      {eventType != "total-time" && (
        <>
          <Controller
            control={form.control}
            name="weightMultiplier"
            render={({ field: { onChange, value }, fieldState }) => (
              <FormControl isInvalid={fieldState.invalid}>
                <VStack space="sm">
                  <Heading size="md">Weight Multiplier</Heading>
                  <Input>
                    <InputField
                      onChangeText={onChange}
                      value={value?.toString()}
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
                      onChangeText={onChange}
                      value={value?.toString()}
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
              <EditExercisePointsForm
                form={form}
                allExercises={allExercises!}
              />
            )}
          </VStack>
        </>
      )}
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
