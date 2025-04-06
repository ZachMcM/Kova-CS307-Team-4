import { templateFormSchema } from "@/schemas/templateFormSchema";
import { ExtendedTemplateWithCreator } from "@/types/extended-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname } from "expo-router";
import { createContext, ReactNode, useContext, useEffect } from "react";
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
            id: template.id,
            data: template.data,
          }
        : {
            name: "",
            id: null,
            data: [],
          },
  });

  const pathname = usePathname();

  // Reset form when template changes
  useEffect(() => {
    if (template?.data && template.data.length > 0) {
      form.reset({
        name: template.name!,
        id: template.id,
        data: template.data,
      });
    } else {
      form.reset(
        {
          name: "",
          id: null,
          data: [],
        }
      )
    }
  }, [template, pathname]);

  return (
    <TemplateFormContext.Provider value={form}>
      {children}
    </TemplateFormContext.Provider>
  );
}

export function useTemplateForm() {
  return useContext(TemplateFormContext) as TemplateFormProviderValues;
}
