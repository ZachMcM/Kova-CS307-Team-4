import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Grid, GridItem } from "@/components/ui/grid";
import { Heading } from "@/components/ui/heading";
import { AddIcon, CheckIcon, Icon, TrashIcon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { showErrorToast } from "@/services/toastServices";
import { ExerciseData } from "@/types/workout-types";
import clsx from "clsx";
import { Controller, useFieldArray, useWatch } from "react-hook-form";
import { TextInput } from "react-native";
import { useLiveWorkout } from "./LiveWorkoutContext";

export default function LiveExerciseForm({
  exercise,
  index,
}: {
  exercise: ExerciseData;
  index: number;
}) {
  const { control, setValue } = useLiveWorkout();

  const {
    fields: sets,
    append: addSet,
    remove: removeSet,
  } = useFieldArray({
    control,
    name: `exercises.${index}.sets`,
  });

  const toast = useToast();

  return (
    <VStack space="xs">
      <Heading className="text-kova-500">{exercise.info.name}</Heading>
      <VStack space="lg">
        <VStack space="sm">
          <Grid
            _extra={{
              className: "grid-cols-8",
            }}
          >
            <GridItem
              _extra={{
                className: "col-span-2",
              }}
            >
              <Heading size="md">Set</Heading>
            </GridItem>
            <GridItem
              _extra={{
                className: "col-span-2",
              }}
            >
              <Heading size="md">lbs</Heading>
            </GridItem>
            <GridItem
              _extra={{
                className: "col-span-2",
              }}
            >
              <Heading size="md">Reps</Heading>
            </GridItem>
          </Grid>
          {sets.map((set, i) => (
            <Grid
              key={set.id}
              className="items-center gap-4"
              _extra={{
                className: "grid-cols-8",
              }}
            >
              <GridItem
                className="rounded-md h-8 flex justify-center items-center bg-secondary-500"
                _extra={{
                  className: "col-span-2",
                }}
              >
                <Text size="md" className="font-bold text-typography-900">
                  {i + 1}
                </Text>
              </GridItem>
              <GridItem
                className="rounded-md h-8 flex justify-center items-center bg-secondary-500"
                _extra={{
                  className: "col-span-2",
                }}
              >
                <Controller
                  control={control}
                  name={`exercises.${index}.sets.${i}.weight`}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      placeholder="0"
                      id={`weight-${i}`}
                      value={value?.toString() || ""}
                      onChangeText={(text) => onChange(Number(text) || 0)}
                      className="font-bold text-typography-900 w-full h-full text-center"
                      keyboardType="numeric"
                    />
                  )}
                />
              </GridItem>
              <GridItem
                className="rounded-md h-8 flex justify-center items-center bg-secondary-500"
                _extra={{
                  className: "col-span-2",
                }}
              >
                <Controller
                  control={control}
                  name={`exercises.${index}.sets.${i}.reps`}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      placeholder="0"
                      id={`weight-${i}`}
                      value={value?.toString() || ""}
                      onChangeText={(text) => onChange(Number(text) || 0)}
                      className="font-bold text-typography-900 w-full h-full text-center"
                      keyboardType="numeric"
                    />
                  )}
                />
              </GridItem>
              <GridItem
                className="flex flex-row justify-end"
                _extra={{
                  className: "col-span-1",
                }}
              >
                <Controller
                  control={control}
                  name={`exercises.${index}.sets.${i}.done`}
                  render={({ field: { onChange, value } }) => (
                    <Pressable onPress={() => onChange(!value)}>
                      <Box
                        className={clsx(
                          "border-2 rounded-md fle w-6 h-6 justify-center items-center",
                          value
                            ? "border-success-200 bg-success-200"
                            : "border-outline-500 "
                        )}
                      >
                        {value && (
                          <Icon as={CheckIcon} size="md" color="#FFF" />
                        )}
                      </Box>
                    </Pressable>
                  )}
                />
              </GridItem>
              <GridItem
                className="flex flex-row justify-end"
                _extra={{
                  className: "col-span-1",
                }}
              >
                <Pressable
                  onPress={() => {
                    if (sets.length == 1) {
                      showErrorToast(
                        toast,
                        "You must have one set in an exercise"
                      );
                    } else {
                      removeSet(i);
                    }
                  }}
                >
                  <Icon as={TrashIcon} size="xl" color="red" />
                </Pressable>
              </GridItem>
            </Grid>
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
              done: false,
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
