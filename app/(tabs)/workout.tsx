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
import { createWordCounter, templatesToSearch } from "@/types/searcher-types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { TextInput } from "react-native";

export default function Workout() {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: templates, isPending } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const templates = await getUserTemplates(
        session?.user.user_metadata.profileId
      );
      return templates;
    },
  });
  const [templateQuery, setTemplateQuery] = useState("");

  let searchItems = undefined;
  let wordCounter = undefined;
  let searchIdToIndex = undefined;
  if (!isPending) {
    searchItems = templatesToSearch(templates!);
    wordCounter = createWordCounter(searchItems);
    searchIdToIndex = new Map<string, number>();
    for (let i = 0; i < searchItems.length; i++) {
      searchIdToIndex.set(searchItems[i].id, i);
    }
  }

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
