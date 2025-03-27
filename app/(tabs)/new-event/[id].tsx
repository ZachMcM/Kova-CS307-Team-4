import Container from "@/components/Container";
import EventForm from "@/components/event/EventForm";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useLocalSearchParams } from "expo-router";

export default function NewGroup() {
  const { id } = useLocalSearchParams() as { id: string }

  return (
    <Container>
    <VStack space="2xl">
      <VStack space="sm">
        <Heading className="text-4xl lg:text-5xl xl:text-[56px]">
          New Event
        </Heading>
        <Text>
          Create a new event
        </Text>
      </VStack>
      <EventForm groupId={id}/>
    </VStack>
  </Container>
  )
}