import { TemplateFormValues } from "@/components/forms/workout-template/TemplateFormContext";
import { supabase } from "@/lib/supabase";
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
export const getUserTemplates = async (userId: string): Promise<
  ExtendedTemplateWithCreator[]
> => {
  const { data: profile, error: profileErr } = await supabase.from("profile").select().eq("userId", userId).single()

  if (profileErr) {
    throw new Error(profileErr.message)
  }

  const { data: templates, error: templateError } = await supabase
    .from("template")
    .select(`
      *,
      creatorProfile:creatorProfileId(*)
    `)
    .eq("profileId", profile.id);

  if (templateError) {
    console.log(templateError)
    throw new Error(`Error fetching templates: ${templateError.message}`);
  }

  if (!templates) {
    return [];
  }

  console.log("Templates", JSON.stringify(templates))

  return templates as ExtendedTemplateWithCreator[]
};

// function to create a new template
export const newTemplate = async ({ name, data }: Omit<TemplateFormValues, "id">, userId: string) => {
  const { data: profile, error: profileErr } = await supabase.from("profile").select().eq("userId", userId).single()

  if (profileErr) {
    throw new Error(profileErr.message)
  }

  const { data: template, error: templateErr } = await supabase
    .from("template")
    .insert({
      name,
      data,
      creatorProfileId: profile.id,
      profileId: profile.id,
    })
    .select()

  if (templateErr) throw new Error(templateErr.message);

  return template;
};

export const updateTemplate = async ({ name, data, id }: TemplateFormValues, userId: string) => {
  const { data: profile, error: profileErr } = await supabase.from("profile").select().eq("userId", userId).single()

  if (profileErr) {
    throw new Error(profileErr.message)
  }  
  
  const { data: updatedTemplate, error } = await supabase
    .from("template")
    .update({
      name,
      data,
    })
    .eq("id", id)
    .eq("profileId", profile.id)
    .select()

  if (error) throw new Error(error.message);

  return updatedTemplate;
};

export const copyTemplate = async (templateId: string, userId: string) => {
  const { data: profile, error: profileErr } = await supabase.from("profile").select().eq("userId", userId).single()

  if (profileErr) {
    throw new Error(profileErr.message)
  }

  const { name, data, creatorProfileId } = await getTemplate(templateId);

  const { data: newTemplate, error } = await supabase
    .from("template")
    .insert({
      name,
      data,
      profileId: profile.id,
      creatorProfileId
    })
    .select()

  if (error) throw new Error(error.message);

  return newTemplate;
};
