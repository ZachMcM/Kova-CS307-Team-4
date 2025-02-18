import Container from "@/components/Container";
import TemplateCard from "@/components/TemplateCard";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { AddIcon, Icon, SearchIcon } from "@/components/ui/icon";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Link, useRouter } from "expo-router";

export default function Workout() {
  // sample data array
  const sampleData = [
    {
      id: "22C3B14C-ED50-49FD-BD45-5639029AFF3D",
      name: "Chest/Tris Day",
      data: ""
    }
  ]

  // router from expo-router
  const router = useRouter()

  return (
    <Container>
      <VStack space="lg">
        <VStack space="sm">
          <Heading className="text-4xl lg:text-5xl xl:text-[56px]">
            Workout
          </Heading>
          <Text className="">
            Choose a workout template and start your workout
          </Text>
        </VStack>
        {/* Needs to be replaced by actual search component from areeb @AreebE */}
        <Input>
          <InputField placeholder="Search for a workout template" />
        </Input>
        {/* Simulates looping through templates */}
        {
          sampleData.map((template) => (
            <TemplateCard key={template.id} template={template}/>
          ))
        }
          <Button 
            variant="solid" 
              size="lg" 
              action="secondary" 
              onPress={() => router.replace("/(tabs)/new-template")}
          >
            <ButtonText>New Template</ButtonText>
            <Icon as={AddIcon}/>
          </Button>
      </VStack>
    </Container>
  );
}
