import { Tables } from "@/types/database.types";
import { useRouter } from "expo-router";
import { Card } from "./ui/card";
import { Heading } from "./ui/heading";
import { Pressable } from "./ui/pressable";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

export default function GroupCard({ group }: { group: Tables<"group"> }) {
  const router = useRouter();

  return (
    // TODO work on this UI
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/group/[id]",
          params: { id: group.id },
        })
      }
    >
      <Card variant="outline">
        <VStack>
          <Heading size="md">{group.title}</Heading>
          <Text>{group.description}</Text>
        </VStack>
      </Card>
    </Pressable>
  );
}
