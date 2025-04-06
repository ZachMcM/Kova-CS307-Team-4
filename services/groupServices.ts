import { supabase } from "@/lib/supabase";
import { Tables } from "@/types/database.types";
import { ExtendedGroupRel, ExtendedGroupWithEvents, GroupOverview, GroupPage, GroupRelWithProfile, MemberRelationship } from "@/types/extended-types";
import { getProfile, getProfiles } from "./profileServices";

/*
import { Tables } from "@/types/database.types";
*/

/*
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
*/

export const getProfileGroupRel = async (
  profileId: string,
  groupId: string
): Promise<ExtendedGroupRel> => {
  const { data, error } = await supabase
    .from("groupRel")
    .select(
      `*,
      group:groupId(id, title)`
    )
    .eq("profileId", profileId)
    .eq("groupId", groupId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getGroup = async (
  id: string
): Promise<ExtendedGroupWithEvents> => {
  const { data: group, error } = await supabase
    .from("group")
    .select(
      "*,events:groupEvent(*)"
    )
    .eq("id", id)
    .single();

  if (error) {
    console.log("Group Error:" + error.message);
    throw new Error(error.message);
  }
  return group;
};

export async function updateGroup (
  id: string, title: string, description: string, goal: string
) : Promise<boolean> {
  const {data, error} = await supabase
    .from("group")
    .update({title: title, description: description, goal: goal})
    .eq("id", id)
  if (error) {
    throw new Error(error.message)
  }
  return true;
}

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
    throw new Error(profileErr.message);
  }

  const profiles = profileData.map(
    (item) => item.profile as any as Tables<"profile">
  );

  return profiles;
};

export async function createGroup(profileId: string, 
    title: string,
    description: string,
    goal: string) : Promise<string[]> {
    const {data, error} = await supabase
        .from("group")
        .insert({
            title:title,
            description:description,
            goal:goal
        })
        .select()
    if (error) {
        throw Error(error.message)
    }
    const groupId = data[0].id
    console.log(groupId + " -- groupId, " + profileId + " -- " + profileId)
    const {data: relData, error: relError} = await supabase
        .from("groupRel")
        .insert({groupId: groupId, profileId: profileId, role:"owner"});
    if (relError) {
        throw Error(relError.message)
    }
    return [groupId, profileId] as string[]
}

export async function getAllGroups(): Promise<GroupOverview[]> {
  const { data, error } = await supabase
    .from("group")
    .select("id,title,icon,goal");
  if (error) {
    throw new Error(error.message);
  }
  const groupOverviews = data.map((row, i) => {
    return {
      groupId: row.id,
      icon: row.icon,
      goal: row.goal,
      title: row.title,
    };
  });
  return groupOverviews as GroupOverview[];
}

export async function isTitleUnique(title: string) : Promise<boolean> {
  const {data, error} = await supabase
    .from("group")
    .select("id")
    .eq("title", title)
  if (error) {
    throw new Error(error.message)
  }
  return data.length == 0
}

export async function isTitleUniqueToGroup(title: string, groupId: string) : Promise<boolean> {
  const {data, error} = await supabase
    .from("group")
    .select("id")
    .eq("title", title)
    .neq("id", groupId)
  if (error) {
    throw new Error(error.message)
  }
  return data.length == 0
}

export async function getUserGroups(profileId: string) : Promise<string[]> {
  const {data, error} = await supabase
    .from("groupRel")
    .select("groupId")
    .eq("profileId", profileId);
  if (error) {
  //  console.error(error.message)
   throw new Error(error.message);
  }
  return data.map((row) => {
    return row.groupId as string
  }) as string[]
}

export async function isMemberOfGroup(groupId: string, profileId: string): Promise<boolean>{
  const {data, error} = await supabase
    .from("groupRel")
    .select("id")
    .eq("profileId", profileId)
    .eq("groupId", groupId)
  if (error) {
    throw new Error(error.message)
  }
  return data.length > 0
}

export async function leaveGroup(groupId: string, profileId: string) {
    await supabase
        .from("groupRel")
        .delete()
        .eq("groupId", groupId)
        .eq("profileId", profileId);
}

export async function joinGroup(groupId: string, profileId: string) {
    await supabase
        .from("groupRel")
        .insert({groupId: groupId, profileId: profileId, role:"member"});
}

export async function getRole(groupId: string, profileId: string) : Promise<string>{
    const {data, error} = await supabase
        .from("groupRel")
        .select("role")
        .eq("groupId", groupId)
        .eq("profileId", profileId)
    if (error) {
        throw new Error(error.message)
    }
    return data[0].role
}

export async function setRole(groupId: string, profileId: string, role: string) {
    const {data, error} = await supabase
        .from("groupRel")
        .update({role: role})
        .eq("groupId", groupId)
        .eq("profileId", profileId)
    // console.error("Role query done")
    if (error) {
        // console.error("Setting role error: " + error.message)
        throw new Error(error.message)
    }
    return
}

export async function getNumOfMembers(groupId: string): Promise<number> {
  const { data, error } = await supabase
    .from("groupRel")
    .select("profileId")
    .eq("groupId", groupId);
  if (error) {
    throw new Error(error.message);
  }
  return data.length;
}

export async function getMembers(groupId: string): Promise<GroupRelWithProfile[]> {
    const {data, error} = await supabase
        .from("groupRel")
        .select("*,profile:profileId(*)")
        .eq("groupId", groupId)
    if (error) {
        throw new Error(error.message);
    }

    return data as any 
}