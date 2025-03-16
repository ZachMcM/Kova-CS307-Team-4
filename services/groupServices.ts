import { supabase } from "@/lib/supabase";
import { GroupOverview, MemberRelationship } from "@/types/extended-types";
import { getProfile, getProfiles } from "./profileServices";

export async function getAllGroups() {
    const {data, error} = await supabase
        .from("group")
        .select("id,title,icon,description");
    const groupOverviews = data?.map

}

export async function getGroupsOfUser(userId: string) {
    const {data, error} = await supabase
        .from("group")
        .select("id,title,icon,description")
        .eq("profileId", userId);

}

export async function leaveGroup(groupId: string, userId: string) {

}

export async function joinGroup(groupId: string, userId: string) {

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
    const memberInfo = data!.map((row, i) => {
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

export async function getGroup(groupId: string) {

}