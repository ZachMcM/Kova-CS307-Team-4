import { Box } from "../ui/box";
import { Button, ButtonText } from "../ui/button";
import { Card } from "../ui/card";
import { Heading } from "../ui/heading";
import { EditIcon, Icon } from "../ui/icon";
import { Text } from "../ui/text";
import { VStack } from "../ui/vstack";

type TutorialTemplate = {
  name: string;
  author: string
}


export default function TutorialTemplateCard({
  template,
}: {
  template: TutorialTemplate;
}) {

  return (
    <Card variant="outline" className="p-6">
      <VStack space="md">
        <VStack space="sm">
          <Box className="flex flex-row justify-between">
            <Heading>{template.name}</Heading>
              <Icon size="xl" as={EditIcon} />
          </Box>
          <Text>By: {template.author}</Text>
        </VStack>
        <Button
          size="lg"
          variant="solid"
          action="kova"
        >
          <ButtonText>Start Workout</ButtonText>
        </Button>
      </VStack>
    </Card>
  );
}
