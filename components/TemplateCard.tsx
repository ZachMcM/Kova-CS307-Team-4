// need to change parameter type once generated

import { startWorkout } from "@/services/asyncStorageServices";
import { showErrorToast } from "@/services/toastServices";
import { ExtendedTemplateWithCreator } from "@/types/extended-types";
import { useMutation } from "@tanstack/react-query";
import { Link, useRouter } from "expo-router";
import { Box } from "./ui/box";
import { Button, ButtonSpinner, ButtonText } from "./ui/button";
import { Card } from "./ui/card";
import { Heading } from "./ui/heading";
import { EditIcon, Icon, ThreeDotsIcon } from "./ui/icon";
import { Text } from "./ui/text";
import { useToast } from "./ui/toast";
import { VStack } from "./ui/vstack";
import { Pressable } from "./ui/pressable";

export default function TemplateCard({
  template,
}: {
  template: ExtendedTemplateWithCreator;
}) {
  const router = useRouter();

  const toast = useToast();

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
      router.push("/live-workout");
    },
    onError: (e) => {
      showErrorToast(toast, e.message);
    },
  });

  return (
    <Card variant="outline" className="p-6">
      <VStack space="md">
        <VStack space="sm">
          <Pressable onPress={() => router.push(`/templates/${template.id}`)}>
          <Box className="flex flex-row justify-between">
            <Heading>{template.creator.profile.username}</Heading>
            <Icon as={ThreeDotsIcon} />
          </Box>
          </Pressable>
          <Link
            href={{
              pathname: "/profiles/[id]",
              params: { id: template.creator.profile.userId! },
            }}
          >
            <Text>By: {template.creator.profile.username}</Text>
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
