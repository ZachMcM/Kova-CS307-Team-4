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