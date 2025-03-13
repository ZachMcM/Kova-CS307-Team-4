import ExercisePointsView from "@/components/competition/ExercisePointsView";
import Leaderboard from "@/components/competition/Leaderboard";
import Container from "@/components/Container";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { getCompetition } from "@/services/competitionServices";
import { Feather } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "@tanstack/react-query";
import { Link, Redirect, useLocalSearchParams } from "expo-router";

export default function Competition() {
  const { id } = useLocalSearchParams();

  const { data: competition, isPending } = useQuery({
    queryKey: ["competition", { id }],
    queryFn: async () => {
      const competition = await getCompetition(id as string);
      return competition;
    },
  });

  return (
    <Container>
      {isPending ? (
        <Spinner />
      ) : !competition ? (
        <Redirect href="/feed" />
      ) : (
        <VStack space="4xl">
          <VStack space="sm">
            <Heading className="text-4xl lg:text-5xl xl:text-[56px]">
              {competition.title}
            </Heading>
            <Text>View the competition data</Text>
            <HStack space="md" className="items-center">
              <Feather name="users" size={24} />
              <Link
                href={{
                  pathname: "/group/[id]",
                  params: { id: competition.group.id },
                }}
                className="text-lg"
              >
                {competition.group.title}
              </Link>
            </HStack>
          </VStack>
          <VStack space="md">
            <HStack space="md" className="items-center">
              <Ionicons name="calendar-number-outline" size={24} />
              <VStack>
                <Heading size="md">Duration</Heading>
                <Text size="md">
                  {new Date(competition?.start_date!).toLocaleDateString()} -{" "}
                  {new Date(competition?.end_date!).toLocaleDateString()}
                </Text>
              </VStack>
            </HStack>
            <HStack space="md" className="items-center">
              <Feather name="target" size={24} />
              <VStack>
                <Heading size="md">Goal</Heading>
                <Text size="md">{competition?.goal} Points</Text>
              </VStack>
            </HStack>
            <HStack space="md" className="items-center">
              <Ionicons name="barbell" size={24} />
              <VStack>
                <Heading size="md">Weight Multiplier</Heading>
                <Text size="md">x{competition.weight_multiplier} Points</Text>
              </VStack>
            </HStack>
            <HStack space="md" className="items-center">
              <Ionicons name="arrow-up" size={24} />
              <VStack>
                <Heading size="md">Rep Multiplier</Heading>
                <Text size="md">x{competition.rep_multiplier} Points</Text>
              </VStack>
            </HStack>
          </VStack>
          <Leaderboard competition={competition} />
          <ExercisePointsView competition={competition} />
        </VStack>
      )}
    </Container>
  );
}
