import Container from "@/components/Container";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { showErrorToast, showSuccessToast } from "@/services/toastServices";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Icon, ChevronLeftIcon } from '@/components/ui/icon';
import { HStack } from "@/components/ui/hstack";
import { useSession } from "@/components/SessionContext";
import { getGroup, isTitleUniqueToGroup, updateGroup } from "@/services/groupServices"
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function EditGroup() {
    const { session } = useSession();
    const profileId = session?.user.user_metadata.profileId;
    const { id: groupId } = useLocalSearchParams() as { id: string };
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [goal, setGoal] = useState("");
    const toast = useToast();
    const router = useRouter();
    const queryClient = useQueryClient()

    const { data: group, isPending } = useQuery({
      queryKey: ["group edit", { groupId }],
      queryFn: async () => {
        const group = await getGroup(groupId);
        setTitle(group.title!)
        setDescription(group.description!)
        setGoal(group.goal!)
        return group
      },
    });
  
    return (
      <Container>
        <Button
              variant = "outline"
              size = "md"
              action = "primary"
              onPress={() => router.push({
                pathname: "/group/[id]",
                params: {id: groupId}})}
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
                placeholder="Edit Title"
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
                placeholder="Edit Description"
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
                placeholder="Edit Goal"
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
              isTitleUniqueToGroup(title, groupId).then((isUnique) => {
                if (isUnique) {
                  updateGroup(groupId, title, description, goal).then(() => {
                    showSuccessToast(toast, "Updated your group!")
                    queryClient.invalidateQueries({queryKey: ["group", { groupId }],})
                    queryClient.invalidateQueries({queryKey: ["group"],})
                    queryClient.invalidateQueries({queryKey: ["group edit", { groupId }]})
                    queryClient.invalidateQueries({queryKey: ["group profile"]})
                    queryClient.invalidateQueries({queryKey: ["groupRel profile"]})
                    router.push({
                      pathname: "/group/[id]",
                      params: {id: groupId}})
                    
                  }).catch(error => {
                      console.log(error);
                      showErrorToast(toast, error.message);
                  })
                }
                else {
                  showErrorToast(toast, "Error: Title is not unique.")
                }
              })
            }}
            >
            <ButtonText className="text-white">Confirm Edits</ButtonText>
          </Button>
        </Card>
      </Container>
    );
  }