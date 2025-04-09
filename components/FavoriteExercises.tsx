import {
  getExercises,
  getFavoriteExercises,
} from "@/services/exerciseServices";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import ExerciseCard from "./forms/workout-template/ExerciseCard";
import { useSession } from "./SessionContext";
import { Alert, AlertIcon, AlertText } from "./ui/alert";
import { Button, ButtonIcon, ButtonText } from "./ui/button";
import { Heading } from "./ui/heading";
import { HStack } from "./ui/hstack";
import {
  ArrowRightIcon,
  CloseIcon,
  Icon,
  InfoIcon,
  SearchIcon,
} from "./ui/icon";
import { Input, InputField, InputIcon, InputSlot } from "./ui/input";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
} from "./ui/modal";
import { Spinner } from "./ui/spinner";
import { VStack } from "./ui/vstack";
import { router } from "expo-router";

export default function FavoriteExercises() {
  const [exerciseQuery, setExerciseQuery] = useState("");

  const { session } = useSession();

  const { data: favoriteExercises, isPending } = useQuery({
    queryKey: ["favorite-exercises"],
    queryFn: async () => {
      const favorites = await getFavoriteExercises(
        session?.user.user_metadata.profileId
      );
      return favorites;
    },
  });

  return (
    <VStack space="md">
      <HStack className="items-center justify-between">
        <Heading size="2xl">Favorite Exercises</Heading>
        <Button variant="link" onPress={() => router.push("/exercises")}>
          <ButtonText>View All</ButtonText>
          <ButtonIcon as={ArrowRightIcon} />
        </Button>
      </HStack>
      {isPending ? (
        <Spinner />
      ) : favoriteExercises && favoriteExercises.length > 0 ? (
        <VStack space="md">
          <Input size="md">
            <InputField
              placeholder="Search for your favorite exercises"
              onChangeText={setExerciseQuery}
              value={exerciseQuery}
            />
            <InputSlot className="p-3">
              <InputIcon as={SearchIcon} />
            </InputSlot>
          </Input>
          {favoriteExercises
            .filter(
              (exercise) =>
                exercise.name
                  ?.toLowerCase()
                  .includes(exerciseQuery.toLowerCase()) ||
                exercise.tags.filter((tag) =>
                  tag.name?.toLowerCase().includes(exerciseQuery.toLowerCase())
                ).length > 0
            )
            .map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
        </VStack>
      ) : (
        <Alert action="muted" variant="solid">
          <AlertIcon as={InfoIcon} />
          <AlertText>No favorite exercises</AlertText>
        </Alert>
      )}
    </VStack>
  );
}
