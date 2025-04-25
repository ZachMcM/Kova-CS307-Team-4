import Container from "@/components/Container";
import EventCard from "@/components/event/EventCard";
import { useSession } from "@/components/SessionContext";
import { Alert, AlertIcon, AlertText } from "@/components/ui/alert";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { AddIcon, InfoIcon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { getCurrentEvents } from "@/services/simpleEventServices";
import {
  getGroup,
  getMembers,
  getRole,
  isMemberOfGroup,
  joinGroup,
  leaveGroup,
} from "@/services/groupServices";
import { showSuccessToast } from "@/services/toastServices";
import { Tables } from "@/types/database.types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router/build/hooks";
import { useIsFocused } from "@react-navigation/native";

export default function Group() {
  const { id: groupId } = useLocalSearchParams() as { id: string };
  const { session } = useSession();
  const toast = useToast();
  const queryClient = useQueryClient();
  const profileId = session?.user.user_metadata.profileId;
  const { data: group, isPending } = useQuery({
    queryKey: ["group", { groupId }],
    queryFn: async () => {
      const group = await getGroup(groupId);
      return group;
    },
  });

  const { data: role, isPending: gettingRole } = useQuery({
    queryKey: ["groupRel", { groupId }],
    queryFn: async () => {
      const partOfGroup = await isMemberOfGroup(groupId, profileId);
      console.log("Part of group: " + partOfGroup);
      if (partOfGroup) {
        return getRole(groupId, profileId);
      } else {
        return "none";
      }
    },
  });

  const { data: currentEvents, isPending: gettingEvents} = useQuery({
    queryKey: ["currentEvents", {groupId}],
    queryFn: async () => {
      return await getCurrentEvents(groupId)
    }
  })

  const router = useRouter();

  const isFocused = useIsFocused();
  if (!isFocused) {
    return null;
  }

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
                <AvatarFallbackText className="text-white">
                  {group?.title![0]}
                </AvatarFallbackText>
              )}
            </Avatar>
            <VStack space="sm">
              <Heading className="text-4xl lg:text-5xl xl:text-[56px]">
                {group?.title}
              </Heading>
              <Text>{group?.description}</Text>
              <Text>Goal: "{group?.goal}"</Text>
            </VStack>
          </HStack>
          {
            (!gettingEvents) ? (
            <HStack className="justify-between items-center">
              <Button
                  variant="solid"
                  action="secondary"
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/group/past/[id]",
                      params: { id: groupId },
                    })
                  }
                  size="lg"
                >
                <ButtonText>View Past Events</ButtonText>
              </Button>
              <Button
                  variant="solid"
                  action="secondary"
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/group/future/[id]",
                      params: { id: groupId },
                    })
                  }
                  size="lg"
                >
                <ButtonText>View Future Events</ButtonText>
              </Button>
            </HStack>) : (<></>)
          }

          { (!gettingRole && role === "owner") ?
            (<Button
              variant="solid"
              action="secondary"
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/group/edit/[id]",
                  params: { id: groupId },
                })
              }
              size="lg"
            >
              <ButtonText>Edit Group</ButtonText>
            </Button>
          ) : (
            <></>
          )}
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
            <Heading size="lg">Team Challenges</Heading>
            <GroupEvents
              events={
                currentEvents?.filter((event) => event.type == "collaboration")!
              }
              type="team challenges"
            />
          </VStack>
          <VStack space="md">
            <Heading size="lg">Points Races</Heading>
            <GroupEvents
              events={
                currentEvents?.filter((event) => event.type == "competition")!
              }
              type="points races"
            />
          </VStack>

          <VStack space="md">
            <Heading size="lg">Endurance Challenges</Heading>
            <GroupEvents
              events={
                currentEvents?.filter((event) => event.type == "total-time")!
              }
              type="endurance challenges"
            />
          </VStack>
          <VStack space="md">
            <Heading size="lg">Single Session Showdowns</Heading>
            <GroupEvents
              events={
                currentEvents?.filter((event) => event.type == "single-workout")!
              }
              type="single session showdowns"
            />
          </VStack>
          {!gettingRole ? (
            role === "owner" ? (
              <Button
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
              </Button>
            ) : role === "none" ? (
              <Button
                variant="solid"
                action="secondary"
                onPress={() => {
                  joinGroup(groupId, profileId).then(() => {
                    queryClient.invalidateQueries({
                      queryKey: ["groupRel", { groupId }],
                    });
                    queryClient.invalidateQueries({
                      queryKey: ["groupRel user", { groupId }],
                    });
                    queryClient.invalidateQueries({ queryKey: ["group"] });
                    queryClient.invalidateQueries({ queryKey: ["groupRel"] });
                    queryClient.invalidateQueries({
                      queryKey: ["group profile"],
                    });
                    queryClient.invalidateQueries({
                      queryKey: ["groupRel profile"],
                    });
                    showSuccessToast(toast, "Joined group!");
                  });
                }}
                size="lg"
              >
                <ButtonText>Join Group</ButtonText>
              </Button>
            ) : role === "member" ? (
              <Button
                variant="solid"
                action="secondary"
                onPress={() => {
                  leaveGroup(groupId, profileId).then(() => {
                    queryClient.invalidateQueries({
                      queryKey: ["groupRel", { groupId }],
                    });
                    queryClient.invalidateQueries({ queryKey: ["group"] });
                    queryClient.invalidateQueries({
                      queryKey: ["groupRel user", { groupId }],
                    });
                    queryClient.invalidateQueries({ queryKey: ["groupRel"] });
                    queryClient.invalidateQueries({
                      queryKey: ["group profile"],
                    });
                    queryClient.invalidateQueries({
                      queryKey: ["groupRel profile"],
                    });
                    showSuccessToast(toast, "Left group!");
                  });
                }}
                size="lg"
              >
                <ButtonText>Leave Group</ButtonText>
              </Button>
            ) : (
              <></>
            )
          ) : (
            <></>
          )}
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
  return events && events.length > 0 ? (
    events.map((event) => <EventCard event={event} key={event.id} />)
  ) : (
    <Alert action="muted" variant="solid">
      <AlertIcon as={InfoIcon} />
      <AlertText>No {type} found!</AlertText>
    </Alert>
  );
}
