import {
  getEventWorkouts,
  getProfilePoints,
} from "@/services/groupEventServices";
import { Tables } from "@/types/database.types";
import { EventWorkoutWithProfile } from "@/types/extended-types";
import { useQuery } from "@tanstack/react-query";
import { Box } from "../ui/box";
import { Heading } from "../ui/heading";
import { HStack } from "../ui/hstack";
import { Progress, ProgressFilledTrack } from "../ui/progress";
import { Spinner } from "../ui/spinner";
import { Text } from "../ui/text";
import { VStack } from "../ui/vstack";

export default function CollaborationProgress({
  event,
}: {
  event: Tables<"groupEvent">;
}) {
  const { data: progress, isPending } = useQuery({
    queryKey: ["collaboration-progress", { id: event.id }],
    queryFn: async () => {
      const eventWorkouts = await getEventWorkouts(event.id);
      console.log(eventWorkouts);

      // creating the map
      const profileTable = new Map<string, EventWorkoutWithProfile[]>();
      for (const eventWorkout of eventWorkouts) {
        // Get the existing array or create a new one if it doesn't exist
        const workoutArr = profileTable.get(eventWorkout.profileId) || [];

        // Check if the current workout already exists in the array
        const workoutExists = workoutArr.some(
          (workout) => workout.id === eventWorkout.id
        );

        // Only add the workout if it doesn't already exist
        if (!workoutExists) {
          workoutArr.push(eventWorkout);
          // Update the map with the modified array
          profileTable.set(eventWorkout.profileId, workoutArr);
        }
      }

      let totalPoints = 0;

      Array.from(profileTable.keys()).forEach((key) => {
        const workouts = profileTable.get(key)!;
        totalPoints += getProfilePoints(event, workouts);
      });

      return totalPoints;
    },
  });

  return (
    <VStack space="lg">
      <VStack>
        <Heading size="xl">Collaboration Progress</Heading>
        <Text>Total progress of the collaboration</Text>
      </VStack>
      {isPending ? (
        <Spinner />
      ) : (
        <VStack space="md">
          <HStack className="items-center justify-between">
            <Text>Progress torwards goal</Text>
            <Text>{Math.round(((progress || 0) / event.goal!) * 100)}%</Text>
          </HStack>
          <Progress
            value={Math.round(((progress || 0) / event.goal!) * 100)}
            size="lg"
            orientation="horizontal"
          >
            <ProgressFilledTrack />
          </Progress>
          <HStack className="items-center justify-between">
            <Text>
              {progress} / {event.goal}
            </Text>
            {event.goal! - (progress || 0) >= 0 ? (
              <Text>{event.goal! - (progress || 0)} pts remaining</Text>
            ) : (
              <Box className="bg-success-50 border border-success-200 rounded-full py-0.5 px-2">
                <Heading size="xs" className="text-success-400">
                  Goal Reached!
                </Heading>
              </Box>
            )}
          </HStack>
        </VStack>
      )}
    </VStack>
  );
}
