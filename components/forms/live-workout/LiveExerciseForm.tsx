import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { AddIcon, RemoveIcon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { ExerciseData } from "@/types/workout-types";
import { Controller, useFieldArray } from "react-hook-form";
import { TextInput } from "react-native";
import { useLiveWorkout } from "./LiveWorkoutContext";

export default function LiveExerciseForm({
  exercise,
  index,
}: {
  exercise: ExerciseData;
  index: number;
}) {
  const { control } = useLiveWorkout();

  const {
    fields: sets,
    append: addSet,
    remove: removeSet,
  } = useFieldArray({
    control,
    name: `exercises.${index}.sets`,
  });

  return (
    <VStack space="xs">
      <Heading className="text-kova-500">{exercise.info.name}</Heading>
      <VStack space="lg">
        <VStack space="sm">
          <Box className="flex flex-row items-center justify-between">
            <Heading size="sm" className="h-6 w-16">
              Set
            </Heading>
            <Heading size="sm" className="h-6 w-16">
              lbs
            </Heading>
            <Heading size="sm" className="h-6 w-16">
              Reps
            </Heading>
            <Box className="h-6 w-16" />
          </Box>
          {sets.map((set, i) => (
            <Box
              key={set.id}
              className="flex flex-row items-center justify-between"
            >
              <Box className="rounded-md h-6 w-16 flex justify-center items-center bg-secondary-500">
                <Text size="sm" className="font-bold text-typography-900">
                  {i + 1}
                </Text>
              </Box>
              <Box className="rounded-md h-6 w-16 flex justify-center items-center bg-secondary-500">
                <Controller
                  control={control}
                  name={`exercises.${index}.sets.${i}.weight`}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      placeholder="0"
                      id={`weight-${i}`}
                      value={value?.toString() || ""}
                      onChangeText={(text) => onChange(Number(text) || 0)}
                      className="font-bold text-typography-900"
                      keyboardType="numeric"
                    />
                  )}
                />
              </Box>
              <Box className="rounded-md h-6 w-16 flex justify-center items-center bg-secondary-500">
                <Controller
                  control={control}
                  name={`exercises.${index}.sets.${i}.reps`}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      placeholder="0"
                      id={`weight-${i}`}
                      value={value?.toString() || ""}
                      onChangeText={(text) => onChange(Number(text) || 0)}
                      className="font-bold text-typography-900"
                      keyboardType="numeric"
                    />
                  )}
                />
              </Box>
              <Button
                variant="outline"
                action="primary"
                className="border-0 w-16"
                onPress={() => {
                  removeSet(i);
                }}
              >
                <ButtonIcon as={RemoveIcon} size="lg" />
              </Button>
            </Box>
          ))}
        </VStack>
        <Button
          variant="solid"
          action="secondary"
          size="sm"
          onPress={() =>
            addSet({
              reps: 0,
              weight: 0,
            })
          }
        >
          <ButtonText>Add Set</ButtonText>
          <ButtonIcon as={AddIcon} />
        </Button>
      </VStack>
    </VStack>
  );
}
