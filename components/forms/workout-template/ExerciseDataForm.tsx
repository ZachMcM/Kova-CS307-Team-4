import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Grid, GridItem } from "@/components/ui/grid";
import { Heading } from "@/components/ui/heading";
import { AddIcon, Icon, TrashIcon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { showErrorToast } from "@/services/toastServices";
import { Controller, Control, useFieldArray } from "react-hook-form";
import { TextInput } from "react-native";
import { useTemplateForm } from "./TemplateFormContext";
import { Box } from "@/components/ui/box";
import { useEffect, useState } from "react";
import { HStack } from "@/components/ui/hstack";


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
            {/* First column - Set number or Cooldown */}
            <GridItem
              className="rounded-md h-8 flex justify-center items-center bg-secondary-500"
              _extra={{
                className: "col-span-2",
              }}
            >
              {set.cooldown ? (
                <Text size="md" className="font-bold text-typography-900">
                  Cooldown
                </Text>
              ) : (
                <Text size="md" className="font-bold text-typography-900">
                  {i + 1}
                </Text>
              )}
            </GridItem>
            
            {/* Second column - Weight/Distance or empty for cooldown */}
            <GridItem
              className="rounded-md h-8 flex justify-center items-center bg-secondary-500"
              _extra={{
                className: "col-span-2",
              }}
            >
              {!set.cooldown ? (
                <>
                  {!type || type === "WEIGHTS" ? (
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
                            placeholder="0"
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
                </>
              ) : (
                <Text>-</Text>
              )}
            </GridItem>
            
            {/* Third column - Reps/Time */}
            <GridItem
              className="rounded-md h-8 flex justify-center items-center bg-secondary-500"
              _extra={{
                className: "col-span-2",
              }}
            >
              {!set.cooldown ? (
                <>
                  {!type || type === "WEIGHTS" ? (
                    <Controller
                      control={control}
                      name={`data.${index}.sets.${i}.reps`}
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          placeholder="0"
                          id={`reps-${i}`}
                          value={value?.toString() || ""}
                          onChangeText={(text) => onChange(Number(text) || 0)}
                          className="font-bold text-typography-900 w-full h-full text-center"
                          keyboardType="numeric"
                        />
                      )}
                    />
                  ) : (
                    <TimeInput control={control} name={`data.${index}.sets.${i}.time`} />
                  )}
                </>
              ) : (
                <TimeInput control={control} name={`data.${index}.sets.${i}.time`} />
              )}
            </GridItem>
            
            {/* Fifth column - Delete button */}
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
        {/*{sets.map((set, i) => (
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
                        placeholder="0"
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
                <TimeInput control={control} name={`data.${index}.sets.${i}.time`} />
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
        ))}*/}
      </VStack>
      {type && type !== "WEIGHTS" && (
        <Button
          variant="solid"
          action="primary"
          size="sm"
          onPress={() => {
            addSet({
              time: 0,
              cooldown: true,
            })
          }}
        >
          <ButtonText>Add Cooldown</ButtonText>
          <ButtonIcon as={AddIcon} />
        </Button>
      )}
      <Button
        variant="solid"
        action="secondary"
        size="sm"
        onPress={() => {
          if (!type || type === "WEIGHTS") {
            addSet({
              reps: 0,
              weight: 0,
              cooldown: false,
            })
          }
          else {
            addSet({
              distance: 0,
              time: 0,
              cooldown: false,
            })
          }
        }}
      >
        <ButtonText>Add Set</ButtonText>
        <ButtonIcon as={AddIcon} />
      </Button>
    </VStack>
  );
}

export const TimeInput = ({ control, name }: { control: Control<any>, name: string }) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value, onBlur } }) => {
        const [displayValue, setDisplayValue] = useState('');
        
        // Format seconds to time string (hh:mm:ss or mm:ss or ss)
        const formatSecondsToDisplay = (totalSeconds: number | null | undefined) => {
          if (totalSeconds === undefined || totalSeconds === null) return '';
          
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;
          
          if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          } else if (minutes > 0) {
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
          } else {
            return `${seconds}`;
          }
        };
        
        // Parse display value to seconds
        const parseDisplayToSeconds = (display: string) => {
          // Remove all non-digits and colons
          const cleanValue = display.replace(/[^\d:]/g, '');
          const parts = cleanValue.split(':');
          
          let hours = 0;
          let minutes = 0;
          let seconds = 0;
          
          if (parts.length === 1) {
            // Just seconds
            seconds = Math.min(parseInt(parts[0], 10) || 0, 59);
          } else if (parts.length === 2) {
            // Minutes:seconds
            minutes = Math.min(parseInt(parts[0], 10) || 0, 59);
            seconds = Math.min(parseInt(parts[1], 10) || 0, 59);
          } else if (parts.length >= 3) {
            // Hours:minutes:seconds
            hours = Math.min(parseInt(parts[0], 10) || 0, 99);
            minutes = Math.min(parseInt(parts[1], 10) || 0, 59);
            seconds = Math.min(parseInt(parts[2], 10) || 0, 59);
          }
          
          return (hours * 3600) + (minutes * 60) + seconds;
        };
        
        // When value changes, update display
        useEffect(() => {
          setDisplayValue(formatSecondsToDisplay(value));
        }, [value]);
        
        // Handle input change
        const handleInputChange = (input: string) => {
          // Remove any non-digits
          const digitsOnly = input.replace(/[^\d]/g, '');
          
          // Format with colons based on length
          let formattedValue = digitsOnly;
          if (digitsOnly.length > 0) {
            if (digitsOnly.length <= 2) {
              // Just seconds
              formattedValue = digitsOnly;
            } else if (digitsOnly.length <= 4) {
              // MM:SS format
              const minutes = digitsOnly.slice(0, digitsOnly.length - 2);
              const seconds = digitsOnly.slice(digitsOnly.length - 2);
              formattedValue = `${minutes}:${seconds}`;
            } else {
              // HH:MM:SS format
              const hours = digitsOnly.slice(0, digitsOnly.length - 4);
              const minutes = digitsOnly.slice(digitsOnly.length - 4, digitsOnly.length - 2);
              const seconds = digitsOnly.slice(digitsOnly.length - 2);
              formattedValue = `${hours}:${minutes}:${seconds}`;
            }
          }
          
          // Limit the total length (accounting for added colons)
          if (digitsOnly.length <= 6) {
            setDisplayValue(formattedValue);
          }
        };
        
        // Handle blur event
        const handleBlur = (e: any) => {
          // Validate and correct the input
          const totalSeconds = parseDisplayToSeconds(displayValue);
          
          // Update with corrected and formatted value
          const formattedValue = formatSecondsToDisplay(totalSeconds);
          setDisplayValue(formattedValue);
          
          // Update form value
          onChange(totalSeconds);
          
          if (onBlur) onBlur();
        };
        
        return (
          <Box className="relative">
            <TextInput
              placeholder="00:00:00"
              value={displayValue}
              onChangeText={(text) => {handleInputChange(text)}}
              onBlur={handleBlur}
              className="font-bold text-center"
              maxLength={8}
              keyboardType="numeric"
            />
          </Box>
        );
      }}
    />
  );
};