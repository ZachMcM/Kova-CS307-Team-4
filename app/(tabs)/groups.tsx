import Container from "@/components/Container";
import GroupCard from "@/components/GroupCard";
import { useSession } from "@/components/SessionContext";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { getAllGroups, getGroupsOfUser } from "@/services/groupServices";
import { GroupOverview } from "@/types/extended-types";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { RefreshControl, ScrollView } from "react-native";

export default function Groups() {
  const { session } = useSession();
  
  const { data: groups, isPending } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const groups = await getAllGroups();
      return groups;
    },
  });

  const router = useRouter();

  const { data: userGroupIds, isPending: isUserPending } = useQuery({
    queryKey: ["groupRel"],
    queryFn: async () => {
      const userGroupsIds = await getGroupsOfUser(session!.user.user_metadata.profileId)
      return userGroupsIds
    }
  })

  const userGroups = [] as GroupOverview[]

  if (!isPending && !isUserPending && groups && userGroupIds) {
    for (let i = groups.length - 1; i >= 0; i--) {
      if (userGroupIds.includes(groups[i].groupId)) {
        const group = groups.splice(i, 1)[0]
        userGroups.push(group)
      }
    }
  }

  return (
    // TODO work on this UI
    <Container>
      <VStack space="2xl">
        <VStack>
          <Heading className="text-4xl lg:text-5xl xl:text-[56px]">
            Groups
          </Heading>
          <Text>View all of your groups</Text>
        </VStack>
        <Button
          size="xl"
          action="kova"
          variant="solid"
          className="ml-[38px] mr-[38px]"
          onPress={() => router.replace("./create-group")}
        >
          <ButtonText className="text-white">Create Group</ButtonText>
        </Button>
        {isPending && isUserPending ? (
          <Spinner />
        ) : (
          <><Heading>Your Groups</Heading><VStack space="md">
              {(userGroups.length >= 1) ? (
                userGroups?.map((group) => (
                  <GroupCard key={group.groupId} group={group} />
                ))) : <Text>You haven't joined a group yet. Join one!</Text>}
            </VStack><Heading>All Groups</Heading><VStack space="md">
                {groups?.map((group) => (
                  <GroupCard key={group.groupId} group={group} />
                ))}
            </VStack></> 
        )}
      </VStack>
    </Container>
  );
}
