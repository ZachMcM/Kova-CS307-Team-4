import Container from "@/components/Container";
import MemberCard from "@/components/MemberCard";
import { useSession } from "@/components/SessionContext";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { ChevronLeftIcon, Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  getGroup,
  getGroupProfiles,
  getMembers,
} from "@/services/groupServices";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router/build/hooks";
import { useEffect } from "react";

export default function GroupMembers() {
  const { id: groupId } = useLocalSearchParams() as { id: string };
  const queryClient = useQueryClient();

  const { data: group, isPending } = useQuery({
    queryKey: ["group", { groupId }],
    queryFn: async () => {
      const group = await getGroup(groupId as string);
      return group;
    },
  });

  const { data: members, isPending: gettingMembers } = useQuery({
    queryKey: ["groupRel", { groupId }],
    queryFn: async () => {
      const members = await getMembers(groupId);
      return members;
    },
  });
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["groupRel", { groupId }] });
  }, []);
  const router = useRouter();

  return (
    <Container>
      {isPending ? (
        <Spinner />
      ) : (
        <VStack space="xl">
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
            className="p-3"
          >
            <HStack>
              <Icon as={ChevronLeftIcon} className="mt-0"></Icon>
              <ButtonText>Back to Group</ButtonText>
            </HStack>
          </Button>
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
              <Text>Members</Text>
            </VStack>
          </HStack>
          {
            <VStack space="md">
              {gettingMembers ? (
                <Spinner />
              ) : (
                Array.isArray(members) &&
                members.map((member) => (
                  <MemberCard key={member.profileId} groupRel={member} />
                ))
              )}
            </VStack>
          }
        </VStack>
      )}
    </Container>
  );
}
