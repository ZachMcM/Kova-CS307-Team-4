import { CompetitionWithGroup } from "@/types/extended-types";
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

export default function CompetitionCard({
  competition,
}: {
  competition: CompetitionWithGroup;
}) {
  const router = useRouter();

  return (
    // TODO work on this UI
    <Card variant="outline">
      <VStack space="lg">
        <Heading size="xl">{competition.title}</Heading>
        <VStack space="2xl">
          <HStack space="md" className="items-center">
            <Feather name="users" size={24} />
            <Link
              href={{
                pathname: "/group/[id]",
                params: { id: competition.group.id },
              }}
              className="text-lg"
            >
              {competition.group.title}
            </Link>
          </HStack>
          <VStack space="sm">
            <HStack space="md" className="items-center">
              <Ionicons name="calendar-number-outline" size={22} />
              <Text size="md">
                {new Date(competition?.start_date!).toLocaleDateString()} -{" "}
                {new Date(competition?.end_date!).toLocaleDateString()}
              </Text>
            </HStack>
            <HStack space="md" className="items-center">
              <Feather name="target" size={22} />
              <Text size="md">
                {competition?.goal} Points
              </Text>
            </HStack>
          </VStack>
        </VStack>
      </VStack>
      <Button
        onPress={() =>
          router.push({
            pathname: "/competition/[id]",
            params: { id: competition.id },
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
