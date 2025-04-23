import {
  getEventWorkouts,
  getProfileMinutes,
  getProfilePoints,
  getWorkoutPoints,
} from "@/services/groupEventServices";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Avatar, AvatarFallbackText, AvatarImage } from "../ui/avatar";
import { Box } from "../ui/box";
import { Card } from "../ui/card";
import { Heading } from "../ui/heading";
import { HStack } from "../ui/hstack";
import { Pressable } from "../ui/pressable";
import { Progress, ProgressFilledTrack } from "../ui/progress";
import { Spinner } from "../ui/spinner";
import { Text } from "../ui/text";
import { VStack } from "../ui/vstack";
import { useSession } from "../SessionContext";
import clsx from "clsx";
import {
  EventWithGroup,
  EventWorkoutWithProfile,
} from "@/types/extended-types";
import { Alert, AlertIcon, AlertText } from "../ui/alert";
import { Icon, InfoIcon } from "../ui/icon";
import { getUserIdFromProfile } from "@/services/profileServices";
import { Trophy } from "lucide-react-native";
import { calculateTime, formatCalculateTime } from "@/lib/calculateTime";

export default function SingleSessionLeaderboard({
  event,
}: {
  event: EventWithGroup;
}) {
  const { data: leaderboard, isPending } = useQuery({
    queryKey: ["event-leaderboard", { id: event.id }],
    queryFn: async () => {
      const eventWorkouts = await getEventWorkouts(event.id);

      eventWorkouts.sort(
        (a, b) =>
          getWorkoutPoints(b.workoutData.exercises, event) -
          getWorkoutPoints(a.workoutData.exercises, event)
      );

      return eventWorkouts;
    },
  });

  const { session } = useSession();

  const router = useRouter();

  return (
    <VStack space="lg">
      <VStack>
        <Heading size="xl">Leaderboard</Heading>
        <Text>
          Participants ranked by total{" "}
          {event.type == "total-time" ? "workout minutes" : "points earned"}
        </Text>
      </VStack>
      {isPending ? (
        <Spinner />
      ) : leaderboard && leaderboard.length > 0 ? (
        <VStack space="md">
          {leaderboard.map((workout, i) => (
            <Card
              key={workout.id}
              variant="outline"
              className={clsx("p-0",
                session?.user.user_metadata.profileId == workout.profile.id &&
                  "bg-secondary-100"
              )}
            >
              <VStack space="md">
                <HStack space="lg" className="items-center justify-between p-4 border-b border-outline-200">
                  <HStack space="lg" className="items-center">
                    <Heading size="xl">{i + 1}.</Heading>
                    <Pressable
                      onPress={() => {
                        getUserIdFromProfile(workout.profile.id).then(
                          (userId) => {
                            router.push({
                              pathname: "/(tabs)/profiles/[id]",
                              params: { id: userId },
                            });
                          }
                        );
                      }}
                    >
                      <HStack space="md" className="items-center">
                        <Avatar className="bg-indigo-600" size="md">
                          {workout.profile.avatar ? (
                            <AvatarImage
                              source={{ uri: workout.profile.avatar }}
                            />
                          ) : (
                            <AvatarFallbackText>
                              {workout.profile.username}
                            </AvatarFallbackText>
                          )}
                        </Avatar>

                        <VStack>
                          <Heading>{workout.profile.name}</Heading>
                          <Text>@{workout.profile.username}</Text>
                        </VStack>
                      </HStack>
                    </Pressable>
                  </HStack>
                  <HStack space="md" className="items-center">
                    <Box className="bg-secondary-400 rounded-full py-1 px-3">
                      <Heading size="xs">
                        {getWorkoutPoints(workout.workoutData.exercises, event).toFixed(2)}{" "}
                        pts
                      </Heading>
                    </Box>
                    {i == 0 && <Icon as={Trophy} className="text-yellow-400" />}
                  </HStack>
                </HStack>
                {event.goal ? (
                  <VStack space="md" className="p-4">
                    <HStack className="items-center justify-between">
                      <Text>Progress torwards goal</Text>
                      <Text>
                        {Math.round(
                          (getWorkoutPoints(
                            workout.workoutData.exercises,
                            event
                          ) /
                            event.goal!) *
                            100
                        ).toFixed(2)}
                        %
                      </Text>
                    </HStack>
                    <Progress
                      value={Math.round(
                        (getWorkoutPoints(
                          workout.workoutData.exercises,
                          event
                        ) /
                          event.goal!) *
                          100
                      )}
                      size="lg"
                      orientation="horizontal"
                    >
                      <ProgressFilledTrack />
                    </Progress>
                    <HStack className="items-center justify-between">
                      <Text>
                        {getWorkoutPoints(
                          workout.workoutData.exercises,
                          event
                        ).toFixed(2)}{" "}
                        / {event.goal?.toFixed(2)}
                      </Text>
                      {event.goal! -
                        getWorkoutPoints(
                          workout.workoutData.exercises,
                          event
                        ) >=
                      0 ? (
                        <Text>
                          {(
                            event.goal! -
                            getWorkoutPoints(
                              workout.workoutData.exercises,
                              event
                            )
                          ).toFixed(2)}{" "}
                          {event.type == "total-time" ? "mins" : "pts"}{" "}
                          remaining
                        </Text>
                      ) : (
                        <Box className="bg-success-50 border border-success-200 rounded-full w-fit py-0.5 px-2">
                          <Heading size="xs" className="text-success-400">
                            Goal Reached!
                          </Heading>
                        </Box>
                      )}
                    </HStack>
                  </VStack>
                ) : (
                  <HStack className="justify-between items-center p-4">
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
                        {getWorkoutPoints(workout.workoutData.exercises, event).toFixed(2)}{" "}
                        {event.type == "total-time" ? "mins" : "pts"}
                      </Heading>
                    </Box>
                  </HStack>
                )}
              </VStack>
            </Card>
          ))}
        </VStack>
      ) : (
        <Alert action="muted" variant="solid">
          <AlertIcon as={InfoIcon} />
          <AlertText>No leaderboard data yet</AlertText>
        </Alert>
      )}
    </VStack>
  );
}
