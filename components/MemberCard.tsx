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

export default function MemberCard({ groupRel }: { groupRel: GroupRelWithProfile }) {
  const router = useRouter();

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
        </HStack>
      </Card>
    </Pressable>
  );
}
