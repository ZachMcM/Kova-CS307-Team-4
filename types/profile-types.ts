export type PrivateProfile = {
  id: string;
  user_id: string;
  username: string;
  name: string;
  avatar: string;
  private: string;
  friends: number;
  following: number;
  followers: number;
};

export type PublicProfile = {
  id: string;
  user_id: string;
  username: string;
  name: string;
  avatar: string;
  private: string;
  friends: number;
  following: number;
  followers: number;
  age: number;
  location: string;
  goal: string;
  bio: string;
  achievement: string;
};

export type Profile = PublicProfile | PrivateProfile;

// Function to to check if a profile is public (in general)
export function getProfileAccess(profile: Profile, friend: boolean): profile is PublicProfile {
  if (profile.private === "PUBLIC") { return true; }
  if (profile.private === "PRIVATE") { return false; }
  if (profile.private === "FRIENDS" && friend)
  {
    return true;
  }
  else {
    return false;
  }
}