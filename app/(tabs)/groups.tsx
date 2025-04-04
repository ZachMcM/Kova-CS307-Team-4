import Container from "@/components/Container";
import GroupCard from "@/components/GroupCard";
import { useSession } from "@/components/SessionContext";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { getAllGroups, getUserGroups } from "@/services/groupServices";
import { GroupOverview } from "@/types/extended-types";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView } from "react-native";

export default function ProfileScreen() {
  const { session } = useSession();
  const router = useRouter();

  const { data: groups, isPending } = useQuery({
    queryKey: ["group"],
    queryFn: async () => {
      const groups = await getAllGroups();
      console.log(JSON.stringify(groups))
      return groups;
    },
  });

  const [userGroupQuery, setUserGroupQuery] = useState("");
  const [groupQuery, setGroupQuery] = useState("");

  const { data: userGroups, isPending: isUserPending } = useQuery({
    queryKey: ["groupRel"],
    queryFn: async () => {
      console.log("Performing user query")
      const userGroups = await getUserGroups(session!.user.user_metadata.profileId)
      console.log(userGroups)
      return userGroups
    }
  })

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
              <Input>
                <InputField
                  value={userGroupQuery}
                  onChangeText={setUserGroupQuery}
                  placeholder="Search for one of your groups."
                />
              </Input>
              {(groups && groups!.length >= 1) ? (
                groups?.filter((group) => userGroups?.includes(group.groupId))
                  .filter((group) => group.title?.includes(userGroupQuery))
                  .map((group) => (
                  <GroupCard key={group.groupId} group={group} />
                ))) : <Text>You haven't joined a group yet. Join one!</Text>}
            </VStack><Heading>All Groups</Heading><VStack space="md">
                <Input>
                  <InputField
                    value={groupQuery}
                    onChangeText={setGroupQuery}
                    placeholder="Search for a group to join."
                  />
                </Input>
                {groups?.filter((group) => !userGroups?.includes(group.groupId))
                  .filter((group) => group.title?.includes(groupQuery))
                  .map((group) => (
                    <GroupCard key={group.groupId} group={group} />
                  ))}
            </VStack></> 
        )}
      </VStack>
    </Container>
  );
}
