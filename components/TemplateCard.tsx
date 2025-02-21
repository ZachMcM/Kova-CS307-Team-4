// need to change parameter type once generated

import { ExtendedTemplateWithCreator } from "@/types/extended-types";
import { Link } from "expo-router";
import { Box } from "./ui/box";
import { Button, ButtonText } from "./ui/button";
import { Card } from "./ui/card";
import { Heading } from "./ui/heading";
import { EditIcon, Icon } from "./ui/icon";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

export default function TemplateCard({
  template,
}: {
  template: ExtendedTemplateWithCreator;
}) {
  return (
    <Card variant="outline" className="p-6">
      <VStack space="md">
        <VStack space="sm">
          <Box className="flex flex-row justify-between">
            <Heading>{template.creator.profile.username}</Heading>
            {/* TODO implement edit functionality */}
            <Icon as={EditIcon} />
          </Box>
          {/* TODO add link to user's profile */}
          <Link href={{
            pathname: "/profiles/[id]",
            params: { id: template.creator.profile.userId! }
          }}>
            <Text>By: {template.creator.profile.username}</Text>
          </Link>
        </VStack>
        {/* TODO Finish this button with link to start workout */}
        <Button size="lg" variant="solid" action="kova">
          <ButtonText>Start Workout</ButtonText>
        </Button>
      </VStack>
    </Card>
  );
}
