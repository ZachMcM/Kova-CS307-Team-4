import Container from "@/components/Container";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { showErrorToast, showSuccessToast } from "@/services/toastServices";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Icon, ChevronLeftIcon } from '@/components/ui/icon';
import { HStack } from "@/components/ui/hstack";
import { useSession } from "@/components/SessionContext";
import { createGroup, isTitleUnique } from "@/services/groupServices"
import { useQueryClient } from "@tanstack/react-query";
import { TextInput } from "react-native";

export default function CreateGroup() {
  const { session } = useSession();
  const profileId = session?.user?.user_metadata.profileId;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");

  const queryClient = useQueryClient()
  const toast = useToast();
  const router = useRouter();

  return (
    <Container>
      <Button
            variant = "outline"
            size = "md"
            action = "primary"
            onPress={() => router.replace("/groups")}
            className = "p-3">
            <HStack>
            <Icon as={ChevronLeftIcon} className="mt-0"></Icon>
            <ButtonText>Back to Groups</ButtonText>
            </HStack>
      </Button>
      <Card variant="ghost" className="p-10 mb-50">
        <VStack space="sm" className="mb-50">
          <Heading size="4xl">Group Creation</Heading>
        </VStack>
      </Card>
      <Card variant="outline" className="m-[25px]">
        <VStack space="sm">
          <Text size="lg" className="ml-3 mt-5">
            Title
          </Text>
          <Input className="ml-3 mr-5">
            <InputField
              value={title}
              onChangeText={setTitle}
              placeholder="Enter Title"
            />
          </Input>
        </VStack>
        <VStack space="sm">
          <Text size="lg" className="ml-3 mt-5">
            Description
          </Text>
          <Input className="ml-3 mr-5">
            <InputField
              value={description}
              onChangeText={setDescription}
              placeholder="Enter Description"
            />
          </Input>
        </VStack>
        <VStack space="sm">
          <Text size="lg" className="ml-3 mt-5">
            Goal
          </Text>
          <Input className="ml-3 mr-5">
            <InputField
              value={goal}
              onChangeText={setGoal}
              placeholder="Enter Goal"
            />
          </Input>
        </VStack>
        <Button
        variant="solid"
        size="xl"
        action="kova"
        className="mt-5 mb-5"
        onPress={() => {
            if (title === "") {
              showErrorToast(toast, "Error: Title cannot be empty.");
              return
            }
            if (description === "") {
              showErrorToast(toast, "Error: Description cannot be empty.");
              return
            }
            if (goal === "") {
              showErrorToast(toast, "Error: Goal cannot be empty.");
              return
            }
            isTitleUnique(title).then((isUnique) => {
              if (isUnique) {
                createGroup(profileId, title, description, goal).then((ids) => { 
                    router.replace({
                        pathname: "/(tabs)/group/[id]",
                        params: { id: ids[0]}
                    });
                    queryClient.invalidateQueries({queryKey: ["group"],})
                    queryClient.invalidateQueries({queryKey: ["groupRel"],})
                    queryClient.invalidateQueries({queryKey: ["group profile"]})
                    queryClient.invalidateQueries({queryKey: ["groupRel profile"]})
                    showSuccessToast(toast, "Successfully created group!")
                }).catch(error => {
                    console.log(error);
                    showErrorToast(toast, error.message);
                })
              }
              else {
                showErrorToast(toast, "Error: Title given is not unique.")
              }
            })
        }}
        >
        <ButtonText className="text-white">Create Group</ButtonText>
        </Button>
      </Card>
    </Container>
  );
}
