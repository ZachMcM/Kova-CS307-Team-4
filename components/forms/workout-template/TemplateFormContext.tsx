import { formatExerciseDataToForm } from "@/lib/formatters";
import { templateFormSchema } from "@/schemas/templateFormSchema";
import { ExtendedTemplateWithCreator } from "@/types/extended-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { createContext, ReactNode, useContext } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import * as z from "zod";

const TemplateFormContext = createContext<TemplateFormProviderValues | null>(
  null
);

export type TemplateFormValues = z.infer<typeof templateFormSchema>;
export type TemplateFormProviderValues = UseFormReturn<TemplateFormValues>;

export function TemplateFormProvider({
  children,
  template,
}: {
  children: ReactNode;
  template?: ExtendedTemplateWithCreator;
}) {
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues:
      template?.data && template.data.length > 0
        ? {
            name: template?.name!,
            data: formatExerciseDataToForm(template.data),
          }
        : {
            name: "",
            data: [],
          },
  });

  return (
    <TemplateFormContext.Provider value={form}>
      {children}
    </TemplateFormContext.Provider>
  );
}

export function useTemplateForm() {
  return useContext(TemplateFormContext) as TemplateFormProviderValues;
}
