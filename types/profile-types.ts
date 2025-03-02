export type PrivateProfile = {
  id: string;
  user_id: string;
  username: string;
  avatar: string;
  private: true;
  friends: number;
  following: number;
  followers: number;
};

export type PublicProfile = {
  id: string;
  user_id: string;
  username: string;
  avatar: string;
  private: false;
  friends: number;
  following: number;
  followers: number;
  age: number;
  location: string;
  goal: string;
  bio: string;
};

export type Profile = PublicProfile | PrivateProfile;

// Function to to check if a profile is public (in general)
export function isPublicProfile(profile: Profile): profile is PublicProfile {
  return profile.private === false;
}