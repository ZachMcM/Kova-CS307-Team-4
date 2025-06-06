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
import { useIsFocused } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { TextInput } from "react-native";

export default function Groups() {
  const { session } = useSession();
  const router = useRouter();

  const { data: groups, isPending } = useQuery({
    queryKey: ["group"],
    queryFn: async () => {
      const groups = await getAllGroups();
      return groups;
    },
  });

  const [userGroupQuery, setUserGroupQuery] = useState("");
  const [groupQuery, setGroupQuery] = useState("");

  const { data: userGroups, isPending: isUserPending } = useQuery({
    queryKey: ["groupRel"],
    queryFn: async () => {
      const userGroups = await getUserGroups(session!.user.user_metadata.profileId)
      return userGroups
    }
  })

  const isFocused = useIsFocused();
  if (!isFocused) {
    return null;
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
          size="lg"
          action="kova"
          variant="solid"
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
