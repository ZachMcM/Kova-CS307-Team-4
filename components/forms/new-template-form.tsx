import { VStack } from "../ui/vstack";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, InputField } from "../ui/input";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "../ui/form-control";

// creating the schema for the form using zod

const schema = z.object({
  name: z
    .string()
    .min(1, { message: "Name can't be empty" })
    .max(100, { message: "Title is too long" }),
  exercises: z
    .object({
      name: z.string().nonempty(),
      id: z.string().nonempty(),
      sets: z
        .object({
          reps: z.coerce
            .number()
            .nonnegative()
            .transform((x) => (x ? x : undefined)),
          weight: z.coerce
            .number()
            .nonnegative()
            .transform((x) => (x ? x : undefined)),
        })
        .array(),
    })
    .array()
    .min(1, { message: "You must have at least 1 exercise" }),
});

type TemplateForm = z.infer<typeof schema>;

// TODO need to remove and replace with exercise search component
const testExercieses = [
  {
    name: "Chest Flies",
    tags: ["chest"],
  },
  {
    name: "Dumbell Pullovers",
    tags: ["chest"],
  },
  {
    name: "Incline Chest Press",
    tags: ["chest"],
  },
  {
    name: "Tricep Pulldowns",
    tags: ["triceps"],
  },
  {
    name: "Skull Crushers",
    tags: ["triceps"],
  },
];

export default function NewTemplateForm() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TemplateForm>({
    resolver: zodResolver(schema),
  });

  return (
    <VStack space="md">
      {/* TODO replace with actual search bar @AreebE */}
      <Controller
        control={control}
        name="name"
        rules={{ required: true }}
        render={({ field, fieldState}) => (
          <FormControl isInvalid={fieldState.invalid} size="md">
            <FormControlLabel>
              <FormControlLabelText>Name</FormControlLabelText>
            </FormControlLabel>
            <Input>
              <InputField 
                placeholder="Enter a template name" 
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            </Input>
          </FormControl>
        )}
      />
    </VStack>
  );
}
