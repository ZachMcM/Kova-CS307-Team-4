import { useSession } from "@/components/SessionContext";
import { Box } from "@/components/ui/box";
import {
  Button,
  ButtonIcon,
  ButtonSpinner,
  ButtonText,
} from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import {
  CheckCircleIcon,
  ClockIcon,
  Icon,
  ShareIcon,
} from "@/components/ui/icon";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
} from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { useElapsedTime } from "@/hooks/useStopwatch";
import { calculateTime, formatCalculateTime } from "@/lib/calculateTime";
import {
  clearWorkout,
  getContributionsFromStorage,
  saveContributionsToStorage,
  setWorkoutEndTime,
} from "@/services/asyncStorageServices";
import { showErrorToast } from "@/services/toastServices";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, FieldValues, useFieldArray } from "react-hook-form";
import LiveExerciseForm from "./LiveExerciseForm";
import { LiveWorkoutValues, useLiveWorkout } from "./LiveWorkoutContext";
import { addCompetitionWorkout, getWorkoutContributions } from "@/services/groupServices";

export default function LiveWorkoutForm() {
  const { control, handleSubmit, watch, setValue, formState, getValues } =
    useLiveWorkout();
  const router = useRouter();

  const { session } = useSession();

  const { fields: exercises } = useFieldArray({
    control,
    name: "exercises",
  });

  const endTime = watch("endTime");
  const startTime = watch("startTime");
  const templateName = watch("templateName");

  const isWorkoutFinished = endTime != null;

  const { minutes, seconds, setIsStopped } = useElapsedTime(
    startTime,
    isWorkoutFinished
  );

  // Then create a function to calculate the current stats
  const getWorkoutStats = () => {
    const currentExercises = getValues("exercises");

    return {
      exerciseCount: currentExercises.length,
      totalSets: currentExercises.reduce(
        (acc, exercise) => acc + exercise.sets.length,
        0
      ),
      totalReps: currentExercises.reduce(
        (acc, exercise) =>
          acc +
          exercise.sets.reduce((setAcc, set) => setAcc + (set.reps || 0), 0),
        0
      ),
    };
  };

  const toast = useToast();

  const queryClient = useQueryClient();

  const { data: contributions, isPending: contributionsPending } = useQuery({
    queryKey: ["contributions"],
    queryFn: async () => {
      const contributions = await getContributionsFromStorage();
      return contributions;
    },
  });

  // mutation function for ending the workout in async storage
  const { mutate: finishWorkout, isPending: finishPending } = useMutation({
    mutationFn: async () => {
      setIsStopped(true);
      const endTime = Date.now();
      setValue("endTime", endTime);
      const contributions = await getWorkoutContributions(
        getValues("exercises"),
        session?.user.user_metadata.profileId
      );
      saveContributionsToStorage(contributions);
      queryClient.invalidateQueries({ queryKey: ["contributions"] });
      await setWorkoutEndTime(endTime);
    },
    onSuccess: () => {
      // we invalidate the queries so a refetch is done
      queryClient.invalidateQueries({ queryKey: ["live-workout"] });
      setModal(true);
    },
    onError: (e) => {
      console.log(e);
      showErrorToast(toast, e.message);
    },
  });

  // mutation function for actually submitting the data to the post in the database
  const { mutate: postWorkout, isPending: postPending } = useMutation({
    mutationFn: async (values: LiveWorkoutValues) => {
      // TODO interact with post workout (need to omit done because it is not needed in final iteration)
      console.log("Successfully posted workout", JSON.stringify(values));
      await clearWorkout();
      await addCompetitionWorkout(values, session?.user.user_metadata.profileId)
      return values;
    },
    onSuccess: (workoutData) => {
      // Prepare workout data for the post page
      console.log(
        "Workout completed successfully, preparing to navigate to post page"
      );
      queryClient.invalidateQueries({ queryKey: ["live-workout"] });

      const workoutStats = getWorkoutStats();
      const duration = formatCalculateTime(calculateTime(startTime, endTime!));

      const postData = {
        duration,
        exercises: workoutData.exercises,
        stats: workoutStats,
      };

      console.log(
        "Navigating to post screen with data:",
        JSON.stringify(postData)
      );

      // Add a small delay to ensure any pending operations complete
      setTimeout(() => {
        // Use router.push with the correct path format
        router.push({
          pathname: "/(tabs)/post",
          params: {
            workoutData: JSON.stringify(postData),
          },
        });
      }, 300);
    },
    onError: (e) => {
      console.log(e);
      showErrorToast(toast, e.message);
    },
  });

  async function onSubmit(values: FieldValues) {
    postWorkout(values as LiveWorkoutValues);
  }

  const [modal, setModal] = useState(isWorkoutFinished);

  return (
    <VStack space="4xl">
      <Box className="flex flex-row items-center justify-between">
        <HStack space="sm" className="items-center">
          <Box className="bg-secondary-500 p-1.5 rounded-md">
            <Icon size="xl" as={ClockIcon} />
          </Box>
          <Text size="xl" className="font-semibold">
            {!isWorkoutFinished
              ? `${minutes}:${seconds}`
              : formatCalculateTime(calculateTime(startTime, endTime!))}
          </Text>
        </HStack>
        <Button
          size="md"
          action="kova"
          isDisabled={formState.isLoading}
          onPress={() => finishWorkout()}
        >
          <ButtonText size="lg">Finish</ButtonText>
          {finishPending ? (
            <ButtonSpinner color="#FFF" />
          ) : (
            <ButtonIcon as={CheckCircleIcon} size="lg" />
          )}
        </Button>
      </Box>
      <VStack space="2xl">
        <Heading className="text-2xl">{templateName}</Heading>
        <VStack space="4xl">
          {exercises.map((exercise, i) => (
            <LiveExerciseForm
              key={exercise.info.id}
              exercise={exercise}
              index={i}
            />
          ))}
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
      <Modal isOpen={modal} size="md">
        <ModalBackdrop />
        <ModalContent>
          <ModalBody>
            <VStack space="2xl" className="items-center">
              <Text size="4xl">🏆</Text>
              <VStack className="items-center">
                <Heading size="2xl">Workout Complete</Heading>
                <Text>Great job on finishing your workout!</Text>
              </VStack>
              <VStack space="2xl" className="w-full">
                <HStack className="justify-between items-center">
                  <Heading size="md">Duration</Heading>
                  <Heading size="2xl">
                    {formatCalculateTime(calculateTime(startTime, endTime!))}
                  </Heading>
                </HStack>
                <HStack className="justify-between items-center">
                  <Heading size="md">Exercises</Heading>
                  <Heading size="2xl">
                    {getWorkoutStats().exerciseCount}
                  </Heading>
                </HStack>
                <HStack className="justify-between items-center">
                  <Heading size="md">Total Sets</Heading>
                  <Heading size="2xl">{getWorkoutStats().totalSets}</Heading>
                </HStack>
                <HStack className="justify-between items-center">
                  <Heading size="md">Total Reps</Heading>
                  <Heading size="2xl">{getWorkoutStats().totalReps}</Heading>
                </HStack>
                <VStack space="md">
                  <Heading size="lg" className="text-center">
                    Competition Data
                  </Heading>
                  <Divider />

                  {contributionsPending ? (
                    <Spinner />
                  ) : (
                    contributions &&
                    contributions.map((contribution) => (
                      <HStack key={contribution.points * Math.random()} className="justify-between items-center">
                        <Heading size="md">
                          {contribution.competition.title}
                        </Heading>
                        <Heading size="lg">
                          {contribution.points} Points
                        </Heading>
                      </HStack>
                    ))
                  )}
                </VStack>
              </VStack>
              <Button
                size="lg"
                action="kova"
                className="w-full"
                onPress={() => {
                  // Get the form values
                  const values = getValues();
                  console.log(
                    "Post workout button clicked",
                    JSON.stringify(values)
                  );

                  // Close the modal
                  setModal(false);

                  // Submit the form data
                  handleSubmit(onSubmit)();
                }}
              >
                <ButtonText>Post Workout</ButtonText>
                {postPending ? (
                  <ButtonSpinner color="#FFF" />
                ) : (
                  <ButtonIcon as={ShareIcon} size="lg" />
                )}
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
