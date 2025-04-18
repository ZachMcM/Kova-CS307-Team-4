import {
  getEventWorkouts,
  getProfileMinutes,
  getProfilePoints,
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

export default function Leaderboard({ event }: { event: EventWithGroup }) {
  const { data: leaderboard, isPending } = useQuery({
    queryKey: ["event-leaderboard", { id: event.id }],
    queryFn: async () => {
      const eventWorkouts = await getEventWorkouts(event.id);

      console.log("Event workouts", eventWorkouts);

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

      const leaderboard = Array.from(profileTable.keys()).map((key) => {
        const workouts = profileTable.get(key)!;
        const totalValue =
          event.type == "total-time"
            ? getProfileMinutes(workouts)
            : getProfilePoints(event, workouts);
        console.log(totalValue);
        return {
          profile: workouts[0].profile,
          totalValue,
        };
      });

      leaderboard.sort((a, b) => b.totalValue - a.totalValue);

      return leaderboard;
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
          {leaderboard.map(({ totalValue, profile }, i) => (
            <Card
              key={profile.id}
              variant="outline"
              className={clsx(
                "p-0",
                session?.user.user_metadata.profileId == profile.id &&
                  "bg-secondary-100"
              )}
            >
              <VStack space="md">
                <HStack
                  space="lg"
                  className={clsx("items-center justify-between p-4", event.goal && "border-b border-outline-200")}
                >
                  <HStack space="lg" className="items-center">
                    <Heading size="xl">{i + 1}.</Heading>
                    <Pressable
                      onPress={() => {
                        getUserIdFromProfile(profile.id).then((userId) => {
                          router.push({
                            pathname: "/(tabs)/profiles/[id]",
                            params: { id: userId },
                          });
                        });
                      }}
                    >
                      <HStack space="md" className="items-center">
                        <Avatar className="bg-indigo-600" size="md">
                          {profile.avatar ? (
                            <AvatarImage source={{ uri: profile.avatar }} />
                          ) : (
                            <AvatarFallbackText>
                              {profile.username}
                            </AvatarFallbackText>
                          )}
                        </Avatar>

                        <VStack>
                          <Heading>{profile.name}</Heading>
                          <Text>@{profile.username}</Text>
                        </VStack>
                      </HStack>
                    </Pressable>
                  </HStack>
                  <HStack space="md" className="items-center">
                    <Box className="bg-secondary-400 rounded-full py-1 px-3">
                      <Heading size="xs">
                        {totalValue.toFixed(2)}{" "}
                        {event.type == "total-time" ? "mins" : "pts"}
                      </Heading>
                    </Box>
                    {i == 0 && <Icon as={Trophy} className="text-yellow-400" />}
                  </HStack>
                </HStack>
                {event.goal && (
                  <VStack space="md" className="p-4">
                    <HStack className="items-center justify-between">
                      <Text>Progress torwards goal</Text>
                      <Text>
                        {Math.round((totalValue / event.goal!) * 100).toFixed(
                          2
                        )}
                        %
                      </Text>
                    </HStack>
                    <Progress
                      value={Math.round((totalValue / event.goal!) * 100)}
                      size="lg"
                      orientation="horizontal"
                    >
                      <ProgressFilledTrack />
                    </Progress>
                    <HStack className="items-center justify-between">
                      <Text>
                        {totalValue.toFixed(2)} / {event.goal?.toFixed(2)}
                      </Text>
                      {event.goal! - totalValue >= 0 ? (
                        <Text>
                          {(event.goal! - totalValue).toFixed(2)}{" "}
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
