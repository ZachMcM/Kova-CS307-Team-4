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
  getMembers,
  getRole,
  isMemberOfGroup
} from "@/services/groupServices";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router/build/hooks";

export default function GroupMembers() {
  const { id: groupId } = useLocalSearchParams() as { id: string };
  const queryClient = useQueryClient();

  const { data: group, isPending } = useQuery({
    queryKey: ["group members", { groupId }],
    queryFn: async () => {
      const group = await getGroup(groupId as string);
      return group;
    },
  });

  const { data: members, isPending: gettingMembers } = useQuery({
    queryKey: ["groupRel members", { groupId }],
    queryFn: async () => {
      const members = await getMembers(groupId);
      return members;
    },
  });

  const profileId = useSession().session?.user.user_metadata.profileId
  const { data: isOwner, isPending: gettingRole } = useQuery({
    queryKey: ["groupRel user", { groupId }],
    queryFn: async () => {
      const partOfGroup = await isMemberOfGroup(groupId, profileId)
      if (partOfGroup) {
        return (await getRole(groupId, profileId)) === "owner"
      }
      else {
        return false
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
              {gettingMembers && gettingRole ? (
                <Spinner />
              ) : (
                Array.isArray(members) &&
                members.map((member) => (
                  <MemberCard
                    key={member.profileId + (Math.random() * 2).toString()}
                    groupRel={member}
                    isOwner={isOwner!}
                  />
                ))
              )}
            </VStack>
          }
        </VStack>
      )}
    </Container>
  );
}

/*
import Container from "@/components/Container";
import EventCard from "@/components/EventCard";
import MemberCard from "@/components/MemberCard";
import { useSession } from "@/components/SessionContext";
import { Alert, AlertIcon, AlertText } from "@/components/ui/alert";
import { Avatar, AvatarFallbackText, AvatarImage } from "@/components/ui/avatar";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { ChevronLeftIcon, Icon, InfoIcon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { getGroup, getMembers, getRole} from "@/services/groupServices";
import { Tables } from "@/types/database.types";
import { GroupRelWithProfile, MemberRelationship } from "@/types/extended-types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router/build/hooks";
import { useEffect } from "react";

export default function GroupMembers() {
  const { id: groupId } = useLocalSearchParams() as { id: string };
  const { session } = useSession();
  const queryClient = useQueryClient()

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
      const members = await getMembers(groupId)
      console.log("MEMBERS -- " + JSON.stringify(members))
      console.log(Array.isArray(members) + ", " + members)
      return members as GroupRelWithProfile[]
    }
  })

  const { data: isOwner, isPending: gettingUserRole } = useQuery({
    queryKey: ["groupRel", {groupId}],
    queryFn: async () => {
      const role = await getRole(groupId, session?.user.user_metadata.profileId)
      console.log("Got user role")
      if (role === "owner") {
        return true
      }
      return false
    }
  })
  
  useEffect(() => {
    queryClient.invalidateQueries({queryKey: ["groupRel", { groupId }]})
  }, [])
  const router = useRouter()
  
  return (
    <Container>
      {isPending ? (
        <Spinner />
      ) : (
        <VStack space="xl">
          <Button
            variant = "outline"
            size = "md"
            action = "primary"
            onPress={() => router.push({
              pathname: "/group/[id]",
              params: {id: groupId}})}
            className = "p-3">
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
                <AvatarFallbackText className="text-white">{group?.title![0]}</AvatarFallbackText>
              )}
            </Avatar>
            <VStack space="sm">
              <Heading className="text-4xl lg:text-5xl xl:text-[56px]">
                {group?.title}
              </Heading>
              <Text>Members</Text>
            </VStack>
          </HStack>
            
          
          {/* <VStack space="md">
            {
              (!gettingMembers ? 
                (members && typeof members === typeof MemberRelationship[]) ?
                  (members.map((groupRel) => <MemberCard key={groupRel.user_id} groupRel={groupRel}/>))
                  : (<Text>Error: Somehow, members were not loaded.</Text>)
                : (<Spinner/>))
            }
          </VStack> }
          {
            <VStack space="md">
              
              {(!gettingMembers) ?
                  {getMemberCards(members!, isOwner!)}: 
                 <Spinner/>
              }
            </VStack>
          }
        </VStack>
      )}
    </Container>
  );
}

function getMemberCards(members: GroupRelWithProfile[], isOwner: boolean) {
  return <VStack space="md">
          {Array.isArray(members) && 
            members?.map((groupRel) => <MemberCard key={groupRel.id} groupRel={groupRel} isOwner={isOwner}/>
            )}
        </VStack>
}
*/