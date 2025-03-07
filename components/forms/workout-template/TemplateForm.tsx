import { useSession } from "@/components/SessionContext";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { getExercises } from "@/services/exerciseServices";
import { newTemplate, updateTemplate } from "@/services/templateServices";
import { showErrorToast } from "@/services/toastServices";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
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
import { Icon, SearchIcon, TrashIcon } from "../../ui/icon";
import { Input, InputField, InputIcon, InputSlot } from "../../ui/input";
import { VStack } from "../../ui/vstack";
import ExerciseCard from "./ExerciseCard";
import ExerciseDataForm from "./ExerciseDataForm";
import { TemplateFormValues, useTemplateForm } from "./TemplateFormContext";
import ExerciseSearchView from "@/components/search-views/ExerciseSearchView";
import { ExtendedExercise } from "@/types/extended-types";
import { compareToTaggedQuery, createTagCounter, createWordCounter, exercisesToSearch } from "@/types/searcher-types";

export default function TemplateForm() {
  // TODO remove and replace with actual searching and exercise search component
  const [exerciseQuery, setExerciseQuery] = useState<string>("");

  const { control, handleSubmit, watch, formState, reset } = useTemplateForm();

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

  function isExerciseAdded(id: string) {
    for (const exercise of exercises) {
      if (exercise.info.id == id) {
        return true;
      }
    }
    return false;
  }

  async function onSubmit(values: FieldValues) {
    reset({
      name: "",
      id: "",
      data: undefined
    });
    saveTemplate(values as TemplateFormValues);
  }

  let searchItems = undefined;
  let wordCounter = undefined;
  let tagCounter = undefined;
  let searchIdToIndex = undefined;

  if (!exercisesLoading) {
    searchItems = exercisesToSearch(allExercises!);
    wordCounter = createWordCounter(searchItems);
    tagCounter = createTagCounter(searchItems);
    searchIdToIndex = new Map<string, number>();
    for (let i = 0; i < searchItems.length; i++) {
      searchIdToIndex.set(searchItems[i].id, i);
    }
  }
  
  return !exercisesLoading ? (
    allExercises && (
      <VStack space="4xl">
        <VStack space="xl">
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
            allExercises
              .sort((a: ExtendedExercise, b: ExtendedExercise) => {
                let aSearch = searchItems![searchIdToIndex!.get(a.id)!];
                let bSearch = searchItems![searchIdToIndex!.get(b.id)!];
                let diff = compareToTaggedQuery(exerciseQuery, bSearch,
                  wordCounter!, tagCounter!, []) 
                    - compareToTaggedQuery(exerciseQuery, aSearch,
                      wordCounter!, tagCounter!, []);
                return diff;
              })
              .map((exercise) => (
                <Pressable
                  key={exercise.id}
                  onPress={() => {
                    setExerciseQuery("");
                    addExercise({
                      info: {
                        name: exercise.name!,
                        id: exercise.id,
                      },
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
                  <ExerciseCard exercise={exercise} />
                </Pressable>
              ))}
        </VStack>
        <VStack space="4xl">
          {exercises.map((exercise, i) => (
            <VStack space="md" key={exercise.info.id}>
              <HStack className="justify-between items-center">
                <Heading className="text-kova-500">
                  {exercise.info.name}
                </Heading>
                <Pressable onPress={() => removeExercise(i)}>
                  <Icon as={TrashIcon} size="xl" color="red" />
                </Pressable>
              </HStack>
              <ExerciseDataForm key={exercise.info.id} index={i} />
            </VStack>
          ))}
        </VStack>
        <Button size="xl" action="kova" onPress={handleSubmit(onSubmit)}>
          <ButtonText>Save Template</ButtonText>
          {isPending && <ButtonSpinner color={"FFF"} />}
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
