import Container from "@/components/Container";
import CollaborationProgress from "@/components/event/CollaborationProgress";
import EditEventDetails from "@/components/event/EditEventDetails";
import ExercisePointsView from "@/components/event/ExercisePointsView";
import Leaderboard from "@/components/event/Leaderboard";
import YourWorkouts from "@/components/event/YourWorkouts";
import { useSession } from "@/components/SessionContext";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { EditIcon, Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { getEvent } from "@/services/groupEventServices";
import { getProfileGroupRel } from "@/services/groupServices";
import { Feather } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "@tanstack/react-query";
import { Link, Redirect, useLocalSearchParams } from "expo-router";
import { useState } from "react";

export default function Event() {
  const { id } = useLocalSearchParams();
  const { session } = useSession();

  const { data: event, isPending } = useQuery({
    queryKey: ["event", { id }],
    queryFn: async () => {
      const event = await getEvent(id as string);
      return event;
    },
  });

  const { data: groupRel } = useQuery({
    queryKey: ["group", { id }],
    queryFn: async () => {
      const groupRel = await getProfileGroupRel(
        session?.user.user_metadata.profileId,
        event?.groupId!
      );
      return groupRel;
    },
    enabled: !!event,
  });

  const [editDetails, setEditDetails] = useState(false);

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
            <HStack className="items-center justify-between">
              <VStack>
                <Heading size="xl">Details</Heading>
                <Text>{editDetails ? "Edit" : "View"} {event.type} details</Text>
              </VStack>
              {!editDetails && groupRel?.role == "owner" && (
                <Pressable
                  onPress={() => {
                    setEditDetails(true);
                  }}
                >
                  <Icon size="xl" as={EditIcon} />
                </Pressable>
              )}
            </HStack>
            <Card variant="outline">
              {editDetails ? (
                <EditEventDetails
                  event={event}
                  setEditDetails={setEditDetails}
                />
              ) : (
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
              )}
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
