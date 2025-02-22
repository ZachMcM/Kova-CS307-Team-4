import Container from "@/components/Container";
import TemplateCard from "@/components/TemplateCard";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { AddIcon, Icon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { sampleTemplates } from "@/sample-data/templates";
import { useRouter } from "expo-router";

export default function Workout() {
  // sample data array

  // router from expo-router
  const router = useRouter();

  return (
    <Container>
      <VStack space="2xl">
        <VStack space="sm">
          <Heading className="text-4xl lg:text-5xl xl:text-[56px]">
            Workout
          </Heading>
          <Text>Choose a workout template and start your workout</Text>
        </VStack>
        {/* TODO Needs to be replaced by actual search component from areeb @AreebE */}
        <Input>
          <InputField placeholder="Search for a workout template" />
        </Input>
        {/* TODO Simulates looping through templates */}
        {sampleTemplates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
        <Button
          variant="solid"
          size="lg"
          action="secondary"
          onPress={() => router.replace("/(tabs)/new-template")}
        >
          <ButtonText>New Template</ButtonText>
          <Icon as={AddIcon} />
        </Button>
      </VStack>
    </Container>
  );
}
