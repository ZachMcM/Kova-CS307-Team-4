import {
  getEventWorkouts,
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
import { InfoIcon } from "../ui/icon";
import { getUserIdFromProfile } from "@/services/profileServices";

export default function Leaderboard({ event }: { event: EventWithGroup }) {
  const { data: leaderboard, isPending } = useQuery({
    queryKey: ["event-leaderboard", { id: event.id }],
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

      const leaderboard = Array.from(profileTable.keys()).map((key) => {
        const workouts = profileTable.get(key)!;
        const totalPoints = getProfilePoints(event, workouts);
        console.log(totalPoints);
        return {
          profile: workouts[0].profile,
          totalPoints,
        };
      });

      leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);

      return leaderboard;
    },
  });

  const { session } = useSession();

  const router = useRouter();

  return (
    <VStack space="lg">
      <VStack>
        <Heading size="xl">Leaderboard</Heading>
        <Text>Participants ranked by total points earned</Text>
      </VStack>
      {isPending ? (
        <Spinner />
      ) : leaderboard && leaderboard.length > 0 ? (
        <VStack space="md">
          {leaderboard.map(({ totalPoints, profile }, i) => (
            <Card
              key={profile.id}
              variant="outline"
              className={clsx(
                session?.user.user_metadata.profileId == profile.id &&
                  "bg-secondary-100"
              )}
            >
              <VStack space="md">
                <HStack space="lg" className="items-center">
                  <Box className="rounded-full bg-secondary-200 flex justify-center items-center h-8 w-8">
                    <Heading size="lg">{i + 1}</Heading>
                  </Box>
                  <Pressable
                    onPress={() => {
                        console.log("Changing id to " + profile.id)
                        getUserIdFromProfile(profile.id).then((userId) => {
                          router.push({
                            pathname: "/(tabs)/profiles/[id]",
                            params: { id: userId},
                          })
                        })
                      }
                    }
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
                <VStack space="md">
                  <HStack className="items-center justify-between">
                    <Text>Progress torwards goal</Text>
                    <Text>
                      {Math.round((totalPoints / event.goal!) * 100)}%
                    </Text>
                  </HStack>
                  <Progress
                    value={Math.round((totalPoints / event.goal!) * 100)}
                    size="lg"
                    orientation="horizontal"
                  >
                    <ProgressFilledTrack />
                  </Progress>
                  <HStack className="items-center justify-between">
                    <Text>
                      {totalPoints} / {event.goal}
                    </Text>
                    {event.goal! - totalPoints >= 0 ? (
                      <Text>{event.goal! - totalPoints} pts remaining</Text>
                    ) : (
                      <Box className="bg-success-50 border border-success-200 rounded-full py-0.5 px-2">
                        <Heading size="xs" className="text-success-400">
                          Goal Reached!
                        </Heading>
                      </Box>
                    )}
                  </HStack>
                </VStack>
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
