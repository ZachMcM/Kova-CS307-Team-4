import { useSession } from "@/components/SessionContext";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { getExercises } from "@/services/exerciseServices";
import { getColors, getIntensities } from "@/services/intensityServices";
import { newTemplate, updateTemplate } from "@/services/templateServices";
import { showErrorToast } from "@/services/toastServices";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, FieldValues, useFieldArray } from "react-hook-form";
import { Pressable, TextInput } from "react-native";
import Body from "react-native-body-highlighter";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "../../ui/form-control";
import { Icon, SearchIcon, TrashIcon } from "../../ui/icon";
import { Input, InputField, InputIcon, InputSlot } from "../../ui/input";
import { VStack } from "../../ui/vstack";
import ExerciseCard from "./ExerciseCard";
import ExerciseDataForm from "./ExerciseDataForm";
import { TemplateFormValues, useTemplateForm } from "./TemplateFormContext";
import { useIsFocused } from "@react-navigation/native";

export default function TemplateForm() {
  // TODO remove and replace with actual searching and exercise search component
  const [exerciseQuery, setExerciseQuery] = useState<string>("");

  const { control, handleSubmit, watch, formState, getValues } =
    useTemplateForm();

  const templateId = watch("id");

  const toast = useToast();

  const queryClient = useQueryClient();

  const router = useRouter();

  const { session } = useSession();

  const { data: allExercises, isPending: exercisesLoading } = useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      const exercises = await getExercises();
      return exercises;
    },
  });

  const { mutate: saveTemplate, isPending } = useMutation({
    mutationFn: async (values: TemplateFormValues) => {
      console.log("Saving template", values);
      if (values.id) {
        await updateTemplate(values, session?.user.user_metadata.profileId);
      } else {
        await newTemplate(values, session?.user.user_metadata.profileId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["template", templateId],
      });
      queryClient.invalidateQueries({
        queryKey: ["templates"],
      });
      router.push("/workout");
    },
    onError: (e) => {
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

  // const { data: muscleGroups, isPending: loadingMuscleGroups } = useQuery({
  //   queryKey: ["muscleGroup"],
  //   queryFn: async () => {
  //     const muscleGroups = await getIntensities(
  //       exercises.map((exercise) => {
  //         return {
  //           name: exercise.info.name,
  //           sets: exercise.sets.length,
  //         };
  //       }),
  //       4
  //     );
  //     return muscleGroups;
  //   },
  // });

  async function onSubmit(values: FieldValues) {
    saveTemplate(values as TemplateFormValues);
  }

  const handleExerciseSubmit = async (exercise: any) => {
    setExerciseQuery("");

    console.log(exercise);

    if (exercise.type === "WEIGHTS") {
      console.log("Weights exercise");
      addExercise({
        info: {
          name: exercise.name!,
          id: exercise.id,
          type: exercise.type,
        },
        sets: [
          {
            reps: 0,
            weight: 0,
            cooldown: false,
          },
        ],
      });
    } else {
      console.log("Cardio exercise");
      addExercise({
        info: {
          name: exercise.name!,
          id: exercise.id,
          type: exercise.type,
        },
        sets: [
          {
            distance: 0,
            time: 0,
            cooldown: false,
          },
        ],
      });
    }
    // queryClient.invalidateQueries({queryKey: ["muscleGroup"],})
  };

  const isFocused = useIsFocused();
  if (!isFocused) {
    return null;
  }

  return !exercisesLoading ? (
    allExercises && (
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
                <TextInput
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
        <Input size="md">
          <TextInput
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
                    tag.name
                      ?.toLowerCase()
                      .includes(exerciseQuery.toLowerCase())
                  ).length > 0) &&
                !getValues("data").find((other: any) => {
                  return other.info.id == exercise.id;
                })
            )
            .map((exercise) => (
              <Pressable
                key={exercise.id}
                onPress={() => {
                  handleExerciseSubmit(exercise);
                }}
                className="flex flex-1"
              >
                <ExerciseCard exercise={exercise} />
              </Pressable>
            ))
            .slice(0, 15)}
        <VStack space="4xl">
          {exercises.map((exercise, i) => (
            <VStack space="md" key={exercise.info.id}>
              <HStack className="justify-between items-center">
                <Heading className="text-kova-500">
                  {exercise.info.name}
                </Heading>
                <Pressable
                  onPress={() => {
                    removeExercise(i);
                    // queryClient.invalidateQueries({queryKey: ["muscleGroup"],})
                  }}
                >
                  <Icon as={TrashIcon} size="xl" color="red" />
                </Pressable>
              </HStack>
              <ExerciseDataForm
                key={exercise.info.id}
                index={i}
                type={exercise.info.type!}
              />
            </VStack>
          ))}
        </VStack>
        {/* <VStack space="4xl">
          <Heading>Muscle Groups Exercised:</Heading>
          {!loadingMuscleGroups && muscleGroups ? (
            <HStack className="flex items-center justify-between">
              <Body
                colors={getColors()}
                data={muscleGroups}
                side="front"
                scale={0.9}
              ></Body>
              <Body
                colors={getColors()}
                data={muscleGroups}
                side="back"
                scale={0.9}
              ></Body>
            </HStack>
          ) : (
            <Spinner />
          )}
        </VStack> */}
        <Button size="xl" action="kova" onPress={handleSubmit(onSubmit)}>
          <ButtonText>Save Template</ButtonText>
          {isPending && <ButtonSpinner color="#FFF" />}
        </Button>
        <Controller
          control={control}
          name="data"
          rules={{ required: true }}
          render={({ fieldState }) => (
            <FormControl isInvalid={fieldState.invalid} size="md">
              <FormControlError>
                <FormControlErrorText>
                  {fieldState.error?.message ||
                    formState.errors.data?.message ||
                    formState.errors.data?.root?.message ||
                    formState.errors.root?.message ||
                    "Invalid exercises"}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
          )}
        />
      </VStack>
    )
  ) : (
    <Spinner />
  );
}
