import { TemplateFormValues } from "@/components/forms/workout-template/TemplateFormContext";
import { supabase } from "@/lib/supabase";
import { sampleProfileId } from "@/sample-data/sampleProfile";
import { Tables } from "@/types/database.types";
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
    .limit(1).single();

  if (error) throw new Error(error.message);

  return template as ExtendedTemplateWithCreator
};

// function to get all the templates
export const getUserTemplates = async (): Promise<
  ExtendedTemplateWithCreator[]
> => {
  // TODO need to replace with actaul session.user.profile.id
  const { data: templates, error: templateError } = await supabase
    .from("template")
    .select(
      `
        *,
        creatorProfile:creatorProfileId(*)
      `
    )
    .eq("profileId", sampleProfileId)

  if (templateError) {
    throw new Error(`Error fetching templates: ${templateError.message}`);
  }

  if (!templates) {
    return [];
  }

  return templates as ExtendedTemplateWithCreator[]
};

// function to create a new template
export const newTemplate = async ({
  name,
  data,
}: Omit<TemplateFormValues, "id">) => {
  // TODO need to replace with actaul session.user.profile.id
  const { data: template, error: templateErr } = await supabase
    .from("template")
    .insert({
      name,
      data,
      creatorProfileId: sampleProfileId,
      profileId: sampleProfileId,
    })
    .select()
    .returns<Tables<"template">>();

  if (templateErr) throw new Error(templateErr.message);

  return template;
};

export const updateTemplate = async ({ name, data, id }: TemplateFormValues) => {
  // TODO need to replace with actaul session.user.profile.id
  const { data: updatedTemplate, error } = await supabase
    .from("template")
    .update({
      name,
      data,
    })
    .eq("id", id)
    .eq("profileId", sampleProfileId)
    .select()
    .returns<Tables<"template">>();

  if (error) throw new Error(error.message);

  return updatedTemplate;
};

export const copyTemplate = async (templateId: string) => {
  // TODO need to replace with actaul session.user.profile.id
  const { name, data, creatorProfileId } = await getTemplate(templateId);

  const { data: newTemplate, error } = await supabase
    .from("template")
    .insert({
      name,
      data,
      profileId: sampleProfileId,
      creatorProfileId
    })
    .select()
    .returns<Tables<"template">>();

  if (error) throw new Error(error.message);

  return newTemplate;
};
