import {
  getCompetitionWorkouts,
  getProfilePoints,
} from "@/services/competitionServices";
import {
  CompetitionWithGroup,
  CompetitionWorkoutWithProfile,
} from "@/types/extended-types";
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

export default function Leaderboard({
  competition,
}: {
  competition: CompetitionWithGroup;
}) {
  const { data: leaderboard, isPending } = useQuery({
    queryKey: ["comp-leaderboard", { id: competition.id }],
    queryFn: async () => {
      const competitionWorkouts = await getCompetitionWorkouts(competition.id);
      console.log(competitionWorkouts);

      // creating the map
      const profileTable = new Map<string, CompetitionWorkoutWithProfile[]>();
      for (const competitionWorkout of competitionWorkouts) {
        // Get the existing array or create a new one if it doesn't exist
        const workoutArr = profileTable.get(competitionWorkout.profileId) || [];

        // Check if the current workout already exists in the array
        const workoutExists = workoutArr.some(
          (workout) => workout.id === competitionWorkout.id
        );

        // Only add the workout if it doesn't already exist
        if (!workoutExists) {
          workoutArr.push(competitionWorkout);
          // Update the map with the modified array
          profileTable.set(competitionWorkout.profileId, workoutArr);
        }
      }

      const leaderboard = Array.from(profileTable.keys()).map((key) => {
        const workouts = profileTable.get(key)!;
        const totalPoints = getProfilePoints(competition, workouts);
        console.log(totalPoints);
        return {
          profile: workouts[0].profile,
          totalPoints,
        };
      });

      leaderboard.sort((a, b) => a.totalPoints - b.totalPoints);

      return leaderboard;
    },
  });

  const router = useRouter();

  return (
    <VStack space="lg">
      <VStack>
        <Heading size="xl">Leaderboard</Heading>
        <Text>Participants ranked by total points earned</Text>
      </VStack>
      {isPending ? (
        <Spinner />
      ) : (
        leaderboard && (
          <VStack space="md">
            {leaderboard.map(({ totalPoints, profile }, i) => (
              <Card key={profile.id} variant="outline">
                <VStack space="md">
                  <HStack space="lg" className="items-center">
                    <Box className="rounded-full bg-secondary-200 flex justify-center items-center h-8 w-8">
                      <Heading size="lg">{i + 1}</Heading>
                    </Box>
                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname: "/(tabs)/profiles/[id]",
                          params: { id: profile.id },
                        })
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
                  <VStack space="sm">
                    <HStack className="items-center justify-between">
                      <Text>Progress torwards goal</Text>
                      <Text>{Math.round((totalPoints / competition.goal!) * 100)}%</Text>
                    </HStack>
                    <Progress
                      value={Math.round((totalPoints / competition.goal!) * 100)}
                      size="lg"
                      orientation="horizontal"
                    >
                      <ProgressFilledTrack />
                    </Progress>
                    <HStack className="items-center justify-between">
                      <Text>
                        {totalPoints} / {competition.goal}
                      </Text>
                      <Text>{competition.goal! - totalPoints < 0 ? 0 : competition.goal! - totalPoints} pts remaining</Text>
                    </HStack>
                  </VStack>
                </VStack>
              </Card>
            ))}
          </VStack>
        )
      )}
    </VStack>
  );
}
