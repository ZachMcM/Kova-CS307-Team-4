import { templateFormSchema } from "@/schemas/templateForm";
import { ExtendedTemplateWithCreator } from "@/types/extended-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { createContext, ReactNode, useContext } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import * as z from "zod";

const TemplateFormContext = createContext<TemplateFormProviderValues | null>(
  null
);

type TemplateFormValues = z.infer<typeof templateFormSchema>;
export type TemplateFormProviderValues = UseFormReturn<TemplateFormValues>;

// TODO Configure default values as arg once template object is created
export function TemplateFormProvider({
  children,
  template,
}: {
  children: ReactNode;
  template?: ExtendedTemplateWithCreator;
}) {
  // TODO configure default values

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues:
      template?.data && template.data.length > 0
        ? {
            name: template?.name!,
            data: template?.data.map((exercise) => ({
              info: {
                id: exercise.info.id,
                name: exercise.info.name!,
                created_at: exercise.info.created_at,
                tags: exercise.info.tags.map((tag) => ({
                  id: tag.id,
                  name: tag.name!,
                  created_at: tag.created_at!,
                  color: tag.color!,
                })),
              },
              sets: exercise.sets.map((set) => ({
                reps: parseInt(set.reps!),
                weight: parseFloat(set.weight!),
              })),
            })),
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
