import { templateFormSchema } from "@/schemas/templateForm";
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
export function TemplateFormProvider({ children }: { children: ReactNode }) {
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: "",
      data: []
    }
  });

  return (
    <TemplateFormContext.Provider value={form}>
      {children}
    </TemplateFormContext.Provider>
  );
}

export function useTemplateForm() {
  return useContext(TemplateFormContext) as TemplateFormProviderValues
}
