import Container from "@/components/Container";
import EventCard from "@/components/EventCard";
import { useSession } from "@/components/SessionContext";
import { Alert, AlertIcon, AlertText } from "@/components/ui/alert";
import { Avatar, AvatarFallbackText, AvatarImage } from "@/components/ui/avatar";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { AddIcon, InfoIcon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { getGroup, getMembers, getRole, isMemberOfGroup, joinGroup, leaveGroup } from "@/services/groupServices";
import { Tables } from "@/types/database.types";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router/build/hooks";

export default function Group() {
  const { id: groupId } = useLocalSearchParams() as { id: string };
  const { session } = useSession();
  const userId = session?.user.id
  const { data: group, isPending } = useQuery({
    queryKey: ["group", { groupId }],
    queryFn: async () => {
      const group = await getGroup(groupId as string);
      return group;
    },
  });

  const { data: role, isPending: gettingRole } = useQuery({
    queryKey: ["groupRel", { groupId }],
    queryFn: async () => {
      const partOfGroup = await isMemberOfGroup(groupId, userId!)
      if (partOfGroup) {
        return getRole(groupId, userId!)
      }
      else {
        return "none"
      }
    }
  })

  const router = useRouter();

  return (
    <Container>
      {isPending ? (
        <Spinner />
      ) : (
        <VStack space="xl">
          <HStack space="2xl">
            <Avatar className="bg-indigo-600" size="md">
              {group?.icon ? (
                <AvatarImage source={{ uri: group.icon }} />
              ) : (
                <AvatarFallbackText className="text-white">{group?.title![0]}</AvatarFallbackText>
              )}
            </Avatar>
            <VStack space="sm">
              <Heading className="text-4xl lg:text-5xl xl:text-[56px]">
                {group?.title}
              </Heading>
              <Text>{group?.description}</Text>
            </VStack>
          </HStack>
          <Button
            variant="solid"
            action="secondary"
            onPress={() =>
              router.push({
                pathname: "/(tabs)/group/members/[id]",
                params: { id: groupId },
              })
            }
            size="lg"
          >
            <ButtonText>View Members</ButtonText>
          </Button>
          <VStack space="md">
            <Heading size="lg">Competitions</Heading>
            <GroupEvents
              events={
                group?.events.filter((event) => event.type == "competition")!
              }
              type="competitions"
            />
          </VStack>
          <VStack space="md">
            <Heading size="lg">Collaborations</Heading>
            <GroupEvents
              events={
                group?.events.filter((event) => event.type == "collaboration")!
              }
              type="collaborations"
            />
          </VStack>
          {
            (!gettingRole)?
              (role == "owner") ? 
                (<Button
                  variant="solid"
                  action="secondary"
                  onPress={() =>
                    router.push({
                      pathname: "/new-event/[id]",
                      params: { id: groupId },
                    })
                  }
                  size="lg"
                >
                  <ButtonText>New Event</ButtonText>
                  <ButtonIcon as={AddIcon} />
                </Button>) :
              (role == "none") ?
                (<Button
                  variant="solid"
                  action="secondary"
                  onPress={() => {
                      joinGroup(groupId, userId!).then(() => {
                        console.log("Joining")
                        router.reload()
                      });
                    }
                  }
                  size="lg"
                >
                  <ButtonText>Join Group</ButtonText>
                </Button>) :
              (role == "member") ?
                (<Button
                  variant="solid"
                  action="secondary"
                  onPress={() => {
                      leaveGroup(groupId, userId!).then(() => {
                        router.reload()
                      });
                    }
                  }
                  size="lg"
                >
                  <ButtonText>Leave Group</ButtonText>
                </Button>) :<></>
              : <></>}
        </VStack>
      )}
    </Container>
  );
}

export function GroupEvents({
  events,
  type,
}: {
  events: Tables<"groupEvent">[];
  type: string;
}) {
  return events.length > 0 ? (
    events.map((event) => <EventCard event={event} key={event.id} />)
  ) : (
    <Alert action="muted" variant="solid">
      <AlertIcon as={InfoIcon} />
      <AlertText>No {type} found!</AlertText>
    </Alert>
  );
}
