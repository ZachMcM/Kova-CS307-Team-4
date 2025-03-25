import Container from "@/components/Container";
import CollaborationProgress from "@/components/event/CollaborationProgress";
import ExercisePointsView from "@/components/event/ExercisePointsView";
import Leaderboard from "@/components/event/Leaderboard";
import YourWorkouts from "@/components/event/YourWorkouts";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { getEvent } from "@/services/groupEventServices";
import { Feather } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "@tanstack/react-query";
import { Link, Redirect, useLocalSearchParams } from "expo-router";

export default function Event() {
  const { id } = useLocalSearchParams();

  const { data: event, isPending } = useQuery({
    queryKey: ["event", { id }],
    queryFn: async () => {
      const event = await getEvent(id as string);
      return event;
    },
  });

  return (
    <Container>
      {isPending ? (
        <Spinner />
      ) : !event ? (
        <Redirect href="/feed" />
      ) : (
        <VStack space="4xl">
          <VStack space="sm">
            <Heading className="text-4xl lg:text-5xl xl:text-[56px]">
              {event.title}
            </Heading>
            <HStack space="md" className="items-center">
              <Feather name="users" size={24} />
              <Link
                href={{
                  pathname: "/group/[id]",
                  params: { id: event.group.id },
                }}
                className="text-lg"
              >
                {event.group.title}
              </Link>
            </HStack>
          </VStack>
          <VStack space="lg">
            <VStack>
              <Heading size="xl">Details</Heading>
              <Text>View {event.type} details</Text>
            </VStack>
            <Card variant="outline">
              <VStack space="md">
                <HStack space="md" className="items-center">
                  <Ionicons name="calendar-number-outline" size={24} />
                  <VStack>
                    <Heading size="md">Duration</Heading>
                    <Text size="md">
                      {new Date(event?.start_date!).toLocaleDateString()} -{" "}
                      {new Date(event?.end_date!).toLocaleDateString()}
                    </Text>
                  </VStack>
                </HStack>
                <HStack space="md" className="items-center">
                  <Feather name="target" size={24} />
                  <VStack>
                    <Heading size="md">Goal</Heading>
                    <Text size="md">{event?.goal} Points</Text>
                  </VStack>
                </HStack>
                <HStack space="md" className="items-center">
                  <Ionicons name="barbell" size={24} />
                  <VStack>
                    <Heading size="md">Weight Multiplier</Heading>
                    <Text size="md">x{event.weight_multiplier} Points</Text>
                  </VStack>
                </HStack>
                <HStack space="md" className="items-center">
                  <Ionicons name="arrow-up" size={24} />
                  <VStack>
                    <Heading size="md">Rep Multiplier</Heading>
                    <Text size="md">x{event.rep_multiplier} Points</Text>
                  </VStack>
                </HStack>
              </VStack>
            </Card>
          </VStack>
          {event.type == "collaboration" && (
            <CollaborationProgress event={event} />
          )}
          <Leaderboard event={event} />
          <ExercisePointsView event={event} />
          <YourWorkouts event={event} />
        </VStack>
      )}
    </Container>
  );
}
