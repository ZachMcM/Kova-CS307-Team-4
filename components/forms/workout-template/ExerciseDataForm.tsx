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
                <TimeInput control={control} index={index} i={i} />
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

export const TimeInput = ({ control, index, i }: { control: any; index: number; i: number }) => {
  const MAX_TIME_SECONDS = 359999;

  const formatTime = (totalSeconds: number) => {
    if (!totalSeconds && totalSeconds !== 0) return '';
    
    const limitedSeconds = Math.min(totalSeconds, MAX_TIME_SECONDS);
    
    const hours = Math.floor(limitedSeconds / 3600);
    const minutes = Math.floor((limitedSeconds % 3600) / 60);
    const seconds = limitedSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    return `${seconds}`;
  };
  
  return (
    <Controller
      control={control}
      name={`data.${index}.sets.${i}.time`}
      render={({ field: { onChange, value } }) => {
        const [rawDigits, setRawDigits] = useState('');
        
        useEffect(() => {
          if (value !== undefined && value !== null) {
            setRawDigits(formatTime(value).replace(/:/g, ''));
          }
        }, [value]);
        
        const formatRawDigits = (digits: string) => {
          if (!digits) return '';
          
          const limitedDigits = digits.slice(0, 6);
          
          if (limitedDigits.length <= 2) {
            return limitedDigits;
          } else if (limitedDigits.length <= 4) {
            const mins = limitedDigits.slice(0, limitedDigits.length - 2);
            const secs = limitedDigits.slice(limitedDigits.length - 2);
            return `${mins}:${secs}`;
          } else {
            const hours = limitedDigits.slice(0, limitedDigits.length - 4);
            const mins = limitedDigits.slice(limitedDigits.length - 4, limitedDigits.length - 2);
            const secs = limitedDigits.slice(limitedDigits.length - 2);
            return `${hours}:${mins}:${secs}`;
          }
        };
        
        const digitsToSeconds = (digits: string) => {
          if (!digits) return 0;
          
          const limitedDigits = digits.slice(0, 6);
          
          if (limitedDigits.length <= 2) {
            return parseInt(limitedDigits, 10) || 0;
          } else if (limitedDigits.length <= 4) {
            const mins = limitedDigits.slice(0, limitedDigits.length - 2);
            const secs = limitedDigits.slice(limitedDigits.length - 2);
            return (parseInt(mins, 10) * 60 + parseInt(secs, 10)) || 0;
          } else {
            const hours = limitedDigits.slice(0, limitedDigits.length - 4);
            const mins = limitedDigits.slice(limitedDigits.length - 4, limitedDigits.length - 2);
            const secs = limitedDigits.slice(limitedDigits.length - 2);
            return (parseInt(hours, 10) * 3600 + parseInt(mins, 10) * 60 + parseInt(secs, 10)) || 0;
          }
        };
        
        return (
          <Box className="relative">
            <TextInput
              placeholder="h:mm:ss"
              id={`time-${i}`}
              value={formatRawDigits(rawDigits)}
              onChangeText={(text) => {
                const cleanText = text.replace(/[^0-9]/g, '');
                
                if (cleanText.length > 6) return;
                
                setRawDigits(cleanText);
                
                const seconds = digitsToSeconds(cleanText);
                
                const limitedSeconds = Math.min(seconds, MAX_TIME_SECONDS);
                onChange(limitedSeconds);
              }}
              onBlur={() => {
                if (value !== undefined && value !== null) {
                  setRawDigits(formatTime(value).replace(/:/g, ''));
                }
              }}
              selection={{ start: formatRawDigits(rawDigits).length, end: formatRawDigits(rawDigits).length }}
              className="font-bold text-typography-900 w-full h-full text-center"
              keyboardType="number-pad"
            />
          </Box>
        );
      }}
    />
  );
};