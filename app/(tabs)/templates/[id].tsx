import Container from "@/components/Container";
import TemplateForm from "@/components/forms/workout-template/TemplateForm";
import { TemplateFormProvider } from "@/components/forms/workout-template/TemplateFormContext";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { sampleTemplates } from "@/sample-data/templates";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";

export default function EditTemplate() {
  const { id } = useLocalSearchParams();

  const { data: template, isPending } = useQuery({
    queryKey: ["template", id],
    queryFn: async () => {
      // TODO implement db call
      return sampleTemplates.find((template) => template.id === id);
    },
  });

  return (
    <Container>
      <VStack space="2xl">
        <VStack space="sm">
          <Heading className="text-4xl lg:text-5xl xl:text-[56px]">
            Edit Template
          </Heading>
          <Text>Edit the workout template</Text>
        </VStack>
        {isPending ? (
          <></>
        ) : template ? (
          <TemplateFormProvider template={template}>
            <TemplateForm />
          </TemplateFormProvider>
        ) : (
          <></>
        )}
      </VStack>
    </Container>
  );
}
