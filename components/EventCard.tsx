import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import { Link, useRouter } from "expo-router";
import { Button, ButtonIcon, ButtonText } from "./ui/button";
import { Card } from "./ui/card";
import { Heading } from "./ui/heading";
import { HStack } from "./ui/hstack";
import { ArrowRightIcon } from "./ui/icon";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";
import { EventWithGroup } from "@/types/extended-types";
import { Tables } from "@/types/database.types";

export default function EventCard({
  event,
}: {
  event: Tables<'groupEvent'>;
}) {
  const router = useRouter();

  return (
    <Card variant="outline">
      <VStack space="lg">
        <VStack>
          <Text className="capitalize" size="sm">{event.type}</Text>
          <Heading size="xl">{event.title}</Heading>
        </VStack>
        <VStack space="2xl">
          <VStack space="sm">
            <HStack space="md" className="items-center">
              <Ionicons name="calendar-number-outline" size={22} />
              <Text size="md">
                {new Date(event?.start_date!).toLocaleDateString()} -{" "}
                {new Date(event?.end_date!).toLocaleDateString()}
              </Text>
            </HStack>
            <HStack space="md" className="items-center">
              <Feather name="target" size={22} />
              <Text size="md">
                {event?.goal} Points
              </Text>
            </HStack>
          </VStack>
        </VStack>
      </VStack>
      <Button
        onPress={() =>
          router.push({
            pathname: "/event/[id]",
            params: { id: event.id },
          })
        }
        action="kova"
        className=" self-end"
      >
        <ButtonText>View Details</ButtonText>
        <ButtonIcon as={ArrowRightIcon} />
      </Button>
    </Card>
  );
}
