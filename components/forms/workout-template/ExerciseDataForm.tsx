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
import { Box } from "@/components/ui/box";
import { useEffect, useState } from "react";

// exercise form to be used in live workout and template creation functions to update where data is stored are passed

export default function ExerciseDataForm({ index, type }: { index: number, type: string }) {
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

  const formatTime = (totalSeconds: number) => {
    if (!totalSeconds && totalSeconds !== 0) return '';
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    return `${seconds}`;
  };

  const parseTime = (timeString: string) => {
    if (!timeString) return 0;
    
    let parts;
    
    if (timeString.includes(':')) {
      parts = timeString.split(':');
    } else {
      return parseInt(timeString, 10) || 0;
    }
    
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    
    if (parts.length === 3) {
      hours = parseInt(parts[0], 10) || 0;
      minutes = parseInt(parts[1], 10) || 0;
      seconds = parseInt(parts[2], 10) || 0;
    } else if (parts.length === 2) {
      minutes = parseInt(parts[0], 10) || 0;
      seconds = parseInt(parts[1], 10) || 0;
    } else if (parts.length === 1) {
      seconds = parseInt(parts[0], 10) || 0;
    }
    
    return hours * 3600 + minutes * 60 + seconds;
  };

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
            {type === "WEIGHTS" ? (
              <Heading size="md">lbs</Heading>
            ) : (
              <Heading size="md">Distance</Heading>
            )}
          </GridItem>
          <GridItem
            _extra={{
              className: "col-span-2",
            }}
          >
            {type === "WEIGHTS" ? (
              <Heading size="md">Reps</Heading>
            ) : (
              <Heading size="md">Time</Heading>
            )}
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
              {type === "WEIGHTS" ? (
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
              ) : (
                <Controller
                  control={control}
                  name={`data.${index}.sets.${i}.distance`}
                  render={({ field: { onChange, value } }) => (
                    <Box>
                      <TextInput
                        placeholder="0 mi"
                        id={`distance-${i}`}
                        value={value?.toString() || ""}
                        onChangeText={(text) => onChange(Number(text) || 0)}
                        className="font-bold text-typography-900 w-full h-full text-center"
                        keyboardType="numeric"
                      />
                      <Text className="absolute top-1/2 -translate-y-1/2 left-6">
                        mi
                      </Text>
                    </Box>
                  )}
                />
                )}
            </GridItem>
            <GridItem
              className="rounded-md h-8 flex justify-center items-center bg-secondary-500"
              _extra={{
                className: "col-span-2",
              }}
            >
              {type === "WEIGHTS" ? (
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
              ) : (
                <Controller
                  control={control}
                  name={`data.${index}.sets.${i}.time`}
                  render={({ field: { onChange, value } }) => {
                    // Local state to handle the formatted display
                    const [displayValue, setDisplayValue] = useState(formatTime(value!));
                    
                    // When the form value changes, update the display
                    useEffect(() => {
                      setDisplayValue(formatTime(value!));
                    }, [value]);
                    
                    return (
                      <Box className="relative">
                        <TextInput
                          placeholder="h:mm:ss"
                          id={`time-${i}`}
                          value={displayValue}
                          onChangeText={(text) => {
                            // Update the display value immediately for feedback
                            setDisplayValue(text);
                            
                            // Only clean and convert when we have a proper value
                            if (text) {
                              // Remove any non-numeric or non-colon characters
                              const cleanText = text.replace(/[^0-9:]/g, '');
                              // If the cleaned text is different, update the display
                              if (cleanText !== text) {
                                setDisplayValue(cleanText);
                              }
                              
                              // Convert to seconds and update the form data
                              const seconds = parseTime(cleanText);
                              onChange(seconds);
                            } else {
                              // If the field is cleared, set to 0 or undefined based on your needs
                              onChange(0);
                            }
                          }}
                          onBlur={() => {
                            // When user leaves the field, format properly
                            setDisplayValue(formatTime(value!));
                          }}
                          className="font-bold text-typography-900 w-full h-full text-center"
                          keyboardType="number-pad"
                        />
                      </Box>
                    );
                  }}
                />
              )}
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
