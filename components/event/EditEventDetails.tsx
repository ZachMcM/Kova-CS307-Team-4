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

export default function EditEventDetails({
  event,
  setEditDetails,
}: {
  event: Tables<"groupEvent">;
  setEditDetails: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const schema = z
    .object({
      end_date: z.date({
        message: "Must be a valid date later than the current end date.",
      }),
      goal: z.coerce
        .number({ invalid_type_error: "Must be a valid number" })
        .min(1, { message: "Goal cannot be less than 1" })
        .nonnegative()
        .nullish()
        .optional(),
      weightMultiplier: z.coerce
        .number({ invalid_type_error: "Must be a valid number" })
        .nullish(),
      repMultiplier: z.coerce
        .number({ invalid_type_error: "Must be a valid number" })
        .nullish(),
    })
    .superRefine((data, ctx) => {
      // Validate that end_date is after start_date
      if (new Date(event.start_date) > data.end_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End date must be after start date",
          path: ["end_date"],
        });
      }

      // Only validate multipliers if type is not "total-time"
      if (event.type !== "total-time") {
        if (
          data.weightMultiplier !== null &&
          data.weightMultiplier !== undefined
        ) {
          if (data.weightMultiplier < 1) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Weight Multiplier cannot be less than 1",
              path: ["weightMultiplier"],
            });
          }
        }

        if (data.repMultiplier !== null && data.repMultiplier !== undefined) {
          if (data.repMultiplier < 1) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Rep Multiplier cannot be less than 1",
              path: ["repMultiplier"],
            });
          }
        }

        if (event.goal && !data.goal) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Goal is required",
            path: ["goal"],
          });
        }
      }
    });

  type EditEventDetailsValues = z.infer<typeof schema>;

  const form = useForm<EditEventDetailsValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      end_date: new Date(event.end_date!),
      goal: event.goal!,
      weightMultiplier: event.weight_multiplier!,
      repMultiplier: event.rep_multiplier!,
    },
  });

  async function onSubmit(values: FieldValues) {
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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["event", { id: event.id }],
      });
      queryClient.invalidateQueries({
        queryKey: ["group", { id: event.groupId }],
      });
      queryClient.invalidateQueries({
        queryKey: ["event-leaderboard", { id: event.id }],
      });
      queryClient.invalidateQueries({
        queryKey: ["my-event-workouts", { id: event.id }],
      });
      queryClient.invalidateQueries({
        queryKey: ["collaboration-progress", { id: event.id }],
      });
      showSuccessToast(toast, "Successfully updated details");
      setEditDetails(false);
    },
  });

  return (
    <VStack space="xl">
      <Controller
        control={form.control}
        name="end_date"
        render={({ field: { onChange, value } }) => (
          <FormControl isInvalid={form.formState.errors.end_date != undefined}>
            <HStack className="items-center">
              <Heading size="md">End Date:</Heading>
              <DateTimePicker
                design="material"
                style={{
                  flex: 1,
                }}
                value={value}
                onChange={(_, date) => {
                  onChange(date);
                }}
                minimumDate={
                  new Date(event.end_date!) > new Date()
                    ? new Date(event.end_date!)
                    : new Date()
                }
              />
            </HStack>
            <FormControlError>
              <FormControlErrorText>
                {form.formState.errors.end_date?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        )}
      />
      {event.goal && (
        <Controller
          control={form.control}
          name="goal"
          render={({ field: { onChange, value }, fieldState }) => (
            <FormControl isInvalid={fieldState.invalid}>
              <VStack space="sm">
                <Heading size="md">Goal</Heading>
                <Input>
                  <InputField
                    onChangeText={onChange}
                    value={value?.toString()}
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
      )}
      {event.type != "total-time" && (
        <>
          <Controller
            control={form.control}
            name="weightMultiplier"
            render={({ field: { onChange, value }, fieldState }) => (
              <FormControl isInvalid={fieldState.invalid}>
                <VStack space="sm">
                  <Heading size="md">Weight Multiplier</Heading>
                  <Input>
                    <InputField
                      onChangeText={onChange}
                      value={value?.toString()}
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
                      onChangeText={onChange}
                      value={value?.toString()}
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
        </>
      )}
      <HStack space="md">
        <Button action="secondary" onPress={() => setEditDetails(false)}>
          <ButtonText>Cancel</ButtonText>
          <ButtonIcon as={CloseIcon} />
        </Button>
        <Button action="kova" onPress={form.handleSubmit(onSubmit)}>
          <ButtonText>Save</ButtonText>
          {isPending ? (
            <ButtonSpinner color="#FFF" size="small" />
          ) : (
            <ButtonIcon as={CheckIcon} />
          )}
        </Button>
      </HStack>
    </VStack>
  );
}
