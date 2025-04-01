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
    console.log(error);
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
      `
      *,
      events:groupEvent(*)
      `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.log(error);
    throw new Error(error.message);
  }

  return group;
};

/*
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

  const profiles = profileData.map(
    (item) => item.profile as any as Tables<"profile">
  );

  return profiles;
};
*/

export async function createGroup(userId: string, 
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
    const profileId = (await getProfile(userId)).id
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
    .select("id,title,icon,description");
  if (error) {
    throw new Error(error.message);
  }
  const groupOverviews = data.map((row, i) => {
    return {
      groupId: row.id,
      icon: row.icon,
      description: row.description,
      title: row.title,
    };
  });
  return groupOverviews as GroupOverview[];
}

export async function getGroupsOfUser(userId: string) : Promise<string[]> {
    const profileId = (await getProfile(userId)).id
    const {data, error} = await supabase
        .from("groupRel")
        .select("groupId")
        .eq("profileId", profileId);
    if (error) {
        throw new Error(error.message);
    }
    const items = (data) ? data.map((row, i) => {
        return row.groupId;
      })
    : [];
  return items as string[];
}

export async function isMemberOfGroup(groupId: string, userId: string): Promise<boolean>{
  const profileId = (await getProfile(userId)).id
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

export async function leaveGroup(groupId: string, userId: string) {
    const profileId = (await getProfile(userId)).id
    await supabase
        .from("groupRel")
        .delete()
        .eq("groupId", groupId)
        .eq("profileId", profileId);
}

export async function joinGroup(groupId: string, userId: string) {
    const profileId = (await getProfile(userId)).id
    await supabase
        .from("groupRel")
        .insert({groupId: groupId, profileId: profileId, role:"member"});
}

export async function getRole(groupId: string, userId: string) : Promise<string>{
    const profileId = (await getProfile(userId)).id
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

export async function setRole(groupId: string, userId: string, role: string) {
    const profileId = (await getProfile(userId)).id
    const {data, error} = await supabase
        .from("groupRel")
        .update({role: role})
        .eq("groupId", groupId)
        .eq("profileId", profileId)
    if (error) {
        throw new Error(error.message)
    }
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
        .select("role, profile:profileId(*)")
        .eq("groupId", groupId)
    if (error) {
        throw new Error(error.message);
    }

    return data as any 

    // const memberInfo = data.map((row, i) => {
    //     const profile = row.profile as any as Tables<"profile">
    //     return {
    //         role: row.role,
    //         id: profile.id,
    //         user_id: profile.userId,
    //         username: profile.username,
    //         name: profile.name,
    //         avatar: profile.avatar,
    //         private: profile.private,
    //         friends: profile.friends,
    //         following: profile.following,
    //         followers: profile.followers,
    //         age: profile.age,
    //         location: profile.location,
    //         goal: profile.goal,
    //         bio: profile.bio,
    //         achievement: profile.achievement
    //     } as MemberRelationship
    //   });
    // return memberInfo as MemberRelationship[];
}