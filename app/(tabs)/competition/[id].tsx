import Container from "@/components/Container";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { getCompetition } from "@/services/competitionServices";
import { Feather } from "@expo/vector-icons";
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
        <VStack space="md">
          <Heading size="2xl">{competition.title}</Heading>
          <VStack space="2xl">
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
            <VStack space="sm">
              <HStack space="md" className="items-center">
                <Feather name="calendar" size={18} />
                <Text size="md" className="text-typography-950">
                  {new Date(competition?.start_date!).toLocaleDateString()} -{" "}
                  {new Date(competition?.end_date!).toLocaleDateString()}
                </Text>
              </HStack>
              <HStack space="md" className="items-center">
                <Feather name="target" size={18} />
                <Text size="md" className="text-typography-950">
                  {competition?.goal} Points
                </Text>
              </HStack>
            </VStack>
          </VStack>
        </VStack>
      )}
    </Container>
  );
}
