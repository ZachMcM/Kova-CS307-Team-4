import Container from "@/components/Container";
import NewTemplateForm from "@/components/forms/template/NewTemplateForm";
import { TemplateFormProvider } from "@/components/forms/template/TemplateFormContext";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

export default function NewTemplate() {
  return (
    <Container>
      <VStack space="lg">
        <VStack space="sm">
          <Heading className="text-4xl lg:text-5xl xl:text-[56px]">
            New Template
          </Heading>
          <Text className="">
            Search for exercises 
          </Text>
        </VStack>
        <TemplateFormProvider>
          <NewTemplateForm/>
        </TemplateFormProvider>
      </VStack>
    </Container>
  );
}
