import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { AddIcon, RemoveIcon, TrashIcon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Controller, useFieldArray } from "react-hook-form";
import { TextInput } from "react-native";
import { useTemplateForm } from "./TemplateFormContext";

// exercise form to be used in live workout and template creation functions to update where data is stored are passed

export default function ExerciseDataForm({ index }: { index: number }) {
  const { control } = useTemplateForm();

  const {
    fields: sets,
    append: addSet,
    remove: removeSet,
  } = useFieldArray({
    control,
    name: `data.${index}.sets`,
  });

  return (
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
                name={`data.${index}.sets.${i}.weight`}
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
                name={`data.${index}.sets.${i}.reps`}
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
                <ButtonIcon as={TrashIcon} size="lg" color="red" />
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
  );
}
