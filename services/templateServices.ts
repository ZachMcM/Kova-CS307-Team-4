import { TemplateFormValues } from "@/components/forms/workout-template/TemplateFormContext";
import { supabase } from "@/lib/supabase";
import { ExtendedTemplateWithCreator } from "@/types/extended-types";

// gets one template based on id
export const getTemplate = async (
  id: string
): Promise<ExtendedTemplateWithCreator> => {
  const { data: template, error } = await supabase
    .from("template")
    .select(
      `
        *,
        creatorProfile:creatorProfileId(*)
      `
    )
    .eq("id", id)
    .limit(1)
    .single();

  if (error) throw new Error(error.message);

  return template as ExtendedTemplateWithCreator;
};

// function to get all the templates
export const getUserTemplates = async (
  profileId: string
): Promise<ExtendedTemplateWithCreator[]> => {
  const { data: templates, error: templateError } = await supabase
    .from("template")
    .select(
      `
      *,
      creatorProfile:creatorProfileId(*)
    `
    )
    .eq("profileId", profileId);

  if (templateError) {
    console.log(templateError);
    throw new Error(`Error fetching templates: ${templateError.message}`);
  }

  if (!templates) {
    return [];
  }

  console.log("Templates", JSON.stringify(templates));

  return templates as ExtendedTemplateWithCreator[];
};

// function to create a new template
export const newTemplate = async (
  { name, data }: Omit<TemplateFormValues, "id">,
  profileId: string
) => {
  const { data: template, error: templateErr } = await supabase
    .from("template")
    .insert({
      name,
      data,
      creatorProfileId: profileId,
      profileId,
    })
    .select();

  if (templateErr) throw new Error(templateErr.message);

  return template;
};

export const updateTemplate = async (
  { name, data, id }: TemplateFormValues,
  profileId: string
) => {
  const { data: updatedTemplate, error } = await supabase
    .from("template")
    .update({
      name,
      data,
    })
    .eq("id", id)
    .eq("profileId", profileId)
    .select();

  if (error) throw new Error(error.message);

  return updatedTemplate;
};

export const copyTemplate = async (templateId: string, profileId: string) => {
  const { name, data, creatorProfileId } = await getTemplate(templateId);

  const { data: newTemplate, error } = await supabase
    .from("template")
    .insert({
      name,
      data,
      profileId,
      creatorProfileId,
    })
    .select();

  if (error) throw new Error(error.message);

  return newTemplate;
};
