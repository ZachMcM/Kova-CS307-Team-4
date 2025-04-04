import { Tables } from "@/types/database.types";
import { useRouter } from "expo-router";
import { Card } from "./ui/card";
import { Heading } from "./ui/heading";
import { Pressable } from "./ui/pressable";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";
import { GroupOverview, GroupRelWithProfile, MemberRelationship } from "@/types/extended-types";
import { HStack } from "./ui/hstack";
import { Avatar, AvatarFallbackText, AvatarImage } from "./ui/avatar";
import { Button, ButtonIcon, ButtonText } from "./ui/button";
import { ArrowDownIcon, ArrowUpIcon } from "./ui/icon";
import { setRole } from "../services/groupServices"
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "./ui/toast";
import { useEffect } from "react";
import { useSession } from "./SessionContext";
import { showSuccessToast } from "@/services/toastServices";

export default function MemberCard({ groupRel, isOwner }: { groupRel: GroupRelWithProfile, isOwner: boolean}) {
  const profileId = useSession().session?.user.user_metadata.profileId
  const router = useRouter();
  const queryClient = useQueryClient()
  const toast = useToast()
  const groupId = groupRel.groupId
  console.log(profileId + ", " + groupRel.profileId + ", " + groupRel.profile.id + ", " + JSON.stringify(groupRel))
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/profiles/[id]",
          params: { id: groupRel.profile.userId },
        })
      }
    >
      <Card variant="outline">
        <HStack space="2xl">
          <Avatar className="bg-indigo-600" size="md">
            {groupRel.profile.avatar ? (
              <AvatarImage source={{ uri: groupRel.profile.avatar }} />
            ) : (
              <AvatarFallbackText className="text-white">{groupRel.profile.name[0]}</AvatarFallbackText>
            )}
          </Avatar>
          <VStack>
            <Heading size="md">{groupRel.profile.name}</Heading>
            <Text>{groupRel.role}</Text>
          </VStack>
          {
            (isOwner && groupRel.profile.id !== profileId) ? (
            groupRel.role == "owner" ? 
            <Button onPress={() => {
              setRole(groupId, groupRel.profile.id, "member")
              showSuccessToast(toast, "Successfully demoted user!")
              queryClient.invalidateQueries({queryKey: ["group", { groupId }]})
              queryClient.invalidateQueries({queryKey: ["groupRel", { groupId }]})
              queryClient.invalidateQueries({queryKey: ["groupRel members", { groupId }]})
              queryClient.invalidateQueries({queryKey: ["group members", { groupId }]})
              console.log(groupId + ", " + groupRel.groupId)

              router.push({
                pathname: "/(tabs)/group/members/[id]",
                params: { id: groupId },
              })
            }}>
              <ButtonIcon as={ArrowDownIcon}></ButtonIcon>
              <ButtonText>Demote</ButtonText>
            </Button> : 
            <Button onPress={() => {
              setRole(groupId, groupRel.profile.id, "owner")
              showSuccessToast(toast, "Successfully promoted user!")
              queryClient.invalidateQueries({queryKey: ["group", { groupId }]})
              queryClient.invalidateQueries({queryKey: ["groupRel", { groupId }]})
              queryClient.invalidateQueries({queryKey: ["group members", { groupId }]})
              queryClient.invalidateQueries({queryKey: ["groupRel members", { groupId }]})
              console.log(groupId + ", " + groupRel.groupId)
              router.push({
                pathname: "/(tabs)/group/members/[id]",
                params: { id: groupRel.groupId },
              })
            }}>
              <ButtonIcon as={ArrowUpIcon}></ButtonIcon>
              <ButtonText>Promote</ButtonText>
            </Button>) : <></>
          }
        </HStack>
      </Card>
    </Pressable>
  );
}
