import { supabase } from "@/lib/supabase";
import { Profile, PrivateProfile, PublicProfile } from "@/types/profile-types";

// Get profile based on provided user_id
export const getProfile = async (id: string): Promise<Profile> => {
  const { data: profile, error } = await supabase
    .from("profile")
    .select("*")
    .eq("userId", id)
    .limit(1).single();

  if (error) throw new Error(error.message);

  if (profile.private) {
    return {
      id: profile.id,
      user_id: profile.user_id,
      name: profile.name,
      username: profile.username,
      avatar: profile.avatar,
      private: profile.private,
      friends: profile.friends,
      following: profile.following,
      followers: profile.followers
    } as PrivateProfile;
  } else {
    return {
      id: profile.id,
      user_id: profile.user_id,
      name: profile.name,
      username: profile.username,
      avatar: profile.avatar,
      private: profile.private,
      friends: profile.friends,
      following: profile.following,
      followers: profile.followers,
      age: profile.age,
      location: profile.location,
      goal: profile.goal,
      bio: profile.bio
    } as PublicProfile;
  }
}

export const updateProfile = async (id:string, goal: string, bio: string, location: string) => {
  const { error } = await supabase
    .from("profile")
    .update({
      goal: goal,
      bio: bio,
      location: location,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
};

export const isProfileFollowed = async (sourceId: string, targetId: string): Promise<boolean> => {
  const { data: follows, error } = await supabase
    .from("followingRel")
    .select("*")
    .eq("sourceId", sourceId)
    .eq("targetId", targetId)
    .limit(1);

  if (error) throw new Error(error.message);

  return follows.length !== 0;
}

export const isProfileFollowing = async (sourceId: string, targetId: string): Promise<boolean> => {
  const { data: follows, error } = await supabase
    .from("followingRel")
    .select("*")
    .eq("sourceId", targetId)
    .eq("targetId", sourceId)
    .limit(1);

  if (error) throw new Error(error.message);

  return follows.length !== 0;
}

export const followUser = async (sourceId: string, targetId: string) => {
  try {
    await supabase.from("followingRel").insert([{ sourceId: sourceId, targetId: targetId }]);
    await supabase.rpc('increment_following', { user_id: sourceId });
    await supabase.rpc('increment_followers', { user_id: targetId });
  } catch (error) {
    throw new Error("Failed to insert follow relationship");
  }

  // Check if both users follow eachother
  const isMutualFollow = await isProfileFollowed(targetId, sourceId);

  if (isMutualFollow) {
    try {
      await supabase.rpc('increment_friends', { user_id: sourceId });
      await supabase.rpc('increment_friends', { user_id: targetId });
    } catch {
      throw new Error("Failed to insert friend relationship");
    }
  }
}

export const unfollowUser = async (sourceId: string, targetId: string) => {
  try {
    await supabase.from("followingRel").delete().eq("sourceId", sourceId).eq("targetId", targetId);
    await supabase.rpc('decrement_following', { user_id: sourceId });
    await supabase.rpc('decrement_followers', { user_id: targetId });
  } catch (error) {
    throw new Error("Failed to delete follow relationship");
  }

  // Check if both users follow eachother
  const isMutualFollow = await isProfileFollowed(targetId, sourceId);

  if (isMutualFollow) {
    try {
      await supabase.rpc('decrement_friends', { user_id: sourceId });
      await supabase.rpc('decrement_friends', { user_id: targetId });
    } catch {
      throw new Error("Failed to delete friend relationship");
    }
  }
}

export const uploadProfilePicture = async (userId: string, file: File) => {
  try {
    const filePath = `${userId}/${file.name}`;
    await supabase.storage.from('profile-images').upload(filePath, file);
    const { data: publicURLData } = supabase.storage.from('profile-images').getPublicUrl(filePath);
    const publicURL = publicURLData.publicUrl;
    await supabase.from('profile').update({ avatar: publicURL }).eq('userId', userId);
    return publicURL;
  } catch (error) {
    throw new Error("Failed to upload profile picture");
  }
}