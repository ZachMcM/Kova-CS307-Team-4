import { TemplateFormValues } from "@/components/forms/workout-template/TemplateFormContext";
import { supabase } from "@/lib/supabase";
import { Tables } from "@/types/database.types";
import { ExtendedTemplateWithCreator } from "@/types/extended-types";

// Transform templates and parse data
const parseTemplate = (template: any): ExtendedTemplateWithCreator => {
  return {
    ...template,
    data: template.data ? JSON.parse(template.data) : [],
    creator: {
      profile: template.creator,
    },
  };
};

// gets one template based on id
export const getTemplate = async (
  id: string
): Promise<ExtendedTemplateWithCreator> => {
  const { data: template, error } = await supabase
    .from("Template")
    .select(
      `
        *,
        user:userId(id, email),
        creator:creatorUserId(
          id, 
          username,
          age,
          gender,
          avatar,
          goal,
          bio,
          private
        )
      `
    )
    .eq("id", id)
    .limit(1);

  if (error) throw new Error(error.message);

  const parsedTemplate = parseTemplate(template);
  return parsedTemplate;
};

// function to get all the templates
export const getUserTemplates = async (): Promise<
  ExtendedTemplateWithCreator[]
> => {
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr) throw new Error(authErr.message);

  const { data: templates, error: templateError } = await supabase
    .from("Template")
    .select(
      `
        *,
        user:userId(id, email),
        creator:creatorUserId(
          id, 
          username,
          age,
          gender,
          avatar,
          goal,
          bio,
          private
        )
      `
    )
    .eq("userId", user?.id);

  if (templateError) {
    throw new Error(`Error fetching templates: ${templateError.message}`);
  }

  if (!templates?.length) {
    return [];
  }

  const parsedTemplates = templates.map((template) => parseTemplate(template));
  return parsedTemplates;
};

// function to create a new template
export const newTemplate = async ({
  name,
  data,
}: Omit<TemplateFormValues, "id">) => {
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr) throw new Error(authErr.message);

  const { data: template, error: templateErr } = await supabase
    .from("Template")
    .insert({
      name,
      data,
      creatorUserId: user?.id,
      userId: user?.id,
    })
    .select()
    .returns<Tables<"Template">>();

  console.log(template);

  if (templateErr) throw new Error(templateErr.message);

  return template;
};

// TODO determine how we want to handle editing templates when the user is not the creator
export const updateTemplate = async ({ name, data, id }: TemplateFormValues) => {
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr) throw new Error(authErr.message);

  const { data: updatedTemplate, error } = await supabase
    .from("Template")
    .update({
      name,
      data,
    })
    .eq("id", id)
    .eq("userId", user?.id)
    .select()
    .returns<Tables<"Template">>();

  if (error) throw new Error(error.message);

  return updatedTemplate;
};

export const copyTemplate = async (templateId: string) => {
  const { name, creatorUserId, data } = await getTemplate(templateId);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw new Error(authError.message);

  const { data: newTemplate, error } = await supabase
    .from("Template")
    .insert({
      name,
      data,
      creatorUserId,
      userId: user?.id,
    })
    .select()
    .returns<Tables<"Template">>();

  if (error) throw new Error(error.message);

  return newTemplate;
};
