import { calculateTime, formatCalculateTime } from "@/lib/calculateTime";
import {
  getExercisePoints,
  getProfileEventWorkouts,
} from "@/services/groupEventServices";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useSession } from "../SessionContext";
import { Box } from "../ui/box";
import { Button, ButtonText } from "../ui/button";
import { Card } from "../ui/card";
import { Heading } from "../ui/heading";
import { HStack } from "../ui/hstack";
import { Spinner } from "../ui/spinner";
import { Text } from "../ui/text";
import { VStack } from "../ui/vstack";
import { EventWithGroup } from "@/types/extended-types";

export default function YourWorkouts({
  event,
}: {
  event: EventWithGroup;
}) {
  const { session } = useSession();

  const { data: workouts, isPending } = useQuery({
    queryKey: ["my-event-workouts", { id: event.id }],
    queryFn: async () => {
      const workouts = await getProfileEventWorkouts(
        event.id,
        session?.user.user_metadata.profileId
      );
      return workouts;
    },
  });

  const [allWorkoutsShown, setAllWorkoutsShown] = useState(false);

  return (
    <VStack space="lg">
      <VStack>
        <Heading size="xl">Your Workouts</Heading>
        <Text>See your workouts that contributed to the {event.type}</Text>
      </VStack>
      {isPending ? (
        <Spinner />
      ) : (
        workouts && (
          <VStack space="md">
            {workouts
              .slice(
                0,
                allWorkoutsShown || workouts.length <= 2
                  ? undefined // Show all when allWorkoutsShown is true OR when there are 3 or fewer workouts
                  : 2
              )
              .map((workout) => (
                <Card key={workout.id} variant="outline" className="p-0">
                  <HStack className="justify-between items-center p-4 border-b border-outline-200">
                    <VStack>
                      <Heading size="md">
                        {workout.workoutData.templateName}
                      </Heading>
                      <Text>
                        {Math.round(
                          (Date.now() -
                            new Date(workout.created_at).getTime()) /
                            86_400_000
                        )}{" "}
                        Days ago · Duration:{" "}
                        {formatCalculateTime(
                          calculateTime(
                            workout.workoutData.startTime,
                            workout.workoutData.endTime!
                          )
                        )}
                      </Text>
                    </VStack>
                    <Box className="bg-secondary-400 rounded-full py-1 px-3">
                      <Heading size="sm">
                        {workout.workoutData.exercises.reduce(
                          (accum, curr) =>
                            accum + getExercisePoints(event, curr),
                          0
                        )}{" "}
                        pts
                      </Heading>
                    </Box>
                  </HStack>
                  <VStack className="p-4">
                    {workout.workoutData.exercises.map((exercise) => (
                      <HStack
                        className="justify-between items-center"
                        key={exercise.info.id}
                      >
                        <Heading size="md">{exercise.info.name}</Heading>
                        <Text size="md">
                          {exercise.sets.length} Rep
                          {exercise.sets.length != 1 && "s"}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </Card>
              ))}
            {!allWorkoutsShown ? (
              workouts.length > 2 && (
                <Button action="kova" onPress={() => setAllWorkoutsShown(true)}>
                  <ButtonText>View all</ButtonText>
                </Button>
              )
            ) : (
              <Button action="kova" onPress={() => setAllWorkoutsShown(false)}>
                <ButtonText>View less</ButtonText>
              </Button>
            )}
          </VStack>
        )
      )}
    </VStack>
  );
}
