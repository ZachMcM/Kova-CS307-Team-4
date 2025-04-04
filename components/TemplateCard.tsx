// need to change parameter type once generated

import { startWorkout } from "@/services/asyncStorageServices";
import { showErrorToast } from "@/services/toastServices";
import { ExtendedTemplateWithCreator } from "@/types/extended-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "expo-router";
import { Box } from "./ui/box";
import { Button, ButtonSpinner, ButtonText } from "./ui/button";
import { Card } from "./ui/card";
import { Heading } from "./ui/heading";
import { EditIcon, Icon } from "./ui/icon";
import { Pressable } from "./ui/pressable";
import { Text } from "./ui/text";
import { useToast } from "./ui/toast";
import { VStack } from "./ui/vstack";

export default function TemplateCard({
  template,
}: {
  template: ExtendedTemplateWithCreator;
}) {
  const router = useRouter();

  const toast = useToast();

  const queryClient = useQueryClient();

  const { mutate: initWorkout, isPending } = useMutation({
    mutationFn: async () => {
      await startWorkout({
        templateId: template.id,
        templateName: template.name!,
        exercises: template.data,
        startTime: Date.now(),
        endTime: null,
      });
    },
    onSuccess: () => {
      router.replace("/live-workout");
      queryClient.invalidateQueries({ queryKey: ["live-workout"] });
    },
    onError: (e) => {
      showErrorToast(toast, e.message);
    },
  });

  return (
    <Card variant="outline" className="p-6">
      <VStack space="md">
        <VStack space="sm">
          <Box className="flex flex-row justify-between">
            <Heading>{template.name}</Heading>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/templates/[id]",
                  params: { id: template.id },
                })
              }
            >
              <Icon size="xl" as={EditIcon} />
            </Pressable>
          </Box>
          <Link
            href={{
              pathname: "/profiles/[id]",
              params: { id: template.creatorProfile.userId! },
            }}
          >
            <Text>By: {template.creatorProfile.username}</Text>
          </Link>
        </VStack>
        <Button
          onPress={() => initWorkout()}
          size="lg"
          variant="solid"
          action="kova"
        >
          <ButtonText>Start Workout</ButtonText>
          {isPending && <ButtonSpinner color={"#FFF"} />}
        </Button>
      </VStack>
    </Card>
  );
}
