import { supabase } from "@/lib/supabase";
import { Profile, PublicProfile } from "@/types/profile-types";

export interface privacies {
  // friends_following: string,
  // age: string,
  // weight: string,
  // location: string,
  // goal: string,
  // bio: string,
  // achievement: string,
  // gender: string,
  // posts: string,
  [key: string]: any
  //TODO later potentially add a 'statistics' privacy too
}

// Get profile based on provided user_id
export const getProfiles = async (ids: string[]): Promise<Map<string, Profile>> => {
  const profiles = new Map<string, Profile>();
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .containedBy("id", ids)
  for (const id of ids) {
    const profile = await getProfile(id);
    profiles.set(profile.user_id, profile);
  }
  return profiles;
}

export const getUserIdFromProfile = async (profileId: string): Promise<string> => {
  const { data: profile, error } = await supabase
    .from("profile")
    .select("userId")
    .eq("id", profileId)
    .limit(1).single();

  if (error) { 
    throw new Error(error.message)
  };
  return profile.userId
}

export const getProfile = async (id: string): Promise<Profile> => {
  const { data: profile, error } = await supabase
    .from("profile")
    .select("*")
    .eq("userId", id)
    .limit(1).single();

  if (error) { 
    throw new Error(error.message)
  };

  //if (profile.private === "PRIVATE") {
  //  return {
  //    id: profile.id,
  //    user_id: profile.user_id,
  //    name: profile.name,
  //    username: profile.username,
  //    avatar: profile.avatar,
  //    private: profile.private,
  //    friends: profile.friends,
  //    following: profile.following,
  //    followers: profile.followers
  //  } as PrivateProfile;
  //}
  return {
    id: profile.id,
    user_id: id,     //profile.user_id is bugged and returns undefined in this case, using this as a fix
    name: profile.name,
    username: profile.username,
    avatar: profile.avatar,
    private: profile.private,
    friends: profile.friends,
    following: profile.following,
    followers: profile.followers,
    age: profile.age,
    gender: profile.gender,
    weight: profile.weight,
    location: profile.location,
    goal: profile.goal,
    bio: profile.bio,
    achievement: profile.achievement,
    privacy_settings: profile.privacy_settings,
    goals: profile.goals,
  } as PublicProfile;
}

export const updateProfile = async (id:string, goal: string, bio: string, location: string, achievement: string, 
                                    privacy: string, name: string, age: number, gender: string, weight: number, privacy_settings?: privacies) => {
  const { error } = await supabase
    .from("profile")
    .update({
      goal: goal,
      bio: bio,
      location: location,
      achievement: achievement,
      private: privacy,
      name: name,
      age: age,
      gender: gender,
      weight: weight,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  if (privacy_settings) {
    const { error: privacy_error } = await supabase
    .from("profile")
    .update({
      privacy_settings: privacy_settings
    })
    .eq("id", id);

  if (privacy_error) {
    throw new Error(privacy_error.message);
  }
  }
};

export const updateProfilePrivacies = async (userId:string, privacy_settings: privacies) => {
  const { error: privacy_error } = await supabase
    .from("profile")
    .update({
      privacy_settings: privacy_settings
    })
    .eq("userId", userId);

  if (privacy_error) {
    throw new Error(privacy_error.message);
  }
}

export const getProfilePrivacies = async (userId: string) => {
  const { data: privacy_settings, error } = await supabase
  .from("profile")
  .select("privacy_settings")
  .eq("userId", userId)
  .limit(1).single();

   if (error) throw new Error(error.message);

   return privacy_settings.privacy_settings as privacies;
}

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
    // Input validation
    if (!sourceId || !targetId) {
      throw new Error("Source ID and Target ID are required");
    }
    
    // Call the stored procedure
    const { data, error } = await supabase.rpc('follow_user', {
      source_id: sourceId,
      target_id: targetId
    });
    
    // Handle any errors from the RPC call
    if (error) {
      console.error("Error following user:", error);
      throw error;
    }
    
    return { success: true, data };
  } catch (err) {
    console.error("Failed to follow user:", err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "Unknown error occurred" 
    };
  }
}

export const unfollowUser = async (sourceId: string, targetId: string) => {
  try {
    // Input validation
    if (!sourceId || !targetId) {
      throw new Error("Source ID and Target ID are required");
    }
    
    // Call the stored procedure
    const { data, error } = await supabase.rpc('unfollow_user', {
      source_id: sourceId,
      target_id: targetId
    });
    
    // Handle any errors from the RPC call
    if (error) {
      console.error("Error unfollowing user:", error);
      throw error;
    }
    
    return { success: true, data };
  } catch (err) {
    console.error("Failed to unfollow user:", err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "Unknown error occurred" 
    };
  }
}

export const getFollowers = async (userId: string) => {
  const { data: followers, error } = await supabase.from("followingRel").select("sourceId").eq("targetId", userId);
  if (error) throw new Error(error.message);

  const { data: profiles, error: profileError } = await supabase.from("profile").select(`userId, name, avatar`).in("userId", followers.map(follower => follower.sourceId));
  if (profileError) throw new Error(profileError.message);

  return profiles;
}

export const getFollowing = async (userId: string) => {
  const { data: following, error } = await supabase.from("followingRel").select("targetId").eq("sourceId", userId);
  if (error) throw new Error(error.message);
  
  const { data: profiles, error: profileError } = await supabase.from("profile").select(`userId, name, avatar`).in("userId", following.map(following => following.targetId));
  if (profileError) throw new Error(profileError.message);

  return profiles;
}

export const getFriends = async (userId: string) => {
  const { data: following, error } = await supabase.from("followingRel").select("targetId").eq("sourceId", userId);
  if (error) throw new Error(error.message);

  const { data: followers, error: followerError } = await supabase.from("followingRel").select("sourceId").eq("targetId", userId);
  if (followerError) throw new Error(followerError.message);

  const friends = following.filter(following => followers.some(follower => follower.sourceId === following.targetId));
  const { data: profiles, error: profileError } = await supabase.from("profile").select(`userId, name, avatar`).in("userId", friends.map(friend => friend.targetId));
  if (profileError) throw new Error(profileError.message);

  return profiles;
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

export const updateProfileGoals = async (userId: string, goals: JSON[]) => {
  console.log("Updating goals for userId:", userId, "with goals:", goals);
  const { error } = await supabase
    .from("profile")
    .update({
      goals: goals,
    })
    .eq("userId", userId);

  if (error) {
    return false;
  }
  else {
    return true;
  }
}