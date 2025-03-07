import Container from "@/components/Container";
import TemplateForm from "@/components/forms/workout-template/TemplateForm";
import { TemplateFormProvider } from "@/components/forms/workout-template/TemplateFormContext";
import ExerciseSearchView from "@/components/search-views/ExerciseSearchView";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { getExercises } from "@/services/exerciseServices";


export default function NewTemplate() {
  return (
    <Container>
      <VStack space="2xl">
        <VStack space="sm">
          <Heading className="text-4xl lg:text-5xl xl:text-[56px]">
            New Template
          </Heading>
          <Text>
            Search for exercises 
          </Text>
        </VStack>
        <TemplateFormProvider>
          <TemplateForm/>
        </TemplateFormProvider>
      </VStack>
    </Container>
  );
}
