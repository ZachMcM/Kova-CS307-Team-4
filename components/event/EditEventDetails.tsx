import { editEventDetails } from "@/services/groupEventServices";
import { showErrorToast, showSuccessToast } from "@/services/toastServices";
import { Tables } from "@/types/database.types";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, FieldValues, useForm } from "react-hook-form";
import * as z from "zod";
import { Button, ButtonIcon, ButtonSpinner, ButtonText } from "../ui/button";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from "../ui/form-control";
import { Heading } from "../ui/heading";
import { HStack } from "../ui/hstack";
import { CheckIcon, CloseIcon } from "../ui/icon";
import { Input, InputField } from "../ui/input";
import { useToast } from "../ui/toast";
import { VStack } from "../ui/vstack";

const schema = z.object({
  endDate: z.date({ message: "Must be a valid date" }),
  goal: z
    .number({ required_error: "Must be a valid whole number" })
    .int()
    .nonnegative()
    .nullish()
    .transform((x) => (x === null || x === undefined ? undefined : x)),
  weightMultiplier: z
    .number({ required_error: "Must be a valid number" })
    .min(1, { message: "Multiplier cannot be less than 1" })
    .nullish()
    .transform((x) => (x === null || x === undefined ? undefined : x)),
  repMultiplier: z
    .number({ required_error: "Must be a valid number" })
    .min(1, { message: "Multiplier cannot be less than 1" })
    .nullish()
    .transform((x) => (x === null || x === undefined ? undefined : x)),
});

export type EditEventDetailsValues = z.infer<typeof schema>;

export default function EditEventDetails({
  event,
  setEditDetails,
}: {
  event: Tables<"groupEvent">;
  setEditDetails: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const form = useForm<EditEventDetailsValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      endDate: new Date(event.end_date!),
      goal: event.goal!,
      weightMultiplier: event.weight_multiplier!,
      repMultiplier: event.rep_multiplier!,
    },
  });

  async function onSubmit(values: FieldValues) {
    console.log(values);
    mutate(values as EditEventDetailsValues);
  }

  const toast = useToast();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: EditEventDetailsValues) => {
      const data = await editEventDetails(values, event.id);
      return data;
    },
    onError: (err) => {
      console.log(err);
      showErrorToast(toast, err.message);
    },
    onSuccess: (data) => {
      console.log(data);
      showSuccessToast(toast, "Successfully updated details");
      queryClient.invalidateQueries({
        queryKey: ["event", { id: event.id }],
      });
      setEditDetails(false)
    },
  });

  return (
    <VStack space="xl">
      <Controller
        control={form.control}
        name="endDate"
        render={({ field: { onChange, value } }) => (
          <VStack space="sm">
            <Heading size="md">End Date</Heading>
            <DateTimePicker
              design="material"
              style={{
                flex: 1
              }}
              value={value}
              onChange={(_, date) => {
                onChange(date);
              }}
            />
          </VStack>
        )}
      />
      <Controller
        control={form.control}
        name="goal"
        render={({ field: { onChange, value }, fieldState }) => (
          <FormControl isInvalid={fieldState.invalid}>
            <VStack space="sm">
              <Heading size="md">Goal</Heading>
              <Input>
                <InputField
                  onChangeText={(text) => onChange(Number(text) || 0)}
                  value={value?.toString() || "0"}
                  keyboardType="numeric"
                />
              </Input>
            </VStack>
            <FormControlError>
              <FormControlErrorText>
                {fieldState.error?.message || "Invalid goal"}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        )}
      />
      <Controller
        control={form.control}
        name="weightMultiplier"
        render={({ field: { onChange, value }, fieldState }) => (
          <FormControl isInvalid={fieldState.invalid}>
            <VStack space="sm">
              <Heading size="md">Weight Multiplier</Heading>
              <Input>
                <InputField
                  onChangeText={(text) => onChange(Number(text) || 0)}
                  value={value?.toString() || "0"}
                  keyboardType="numeric"
                />
              </Input>
            </VStack>
            <FormControlError>
              <FormControlErrorText>
                {fieldState.error?.message || "Invalid weight multiplier"}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        )}
      />
      <Controller
        control={form.control}
        name="repMultiplier"
        render={({ field: { onChange, value }, fieldState }) => (
          <FormControl isInvalid={fieldState.invalid}>
            <VStack space="sm">
              <Heading size="md">Rep Multiplier</Heading>
              <Input>
                <InputField
                  onChangeText={(text) => onChange(Number(text) || 0)}
                  value={value?.toString() || "0"}
                  keyboardType="numeric"
                />
              </Input>
            </VStack>
            <FormControlError>
              <FormControlErrorText>
                {fieldState.error?.message || "Invalid rep multiplier"}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        )}
      />
      <HStack space="md">
        <Button action="secondary" onPress={() => setEditDetails(false)}>
          <ButtonText>Cancel</ButtonText>
          <ButtonIcon as={CloseIcon} />
        </Button>
        <Button action="kova" onPress={form.handleSubmit(onSubmit)}>
          <ButtonText>Save</ButtonText>
          {isPending ? <ButtonSpinner color="#FFF" size="small" /> : <ButtonIcon as={CheckIcon} />}
        </Button>
      </HStack>
    </VStack>
  );
}
