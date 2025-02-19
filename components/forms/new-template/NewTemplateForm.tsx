import Tag from "@/components/Tag";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { useState } from "react";
import { Pressable } from "react-native";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "../../ui/form-control";
import { AlertCircleIcon, SearchIcon } from "../../ui/icon";
import { Input, InputField, InputIcon, InputSlot } from "../../ui/input";
import { VStack } from "../../ui/vstack";
import ExerciseForm from "../../exercise-form/ExerciseForm";
import { useNewTemplateFormValues } from "./NewTemplateFormContext";

// TODO need to remove and replace with exercise search component

const testExercises = [
  {
    id: "1234",
    name: "Chest Flies",
    tags: [
      {
        name: "chest",
        id: "1232342",
      },
    ],
  },
  {
    id: "12345",
    name: "Dumbell Pullovers",
    tags: [
      {
        name: "chest",
        id: "1233249802342",
      },
    ],
  },
  {
    id: "123456",
    name: "Incline Chest Press",
    tags: [
      {
        name: "chest",
        id: "123299342",
      },
    ],
  },
  {
    id: "123234",
    name: "Tricep Pulldowns",
    tags: [
      {
        name: "triceps",
        id: "124332342",
      },
    ],
  },
  {
    id: "122343234",
    name: "Skull Crushers",
    tags: [
      {
        name: "triceps",
        id: "1232330402340242",
      },
    ],
  },
];

export default function NewTemplateForm() {
  // TODO remove and replace with actual searching
  const [exerciseQuery, setExerciseQuery] = useState<string>("");

  const { nameError, name, setName, exercises, addExercise, editReps, editWeight, addSet, removeSet } =
    useNewTemplateFormValues();

  return (
    <VStack space="2xl">
      <FormControl isInvalid={nameError ? true : false} size="md">
        <FormControlLabel>
          <FormControlLabelText>Name</FormControlLabelText>
        </FormControlLabel>
        <Input>
          <InputField
            placeholder="Enter a template name"
            value={name}
            onChangeText={setName}
          />
        </Input>
        <FormControlError>
          <FormControlErrorIcon as={AlertCircleIcon} />
          <FormControlErrorText>{nameError}</FormControlErrorText>
        </FormControlError>
      </FormControl>
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
        testExercises
          .filter(
            (exercise) =>
              exercise.name
                .toLowerCase()
                .includes(exerciseQuery.toLowerCase()) ||
              exercise.tags.filter((tag) =>
                tag.name.toLowerCase().includes(exerciseQuery.toLowerCase())
              ).length != 0
          )
          .map((exercise) => (
            <Pressable
              key={exercise.id}
              onPress={() => {
                setExerciseQuery("");
                addExercise(exercise);
              }}
              className="flex flex-1"
            >
              <Card variant="outline">
                <VStack space="md">
                  <Heading size="md">{exercise.name}</Heading>
                  <Box className="flex flex-row flex-wrap gap-2">
                    {exercise.tags.map((tag: any) => (
                      <Tag key={tag.id} name={tag.name} />
                    ))}
                  </Box>
                </VStack>
              </Card>
            </Pressable>
          ))}
      {exercises.map((exercise) => (
        <ExerciseForm
          key={exercise.info.id * Math.random()}
          name={exercise.info.name}
          id={exercise.info.id}
          exercises={exercises}
          editReps={editReps}
          editWeight={editWeight}
          addSet={addSet}
          removeSet={removeSet}
        />
      ))}
      {/* TODO implement save template on context side */}
      <Button onPress={() => {

      }} className="bg-[#6FA8DC]">
        <ButtonText>Save Template</ButtonText>
      </Button>
    </VStack>
  );
}
