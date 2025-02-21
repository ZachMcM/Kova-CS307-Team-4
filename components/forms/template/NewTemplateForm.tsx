import Tag from "@/components/Tag";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { sampleExercises } from "@/sample-data/exercises";
import { useState } from "react";
import { Controller, FieldValues, useFieldArray } from "react-hook-form";
import { Pressable } from "react-native";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "../../ui/form-control";
import { CloseIcon, SearchIcon } from "../../ui/icon";
import { Input, InputField, InputIcon, InputSlot } from "../../ui/input";
import { VStack } from "../../ui/vstack";
import ExerciseDataForm from "./ExerciseDataForm";
import { useTemplateForm } from "./TemplateFormContext";
import { Tables } from "@/types/database.types";

// TODO need to remove and replace with exercise search component

export default function NewTemplateForm() {
  // TODO remove and replace with actual searching
  const [exerciseQuery, setExerciseQuery] = useState<string>("");

  const { control, handleSubmit } = useTemplateForm();

  const {
    fields: exercises,
    append: addExercise,
    remove: removeExercise,
  } = useFieldArray({
    control,
    name: "data",
  });

  function isExerciseAdded(id: string) {
    for (const exercise of exercises) {
      if (exercise.info.id == id) {
        return true;
      }
    }
    return false;
  }

  function onSubmit(values: FieldValues) {
    // TODO make supabase api call
    console.log(values);
  }

  return (
    <VStack space="4xl">
      <VStack space="2xl">
        <Controller
          control={control}
          name="name"
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <FormControl isInvalid={fieldState.invalid} size="md">
              <FormControlLabel>
                <FormControlLabelText>Name</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  placeholder="Enter a template name"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                />
              </Input>
              <FormControlError>
                <FormControlErrorText>
                  {fieldState.error?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
          )}
        />
        {/* TODO replace with actual search bar @AreebE */}
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
          sampleExercises
            .filter(
              (exercise) =>
                (exercise.name
                  .toLowerCase()
                  .includes(exerciseQuery.toLowerCase()) ||
                  exercise.tags.filter((tag) =>
                    tag.name.toLowerCase().includes(exerciseQuery.toLowerCase())
                  ).length != 0) &&
                !isExerciseAdded(exercise.id)
            )
            .map((exercise) => (
              <Pressable
                key={exercise.id}
                onPress={() => {
                  setExerciseQuery("");
                  addExercise({
                    info: exercise,
                    sets: [
                      {
                        reps: 0,
                        weight: 0,
                      },
                    ],
                  });
                }}
                className="flex flex-1"
              >
                <Card variant="outline">
                  <VStack space="md">
                    <Heading size="md">{exercise.name}</Heading>
                    <Box className="flex flex-row flex-wrap gap-2">
                      {exercise.tags.map((tag: Tables<'Tag'>) => (
                        <Tag key={tag.id} tag={tag} />
                      ))}
                    </Box>
                  </VStack>
                </Card>
              </Pressable>
            ))}
        {exercises.map((exercise, i) => (
          <VStack space="xs" key={exercise.info.id}>
            <HStack className="justify-between items-center">
              <Heading className="text-kova-500">{exercise.info.name}</Heading>
              <Button
                size="xs"
                onPress={() => {
                  removeExercise(i);
                }}
                variant="outline"
                action="primary"
                className="border-0"
              >
                <ButtonIcon as={CloseIcon} size="lg" />
              </Button>
            </HStack>
            <ExerciseDataForm key={exercise.info.id} index={i} />
          </VStack>
        ))}
      </VStack>
      <Button action="kova" onPress={handleSubmit(onSubmit)}>
        <ButtonText>Save Template</ButtonText>
      </Button>
      <Controller
        control={control}
        name="data"
        rules={{ required: true }}
        render={({ fieldState }) => (
          <FormControl isInvalid={fieldState.invalid} size="md">
            <FormControlError>
              <FormControlErrorText>
                {fieldState.error?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        )}
      />
    </VStack>
  );
}
