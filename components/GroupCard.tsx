import { useRouter } from "expo-router";
import { Card } from "./ui/card";
import { Heading } from "./ui/heading";
import { Pressable } from "./ui/pressable";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";
import { GroupOverview } from "@/types/extended-types";
import { HStack } from "./ui/hstack";
import { Avatar, AvatarFallbackText, AvatarImage } from "./ui/avatar";

export default function GroupCard({ group }: { group: GroupOverview }) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => {
          router.push({
            pathname: "/group/[id]",
            params: { id: group.groupId },
          })
        }
      }
    >
      <Card variant="outline">
        <HStack space="2xl">
          <Avatar className="bg-indigo-600" size="md">
            {group.icon ? (
              <AvatarImage source={{ uri: group.icon }} />
            ) : (
              <AvatarFallbackText className="text-white">{group.title[0]}</AvatarFallbackText>
            )}
          </Avatar>
          <VStack className="flex-1">
            <Heading className="flex-shrink flex-wrap" size="md">{group.title}</Heading>
            <Text className="flex-shrink flex-wrap">{group.goal}</Text>
          </VStack>
        </HStack>
      </Card>
    </Pressable>
  );
}
