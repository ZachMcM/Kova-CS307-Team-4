import Container from "@/components/Container";
import { useSession } from "@/components/SessionContext";
import TemplateCardSkeleton from "@/components/skeletons/TemplateCardSkeleton";
import TemplateCard from "@/components/TemplateCard";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { AddIcon, Icon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { getUserTemplates } from "@/services/templateServices";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function Workout() {
  const { session } = useSession();

  const { data: templates, isPending } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const templates = await getUserTemplates(session?.user.user_metadata.profileId);
      return templates;
    },
  });

  // router from expo-router
  const router = useRouter();

  const [templateQuery, setTemplateQuery] = useState("");

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
          <InputField
            value={templateQuery}
            onChangeText={setTemplateQuery}
            placeholder="Search for a workout template"
          />
        </Input>
        {isPending
          ? Array(5)
              .fill("")
              .map((_, i) => <TemplateCardSkeleton key={i} />)
          : templates &&
            templates
              .filter((template) => template.name?.includes(templateQuery))
              .map((template) => (
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
