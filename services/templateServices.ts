import { TemplateFormValues } from "@/components/forms/workout-template/TemplateFormContext";
import { supabase } from "@/lib/supabase";
import { Tables } from "@/types/database.types";
import { ExtendedTemplateWithCreator } from "@/types/extended-types";

// function to get all the templates
export const getUserTemplates = async (
  userId: string
): Promise<ExtendedTemplateWithCreator[]> => {
  const { data: templates, error: templateError } = await supabase
    .from("TemplateUser")
    .select(
      `
        template:Template (
          *,
          creator:profiles!Template_creatorUserId_fkey (
            *
          )
        )
      `
    )
    .eq("user_id", userId);

  if (templateError) {
    throw new Error(`Error fetching templates: ${templateError.message}`);
  }

  if (!templates?.length) {
    return [];
  }

  // Transform templates and parse data
  const parsedTemplates: ExtendedTemplateWithCreator[] = templates.map((tu) => {
    const template = tu.template as any; // temporary any for raw template

    return {
      ...template,
      data: template.data ? JSON.parse(template.data) : [],
      creator: {
        profile: template.creator,
      },
    };
  });

  return parsedTemplates;
};

// function to create a new template
export const newTemplate = async ({
  name,
  data,
}: Omit<TemplateFormValues, "id">) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: template, error: templateErr } = await supabase
    .from("Template")
    .insert({
      name,
      data,
      creatorUserId: user?.id,
    })
    .select()
    .returns<Tables<"Template">>();

  console.log(template);

  if (templateErr) throw new Error(templateErr.message);

  const { data: templateUser, error: templateUserErr } = await supabase
    .from("TemplateUser")
    .insert({
      user_id: user?.id,
      template_id: template.id,
    })
    .select()
    .returns<Tables<"TemplateUser">>();

  if (templateUserErr) throw new Error(templateUserErr.message);

  return templateUser;
};

// TODO determine how we want to handle editing templates when the user is not the creator
export const saveTemplate = async ({ name, data, id }: TemplateFormValues) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: updatedTemplate, error } = await supabase
    .from("Template")
    .update({
      name,
      data,
    })
    .eq("id", id)
    .select()
    .returns<Tables<"Template">>();

  if (error) throw new Error(error.message);

  return updatedTemplate;
};

export const deleteTemplate = async ({ id }: TemplateFormValues) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: deletedTemplate, error } = await supabase
    .from("TemplateUser")
    .delete()
    .eq("user_id", user?.id)
    .eq("template_id", id)
    .select()
    .returns<Tables<"TemplateUser">>();

  if (error) throw new Error(error.message);

  return deletedTemplate;
};
