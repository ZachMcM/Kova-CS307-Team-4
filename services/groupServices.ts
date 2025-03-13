import { supabase } from "@/lib/supabase";
import { Tables } from "@/types/database.types";
import { ExtendedGroupWithCompetitions } from "@/types/extended-types";

export const getUserGroups = async (
  profileId: string
): Promise<Tables<"group">[]> => {
  const { data, error: groupErr } = await supabase
    .from("groupRel")
    .select(`group:groupId(*)`)
    .eq("profileId", profileId);

  if (groupErr) {
    throw new Error(groupErr.message);
  }

  const groups = data.map((item) => item.group);

  return groups as any;
};

export const getGroup = async (
  id: string
): Promise<ExtendedGroupWithCompetitions> => {
  const { data: group, error } = await supabase
    .from("group")
    .select(
      `
      *,
      competitions:competition(*)
      `
    )
    .eq("id", id)
    .single();

  console.log(group);

  if (error) {
    console.log(error);
    throw new Error(error.message);
  }

  return group;
};

export const getGroupProfiles = async (
  id: string
): Promise<Tables<"profile">[]> => {
  const { data: profileData, error: profileErr } = await supabase
    .from("groupRel")
    .select(
      `
    profile:profileId(*)`
    )
    .eq("groupId", id);

  if (profileErr) {
    console.log("Profile Error", profileErr);
    throw new Error(profileErr.message);
  }

  const profiles = profileData.map((item) => item.profile as any as Tables<'profile'>);

  return profiles;
};
