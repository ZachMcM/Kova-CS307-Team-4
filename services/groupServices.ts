import { supabase } from "@/lib/supabase";
import { GroupOverview, GroupPage, MemberRelationship } from "@/types/extended-types";
import { getProfile, getProfiles } from "./profileServices";
import { ExtendedGroupWithEvents } from "@/types/extended-types";

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

  console.log(group);

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

  const profiles = profileData.map((item) => item.profile as any as Tables<'profile'>);

  return profiles;
};
*/

export async function getAllGroups() : Promise<GroupOverview[]> {
    const {data, error} = await supabase
        .from("group")
        .select("id,title,icon,description");
    if (error) {
        throw new Error(error.message);
    }
    const groupOverviews = data.map((row, i) => {
        return {groupId: row.id, 
            icon: row.icon, 
            description: row.description,
            title: row.title};
    });
    return groupOverviews as GroupOverview[]
}

export async function getGroupsOfUser(userId: string) : Promise<string[]> {
    const {data, error} = await supabase
        .from("groupRel")
        .select("groupId")
        .eq("profileId", userId);
    if (error) {
        throw new Error(error.message);
    }
    const items = data.map((row, i) => {
        return row.groupId;
    })
    return items as string[];
}

export async function leaveGroup(groupId: string, userId: string) {
    await supabase
        .from("groupRel")
        .delete()
        .eq("groupId", groupId)
        .eq("profileId", userId);
}

export async function joinGroup(groupId: string, userId: string) {
    await supabase
        .from("groupRel")
        .insert({groupId: groupId, userId: userId});
}

export async function getNumOfMembers(groupId: string): Promise<number> {
    const {data, error} = await supabase
        .from("groupRel")
        .select("profileId")
        .eq("groupId", groupId);
    if (error) {
        throw new Error(error.message);
    }
    return data.length;
}

export async function getMembers(groupId: string): Promise<MemberRelationship[]> {
    const {data, error} = await supabase
        .from("groupRel")
        .select("profileId,role")
        .eq("groupId", groupId)
    if (error) {
        throw new Error(error.message);
    }
    const profiles = await getProfiles(data.map((row, i) => row.profileId));
    const memberInfo = data.map((row, i) => {
        const profile = profiles.get(row.profileId)!;
        return {
            role: row.role,
            id: profile.id,
            user_id: profile.user_id,
            username: profile.username,
            name: profile.name,
            avatar: profile.avatar,
            private: profile.private,
            friends: profile.friends,
            following: profile.following,
            followers: profile.followers,
            age: profile.age,
            location: profile.location,
            goal: profile.goal,
            bio: profile.bio,
            achievement: profile.achievement
        }});
    return memberInfo as MemberRelationship[];
}