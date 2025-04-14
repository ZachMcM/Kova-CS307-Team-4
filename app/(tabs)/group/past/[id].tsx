import Container from "@/components/Container";
import EventCard from "@/components/EventCard";
import { useSession } from "@/components/SessionContext";
import { Alert, AlertIcon, AlertText } from "@/components/ui/alert";
import { Heading } from "@/components/ui/heading";
import { InfoIcon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { isMemberOfGroup, getRole } from "@/services/groupServices";
import { getPastEvents } from "@/services/simpleEventServices";
import { Tables } from "@/types/database.types";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function PastGroupEvents() {
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

  const { data: pastEvents, isPending: gettingEvents} = useQuery({
    queryKey: ["pastEvents", {groupId}],
    queryFn: async () => {
      return await getPastEvents(groupId)
    }
  })

  const router = useRouter();
    return <Container>
              { (!gettingEvents) ?
            <> <VStack space="md">
              <Heading size="lg">Competitions</Heading>
              <GroupEvents
                events={
                  pastEvents?.filter((event) => event.type == "competition")!
                }
                type="competitions"
              />
            </VStack>
            <VStack space="md">
              <Heading size="lg">Collaborations</Heading>
              <GroupEvents
                events={
                  pastEvents?.filter((event) => event.type == "collaboration")!
                } 
                type="collaborations"
              />
            </VStack> </>: <Spinner/>
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
