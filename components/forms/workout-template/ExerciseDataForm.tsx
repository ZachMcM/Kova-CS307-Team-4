import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Grid, GridItem } from "@/components/ui/grid";
import { Heading } from "@/components/ui/heading";
import { AddIcon, Icon, TrashIcon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { showErrorToast } from "@/services/toastServices";
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

  const toast = useToast();

  return (
    <VStack space="lg">
      <VStack space="sm">
        <Grid
          className="gap-2"
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
                name={`data.${index}.sets.${i}.weight`}
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
                name={`data.${index}.sets.${i}.reps`}
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
                className: "col-span-2",
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
          })
        }
      >
        <ButtonText>Add Set</ButtonText>
        <ButtonIcon as={AddIcon} />
      </Button>
    </VStack>
  );
}
