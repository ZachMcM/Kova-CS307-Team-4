import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useSession } from "./SessionContext";
import { getFavoriteExercises } from "@/services/exerciseServices";
import { VStack } from "./ui/vstack";
import { Heading } from "./ui/heading";
import { Input, InputField, InputIcon, InputSlot } from "./ui/input";
import { InfoIcon, SearchIcon } from "./ui/icon";
import { Spinner } from "./ui/spinner";
import { Alert, AlertIcon, AlertText } from "./ui/alert";
import ExerciseCard from "./forms/workout-template/ExerciseCard";

export default function FavoriteExercises() {
  const [exerciseQuery, setExerciseQuery] = useState("");

  const { session } = useSession();

  const { data: favoriteExercises, isPending } = useQuery({
    queryKey: [
      "favorite-exercises",
      { id: session?.user.user_metadata.profileId },
    ],
    queryFn: async () => {
      const favorites = await getFavoriteExercises(
        session?.user.user_metadata.profileId
      );
      return favorites;
    },
  });

  return (
    <VStack space="md">
      <Heading size="2xl">Exercises</Heading>
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
