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
import { takeRest, useElapsedTime } from "@/hooks/useStopwatch";
import { calculateTime, formatCalculateTime } from "@/lib/calculateTime";
import {
  clearWorkout,
  getContributionsFromStorage,
  saveContributionsToStorage,
  setWorkoutEndTime,
} from "@/services/asyncStorageServices";
import { showErrorToast, showSuccessToast } from "@/services/toastServices";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, FieldValues, useFieldArray } from "react-hook-form";
import LiveExerciseForm from "./LiveExerciseForm";
import { LiveWorkoutValues, useLiveWorkout } from "./LiveWorkoutContext";
import {
  addEventWorkout,
  getWorkoutContributions,
} from "@/services/groupEventServices";

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
  const [pauseTime, setPauseTime] = useState(0);
  const [isPaused, setPaused] = useState(false);

  // const [endPauseTime, endPauseStart] = useState(Date.now())
  const templateName = watch("templateName");

  const isWorkoutFinished = endTime != null;
  /*
  const {minutes: pauseMin, seconds: pauseSec, setIsStopped: setIsPaused } = useElapsedTime(
    pauseTime,
    isWorkoutPaused
  ) 
  */

  const { minutes, seconds, setIsStopped } = useElapsedTime(
    startTime,
    isWorkoutFinished
  );

  const stopRest = function(difference: number) {
    setPaused(false);
    setPauseTime(pauseTime + difference);
    console.log("New pause time: " + pauseTime)
    showErrorToast(toast, "Rest has ended! Back to exercise")
  }

  const { extendRest, startRest, endRest, remainingRestTime, endWorkout} = takeRest(
    0,
    stopRest
  )

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
  /*
  const AsyncStorage = require("@react-native-async-storage/async-storage").default;
  console.log("Printing ")
  AsyncStorage.clear()
  */
  const queryClient = useQueryClient();
  const { data: contributions, isPending: contributionsPending } = useQuery({
    queryKey: ["contributions"],
    queryFn: async () => {
      const contributions = await getContributionsFromStorage();
      console.log(contributions)
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
        startTime,
        endTime,
        session?.user.user_metadata.profileId
      );
      const exercises = getValues("exercises")
      let cardio = false
      for (const exercise of exercises) {
        if (exercise.info.type == "CARDIO") {
          cardio = true
        }
      }
      if (!cardio)
        saveContributionsToStorage(contributions);
      queryClient.invalidateQueries({ queryKey: ["contributions"] });
      // invalidate all competition workouts for curr profile
      queryClient.invalidateQueries({
        queryKey: ["my-event-workouts"],
      });
      // invalidate all competition leaderboards
      for (const contribution of contributions) {
        queryClient.invalidateQueries({
          queryKey: ["event-leaderboard", { id: contribution.competition.id }],
        });
      }
      setValue("pauseTime", formatCalculateTime(calculateTime(0, pauseTime * 1000)))
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
      console.log("Successfully posted workout");
      await clearWorkout();
      await addEventWorkout(
        values,
        session?.user.user_metadata.profileId
      );
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
      const pauseDuration = formatCalculateTime(calculateTime(0, pauseTime * 1000))
      const postData = {
        templateId: workoutData.templateId,
        duration,
        pauseTime: pauseDuration,
        exercises: workoutData.exercises,
        stats: workoutStats,
      };

      console.log(
        "Navigating to post screen"
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
        <HStack space="sm" className="flex items-center justify-between">
          <Text size="xl" className="font-bold">Time Spent on Workout:</Text>
          <Box className="p-1.5"></Box>
          <Box className="p-1.5"></Box>
          <Box className="p-1.5"></Box>
          <Box className="p-1.5"></Box>
          <HStack className="items-center">
            <Box className="bg-secondary-500 p-1.5 rounded-md">
              <Icon size="xl" as={ClockIcon} />
            </Box>
            <Box className="p-1.5"></Box>
            <Text size="xl" className="font-semibold">
              {!isWorkoutFinished
                ? `${minutes}:${seconds}`
                : formatCalculateTime(calculateTime(startTime, endTime!))}
            </Text>
          </HStack>
        </HStack>
      </Box>
      <Button
        size="lg"
        action="kova"
        className="w-full"
        onPress={() => {
          startRest(30 * 1000);
          setPaused(true);
        }}
      >
        <ButtonText>Pause</ButtonText>
      </Button>
      <Modal isOpen={isPaused}
        size="md">
        <ModalBackdrop />
        <ModalContent>
          <ModalBody>
            <HStack space="sm" className="items-center">
              <Text size="xl" className="font-bold">Remaining Rest Time: </Text>
              <Box className="p-1.5"></Box>

              <HStack className="items-center">
                <Box className="bg-secondary-500 p-1.5 rounded-md">
                  <Icon size="xl" as={ClockIcon} />
                </Box>
                <Box className="p-1.5"></Box>

                <Text size="xl" className="font-semibold">
                  {formatCalculateTime(calculateTime(0, remainingRestTime * 1000))}
                </Text>
              </HStack>
            </HStack>
            <Box className="p-1.5"></Box>
            <Button
              size="lg"
              action="kova"
              className="w-full"
              onPress={() => {
                setPauseTime(endRest() + pauseTime)
                console.log("New pause time: " + pauseTime)
                setPaused(false)
                showSuccessToast(toast, "Ended rest!")
              }}
            >
              <ButtonText>Stop Break</ButtonText>
            </Button>
            <Box className="p-1.5"></Box>
            <Button
              size="lg"
              action="kova"
              className="w-full"
              onPress={() => {
                extendRest(30 * 1000);
              }}
            >
              <ButtonText>Extend Break (+30s)</ButtonText>
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>

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
                  <Heading size="md">Rest Time</Heading>
                  <Heading size="2xl">
                    {formatCalculateTime(calculateTime(0, pauseTime * 1000))}
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
                      <HStack
                        key={contribution.competition.id}
                        className="justify-between items-center"
                      >
                        <Heading size="md">
                          {contribution.competition.title}
                        </Heading>
                        <Heading size="lg" className="capitalize">
                          {contribution.value.toFixed(2)} {contribution.type}
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
                    "Post workout button clicked"
                  );

                  // Close the modal
                  endWorkout()
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

function getTime(startTime: number, endTime: number, workoutTime: number) : {seconds: number, minutes: number} {
  const {seconds: s1, minutes: min1} = calculateTime(0, workoutTime)
  const {seconds: s2, minutes: min2} = calculateTime(startTime, endTime)
  let seconds = (s1 + s2) % 60
  let minutes = min1 + min2;
  if (s1 + s2 > 60) {
    minutes++;
  }
  return {
    seconds: seconds,
    minutes: minutes
  }
}
