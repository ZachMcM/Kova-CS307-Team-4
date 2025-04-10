import Container from "@/components/Container";
import ExerciseCard from "@/components/forms/workout-template/ExerciseCard";
import { useSession } from "@/components/SessionContext";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { ArrowLeftIcon, SearchIcon } from "@/components/ui/icon";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { VStack } from "@/components/ui/vstack";
import { getExercises } from "@/services/exerciseServices";
import { useRoute } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function Exercises() {
  const { data: allExercises, isPending: exercisesPending } = useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      const exercises = await getExercises();
      return exercises;
    },
  });

  const [exerciseQuery, setExerciseQuery] = useState("");
  const router = useRouter();

  const { session } = useSession();

  return (
    <Container>
      <VStack space="lg">
        <VStack space="lg" className="items-start">
          <Button
            variant="link"
            onPress={() =>
              router.push({
                pathname: "/profiles/[id]",
                params: { id: session?.user.id! },
              })
            }
          >
            <ButtonIcon as={ArrowLeftIcon} />
            <ButtonText>Back</ButtonText>
          </Button>
          <Heading size="2xl">All Exercises</Heading>
        </VStack>
        <VStack space="md">
          <Input size="md">
            <InputField
              placeholder="Search for all exercises"
              onChangeText={setExerciseQuery}
              value={exerciseQuery}
            />
            <InputSlot className="p-3">
              <InputIcon as={SearchIcon} />
            </InputSlot>
          </Input>
          {exercisesPending ? (
            <Spinner />
          ) : (
            allExercises &&
            allExercises
              .filter(
                (exercise) =>
                  exercise.name
                    ?.toLowerCase()
                    .includes(exerciseQuery.toLowerCase()) ||
                  exercise.tags.filter((tag) =>
                    tag.name
                      ?.toLowerCase()
                      .includes(exerciseQuery.toLowerCase())
                  ).length > 0
              )
              .map((exercise) => (
                <ExerciseCard key={exercise.id} exercise={exercise} />
              ))
          )}
        </VStack>
      </VStack>
    </Container>
  );
}
