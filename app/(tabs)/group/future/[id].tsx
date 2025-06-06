import Container from "@/components/Container";
import { useSession } from "@/components/SessionContext";
import { Alert, AlertIcon, AlertText } from "@/components/ui/alert";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { ChevronLeftIcon, Icon, InfoIcon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { isMemberOfGroup, getRole } from "@/services/groupServices";
import { getFutureEvents } from "@/services/simpleEventServices";
import { Tables } from "@/types/database.types";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, ButtonText } from "@/components/ui/button";
import EventCard from "@/components/event/EventCard";

export default function FutureGroupEvents() {
  const { id: groupId } = useLocalSearchParams() as { id: string };
  const { session } = useSession();
  const toast = useToast()
  const queryClient = useQueryClient()
  const profileId = session?.user.user_metadata.profileId

  const { data: role, isPending: gettingRole } = useQuery({
    queryKey: ["groupRel", {groupId}],
    queryFn: async () => {
      const partOfGroup = await isMemberOfGroup(groupId, profileId)
      console.log("Part of group: " + partOfGroup)
      if (partOfGroup) {
        return getRole(groupId, profileId)
      }
      else {
        return "none"
      }
    }
  })

  const { data: futureEvents, isPending: gettingEvents} = useQuery({
    queryKey: ["futureEvents", {groupId}],
    queryFn: async () => {
      return await getFutureEvents(groupId)
    }
  })

  const router = useRouter();

  return <Container>
              { (!gettingEvents) ?
            <><VStack space="md">
              <Heading size="3xl">Future events:</Heading>
              <Button
                variant="outline"
                size="md"
                action="primary"
                onPress={() =>
                  router.push({
                    pathname: "/group/[id]",
                    params: { id: groupId },
                  })
                }
                className="p-3">
                <HStack>
                  <Icon as={ChevronLeftIcon} className="mt-0"></Icon>
                  <ButtonText>Back to Group</ButtonText>
                </HStack>
              </Button>
              <VStack space="md">
                <Heading size="lg">Team Challenges</Heading>
                <GroupEvents
                  events={
                    futureEvents?.filter((event) => event.type == "collaboration")!
                  }
                  type="team challenges"
                />
              </VStack>
              <VStack space="md">
                <Heading size="lg">Points Races</Heading>
                <GroupEvents
                  events={
                    futureEvents?.filter((event) => event.type == "competition")!
                  }
                  type="points races"
                />
              </VStack>
    
              <VStack space="md">
                <Heading size="lg">Endurance Challenges</Heading>
                <GroupEvents
                  events={
                    futureEvents?.filter((event) => event.type == "total-time")!
                  }
                  type="endurance challenges"
                />
              </VStack>
              <VStack space="md">
                <Heading size="lg">Single Session Showdowns</Heading>
                <GroupEvents
                  events={
                    futureEvents?.filter((event) => event.type == "single-workout")!
                  }
                  type="single session showdowns"
                />
              </VStack>
            </VStack></>: <Spinner/>
          }
  </Container>
}

export function GroupEvents({
  events,
  type,
}: {
  events: Tables<"groupEvent">[];
  type: string;
}) {
  return events && events.length > 0 ? (
    events.map((event) => <EventCard event={event} key={event.id} />)
  ) : (
    <Alert action="muted" variant="solid">
      <AlertIcon as={InfoIcon} />
      <AlertText>No {type} found!</AlertText>
    </Alert>
  );
}
