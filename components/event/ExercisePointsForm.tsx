import { ExercisePointsFormValues } from "@/schemas/pointValuesSchema";
import { useState } from "react";
import { Controller, useFieldArray, UseFormReturn } from "react-hook-form";
import { VStack } from "../ui/vstack";
import { ExtendedExercise } from "@/types/extended-types";
import { Input, InputField, InputIcon, InputSlot } from "../ui/input";
import { Icon, SearchIcon, TrashIcon } from "../ui/icon";
import { Pressable } from "../ui/pressable";
import ExerciseCard from "../forms/workout-template/ExerciseCard";
import { Card } from "../ui/card";
import { HStack } from "../ui/hstack";
import { Heading } from "../ui/heading";

export default function ExercisePointsForm({
  form,
  allExercises,
}: {
  form: UseFormReturn<any>;
  allExercises: ExtendedExercise[];
}) {
  const {
    fields: exercises,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: "exercises",
  });

  const [exerciseQuery, setExerciseQuery] = useState("");

  return (
    <VStack space="2xl">
      <Input size="md">
        <InputField
          placeholder="Search exercises"
          onChangeText={setExerciseQuery}
          value={exerciseQuery}
        />
        <InputSlot className="p-3">
          <InputIcon as={SearchIcon} />
        </InputSlot>
      </Input>

      {exerciseQuery.length != 0 &&
        allExercises
          .filter(
            (exercise) =>
              (exercise.name
                ?.toLowerCase()
                .includes(exerciseQuery.toLowerCase()) ||
                exercise.tags.filter((tag) =>
                  tag.name?.toLowerCase().includes(exerciseQuery.toLowerCase())
                ).length > 0) &&
              !form
                .getValues("exercises")
                .find((other: any) => {
                  return other.exerciseId == exercise.id
                })
          )
          .map((exercise) => (
            <Pressable
              key={exercise.id}
              onPress={() => {
                append({
                  exerciseId: exercise.id,
                  exerciseName: exercise.name!,
                  points: 1,
                });
                setExerciseQuery("");
              }}
              className="flex flex-1"
            >
              <ExerciseCard exercise={exercise} />
            </Pressable>
          ))}
      {exercises.map((exercise, index) => (
        // @ts-expect-error
        <Card variant="outline" key={exercise.exerciseId}>
          <VStack space="xl">
            <HStack className="items-center justify-between">
              <Heading
                size="md"
              >
                {/* @ts-ignore-error */}
                {exercise.exerciseName}
              </Heading>
              <Pressable onPress={() => remove(index)}>
                <Icon as={TrashIcon} size="xl" color="red" />
              </Pressable>
            </HStack>
            <Controller
              control={form.control}
              name={`exercises.${index}.points`}
              render={({ field: { onChange, value } }) => (
                <HStack space="sm" className="items-center justify-center">
                  <Heading size="sm">Points:</Heading>
                  <Input size="sm" className=" flex-1">
                    <InputField
                      placeholder="1"
                      value={value?.toString()}
                      onChangeText={onChange}
                      keyboardType="numeric"
                    />
                  </Input>
                </HStack>
              )}
            />
          </VStack>
        </Card>
      ))}
    </VStack>
  );
}
