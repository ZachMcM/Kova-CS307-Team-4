// need to change parameter type once generated

import { Link } from "expo-router";
import { Box } from "./ui/box";
import { Button, ButtonText } from "./ui/button";
import { Card } from "./ui/card";
import { Heading } from "./ui/heading";
import { EditIcon, Icon } from "./ui/icon";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";
import { ExerciseData } from "@/types/exercise-data";

export default function TemplateCard({ template }: { template: any }) {
  return (
    <Card variant="outline" className="p-6">
      <VStack space="md">
        <VStack space="sm">
          <Box className="flex flex-row justify-between">
            <Heading>{template.name}</Heading>
            {/* TODO implement edit functionality */}
            <Icon as={EditIcon} />
          </Box>
          {/* TODO add link to user's profile */}
          <Link href="/">
            <Text>By: {template.user.username}</Text>
          </Link>
        </VStack>
        {/* TODO Finish this button with link to start workout */}
        <Button
          size="lg"
          variant="solid"
          className="bg-[#6FA8DC]"
          action="primary"
        >
          <ButtonText>Start Workout</ButtonText>
        </Button>
      </VStack>
    </Card>
  );
}
