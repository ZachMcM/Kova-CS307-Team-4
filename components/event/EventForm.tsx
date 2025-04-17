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
import { Switch } from "../ui/switch";

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
      .nullish()
      .optional(),
    type: z.enum([
      "competition",
      "collaboration",
      "total-time",
      "single-workout",
    ]),
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

      if (data.type == "collaboration" && !data.goal) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Goal is required for Team Events",
          path: ["goal"],
        });
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

  const [goalOn, setGoalOn] = useState(true);

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
                  <RadioLabel>Team Challenge</RadioLabel>
                </Radio>
                <Radio value="competition" size="md">
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon} />
                  </RadioIndicator>
                  <RadioLabel>Points Race</RadioLabel>
                </Radio>
                <Radio value="total-time" size="md">
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon} />
                  </RadioIndicator>
                  <RadioLabel>Endurance Challenge</RadioLabel>
                </Radio>
                <Radio value="single-workout" size="md">
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon} />
                  </RadioIndicator>
                  <RadioLabel>Single Session Showdown</RadioLabel>
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
                    <VStack space="md">
                      <Text className="text-typography-950">
                        <Text className="font-bold text-typography-950">
                          Team Challenge
                        </Text>
                        : Work together, win together. In a Team Challenge,
                        everyone’s workout points contribute to a shared goal.
                        Hit the target as a group and celebrate the win with
                        your crew. Every effort counts!
                      </Text>
                      <Text className="text-typography-950">
                        <Text className="font-bold text-typography-950">
                          Points Race
                        </Text>
                        : It’s all about consistency and grind. Earn points from
                        every workout you log, and climb the leaderboard by
                        outworking the competition. The more you move, the
                        higher you score. Can you take the top spot?
                      </Text>
                      <Text className="text-typography-950">
                        <Text className="font-bold text-typography-950">
                          Endurance Challenge
                        </Text>
                        : Who can stay active the longest? This challenge ranks
                        users based on total workout time. Whether it’s yoga,
                        lifting, or cardio, every minute you train brings you
                        closer to victory.
                      </Text>
                      <Text className="text-typography-950">
                        <Text className="font-bold text-typography-950">
                          Single Session Showdown
                        </Text>
                        : Every workout is a chance to top the charts. In this
                        event, workouts are ranked individually — not by total
                        points per user. You can have multiple workouts on the
                        leaderboard, so bring your A-game every session.
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
            <VStack space="md">
              <HStack className="items-center">
                <Heading size="md">
                  Goal{" "}
                  {eventType &&
                    (eventType == "total-time"
                      ? "(Number of minutes)"
                      : "(Number of exercise points)")}
                </Heading>
                <Switch
                  size="sm"
                  value={goalOn}
                  onToggle={() => {
                    setGoalOn(!goalOn);
                  }}
                />
              </HStack>
              {goalOn && (
                <Input>
                  <InputField
                    onChangeText={onChange}
                    value={value?.toString()}
                    keyboardType="numeric"
                    placeholder="10000"
                  />
                </Input>
              )}
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
