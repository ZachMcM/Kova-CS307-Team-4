import Container from "@/components/Container";
import GroupCard from "@/components/GroupCard";
import { useSession } from "@/components/SessionContext";
import { Heading } from "@/components/ui/heading";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { getAllGroups, getGroupsOfUser } from "@/services/groupServices";
import { GroupOverview } from "@/types/extended-types";
import { useQuery } from "@tanstack/react-query";

export default function ProfileScreen() {
  const { session } = useSession();

  const { data: groups, isPending } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const groups = await getAllGroups();
      return groups;
    },
  });

  const { data: userGroupIds, isPending: isUserPending } = useQuery({
    queryKey: ["groupRel"],
    queryFn: async () => {
      const userGroupsIds = await getGroupsOfUser(session!.user.id)
      return userGroupsIds
    }
  })

  const userGroups = [] as GroupOverview[]

  if (!isPending && !isUserPending && groups && userGroupIds) {
    for (let i = groups.length; i >= 0; i--) {
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
        <VStack space="sm">
          <Heading className="text-4xl lg:text-5xl xl:text-[56px]">
            Groups
          </Heading>
          <Text>View all of your groups</Text>
        </VStack>
        {isPending && isUserPending ? (
          <Spinner />
        ) : (
          <Container>
            <Heading>Your Groups</Heading>
            <VStack space="md">
              {groups?.map((group) => (
                <GroupCard key={group.groupId} group={group} />
              ))}
            </VStack>
            <Heading>All Groups</Heading>
            <VStack space="md">
              {groups?.map((group) => (
                <GroupCard key={group.groupId} group={group} />
              ))}
            </VStack>
          </Container>
        )}
      </VStack>
    </Container>
  );
}
