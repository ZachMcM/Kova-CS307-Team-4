import Tag from "@/components/Tag";
import { Box } from "@/components/ui/box";
import {
  Button,
  ButtonIcon,
  ButtonSpinner,
  ButtonText,
} from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { useToast } from "@/components/ui/toast";
import { sampleExercises } from "@/sample-data/exercises";
import { showErrorToast } from "@/services/toastServices";
import { Tables } from "@/types/database.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { SearchIcon, TrashIcon } from "../../ui/icon";
import { Input, InputField, InputIcon, InputSlot } from "../../ui/input";
import { VStack } from "../../ui/vstack";
import ExerciseDataForm from "./ExerciseDataForm";
import { TemplateFormValues, useTemplateForm } from "./TemplateFormContext";

export default function TemplateForm() {
  // TODO remove and replace with actual searching and exercise search component
  const [exerciseQuery, setExerciseQuery] = useState<string>("");

  const { control, handleSubmit, watch, formState } = useTemplateForm();

  const templateId = watch("id");

  const toast = useToast();

  const queryClient = useQueryClient();

  const { mutate: saveTemplate, isPending } = useMutation({
    mutationFn: async (values: TemplateFormValues) => {
      console.log(values);
      // TODO implement db call
    },
    onSuccess: () => {
      // TODO redirect to antoher page
      queryClient.invalidateQueries({
        queryKey: ["template", templateId],
      });
    },
    onError: (e) => {
      console.log(e);
      showErrorToast(toast, e.message);
    },
  });

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

  async function onSubmit(values: FieldValues) {
    console.log(values);
    saveTemplate(values as TemplateFormValues);
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
        <VStack>
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
                      tag.name
                        .toLowerCase()
                        .includes(exerciseQuery.toLowerCase())
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
                        {exercise.tags.map((tag: Tables<"Tag">) => (
                          <Tag key={tag.id} tag={tag} />
                        ))}
                      </Box>
                    </VStack>
                  </Card>
                </Pressable>
              ))}
          {exercises.map((exercise, i) => (
            <VStack space="md" key={exercise.info.id}>
              <HStack className="justify-between items-center">
                <Heading className="text-kova-500">
                  {exercise.info.name}
                </Heading>
                <Button
                  size="xs"
                  onPress={() => {
                    removeExercise(i);
                  }}
                  variant="outline"
                  action="primary"
                  className="border-0"
                >
                  <ButtonIcon as={TrashIcon} size="lg" color="red" />
                </Button>
              </HStack>
              <ExerciseDataForm key={exercise.info.id} index={i} />
            </VStack>
          ))}
          <Controller
            control={control}
            name="data"
            rules={{ required: true }}
            render={({ fieldState }) => (
              <FormControl isInvalid={fieldState.invalid} size="md">
                <FormControlError>
                  <FormControlErrorText>
                    {fieldState.error?.message ||
                      formState.errors.data?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
            )}
          />
        </VStack>
      </VStack>
      <Button size="xl" action="kova" onPress={handleSubmit(onSubmit)}>
        <ButtonText>Save Template</ButtonText>
        {isPending && <ButtonSpinner color={"FFF"} />}
      </Button>
    </VStack>
  );
}
