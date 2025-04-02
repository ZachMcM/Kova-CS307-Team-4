import Container from "@/components/Container";
import CollaborationProgress from "@/components/event/CollaborationProgress";
import EditEventDetails from "@/components/event/EditEventDetails";
import ExercisePointsView from "@/components/event/ExercisePointsView";
import Leaderboard from "@/components/event/Leaderboard";
import YourWorkouts from "@/components/event/YourWorkouts";
import { useSession } from "@/components/SessionContext";
import {
  Button,
  ButtonIcon,
  ButtonSpinner,
  ButtonText,
} from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { CheckIcon, CloseIcon, EditIcon, Icon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import { Pressable } from "@/components/ui/pressable";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { editTitle, getEvent } from "@/services/groupEventServices";
import { getProfileGroupRel } from "@/services/groupServices";
import { showErrorToast, showSuccessToast } from "@/services/toastServices";
import { Tables } from "@/types/database.types";
import { Feather } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Redirect, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Controller, FieldValues, useForm } from "react-hook-form";
import * as z from "zod";

export default function Event() {
  const { id } = useLocalSearchParams();
  const { session } = useSession();

  const { data: event, isPending } = useQuery({
    queryKey: ["event", { id }],
    queryFn: async () => {
      const event = await getEvent(id as string);
      return event;
    },
  });

  const { data: groupRel } = useQuery({
    queryKey: ["group", { id }],
    queryFn: async () => {
      const groupRel = await getProfileGroupRel(
        session?.user.user_metadata.profileId,
        event?.groupId!
      );
      return groupRel;
    },
    enabled: !!event,
  });

  const [editDetails, setEditDetails] = useState(false);
  const [editTitle, setEditTitle] = useState(false);

  return (
    <Container>
      {isPending ? (
        <Spinner />
      ) : !event ? (
        <Redirect href="/feed" />
      ) : (
        <VStack space="4xl">
          {editTitle ? (
            <EditTile setEditTitle={setEditTitle} event={event} />
          ) : (
            <HStack className="items-center justify-between">
              <VStack space="sm">
                <Heading className="text-4xl lg:text-5xl xl:text-[56px]">
                  {event.title}
                </Heading>
                <HStack space="md" className="items-center">
                  <Feather name="users" size={24} />
                  <Link
                    href={{
                      pathname: "/group/[id]",
                      params: { id: event.group.id },
                    }}
                    className="text-lg"
                  >
                    {event.group.title}
                  </Link>
                </HStack>
              </VStack>
              {!editTitle && groupRel?.role == "owner" && (
                <Pressable
                  onPress={() => {
                    setEditTitle(true);
                  }}
                >
                  <Icon size="xl" as={EditIcon} />
                </Pressable>
              )}
            </HStack>
          )}
          <VStack space="lg">
            <HStack className="items-center justify-between">
              <VStack>
                <Heading size="xl">Details</Heading>
                <Text>
                  {editDetails ? "Edit" : "View"} {event.type} details
                </Text>
              </VStack>
              {!editDetails && groupRel?.role == "owner" && (
                <Pressable
                  onPress={() => {
                    setEditDetails(true);
                  }}
                >
                  <Icon size="xl" as={EditIcon} />
                </Pressable>
              )}
            </HStack>
            <Card variant="outline">
              {editDetails ? (
                <EditEventDetails
                  event={event}
                  setEditDetails={setEditDetails}
                />
              ) : (
                <VStack space="md">
                  <HStack space="md" className="items-center">
                    <Ionicons name="calendar-number-outline" size={24} />
                    <VStack>
                      <Heading size="md">Duration</Heading>
                      <Text size="md">
                        {new Date(event?.start_date!).toLocaleDateString()} -{" "}
                        {new Date(event?.end_date!).toLocaleDateString()}
                      </Text>
                    </VStack>
                  </HStack>
                  <HStack space="md" className="items-center">
                    <Feather name="target" size={24} />
                    <VStack>
                      <Heading size="md">Goal</Heading>
                      <Text size="md">{event?.goal} Points</Text>
                    </VStack>
                  </HStack>
                  <HStack space="md" className="items-center">
                    <Ionicons name="barbell" size={24} />
                    <VStack>
                      <Heading size="md">Weight Multiplier</Heading>
                      <Text size="md">x{event.weight_multiplier} Points</Text>
                    </VStack>
                  </HStack>
                  <HStack space="md" className="items-center">
                    <Ionicons name="arrow-up" size={24} />
                    <VStack>
                      <Heading size="md">Rep Multiplier</Heading>
                      <Text size="md">x{event.rep_multiplier} Points</Text>
                    </VStack>
                  </HStack>
                </VStack>
              )}
            </Card>
          </VStack>
          {event.type == "collaboration" && (
            <CollaborationProgress event={event} />
          )}
          <Leaderboard event={event} />
          <ExercisePointsView event={event} />
          <YourWorkouts event={event} />
        </VStack>
      )}
    </Container>
  );
}

function EditTile({
  event,
  setEditTitle,
}: {
  event: Tables<"groupEvent">;
  setEditTitle: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const schema = z.object({
    title: z
      .string()
      .min(1, { message: "Title is required" })
      .max(250, { message: "Title must be less than 250 characters" }),
  });

  const form = useForm({
    resolver: zodResolver(schema),
  });

  function onSubmit(values: FieldValues) {
    mutate(values as { title: string });
  }

  const toast = useToast();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ title }: { title: string }) => {
      await editTitle(title, event.id);
    },
    onError: (err) => {
      showErrorToast(toast, err.message);
    },
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({ queryKey: ["event", { id: event.id }] });
      setEditTitle(false);
      showSuccessToast(toast, "Successfully edited title");
    },
  });

  return (
    <VStack space="lg">
      <Controller
        control={form.control}
        name="title"
        render={({ field: { onChange, value }, fieldState }) => (
          <FormControl isInvalid={fieldState.invalid}>
            <VStack space="sm">
              <Heading size="md">Title</Heading>
              <Input>
                <InputField
                  onChangeText={onChange}
                  value={value}
                  placeholder="Enter a title..."
                />
              </Input>
            </VStack>
            <FormControlError>
              <FormControlErrorText>
                {fieldState.error?.message || "Invalid weight multiplier"}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        )}
      />
      <HStack space="sm">
        <Button action="secondary" onPress={() => setEditTitle(false)}>
          <ButtonText>Cancel</ButtonText>
          <ButtonIcon as={CloseIcon} />
        </Button>
        <Button action="kova" onPress={form.handleSubmit(onSubmit)}>
          <ButtonText>Save</ButtonText>
          {isPending ? (
            <ButtonSpinner color="#FFF" />
          ) : (
            <ButtonIcon as={CheckIcon} />
          )}
        </Button>
      </HStack>
    </VStack>
  );
}
