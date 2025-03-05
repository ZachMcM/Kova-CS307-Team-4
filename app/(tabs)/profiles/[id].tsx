import StaticContainer from "@/components/StaticContainer";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from '@/components/ui/vstack';
import { HStack } from "@/components/ui/hstack";
import { Avatar, AvatarFallbackText, AvatarImage } from "@/components/ui/avatar";
import { Box } from "@/components/ui/box";
import { Pressable } from "@/components/ui/pressable";
import { Input, InputField, InputSlot, InputIcon } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { Icon, MenuIcon, TrashIcon, CheckCircleIcon } from "@/components/ui/icon";
import { useRouter } from "expo-router";
import { getProfile, updateProfile, isProfileFollowed, isProfileFollowing, followUser, unfollowUser, uploadProfilePicture } from "@/services/profileServices";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Spinner } from "@/components/ui/spinner";
import { getProfileAccess } from "@/types/profile-types";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { showErrorToast, showSuccessToast, showFollowToast } from "@/services/toastServices";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import * as ImagePicker from 'expo-image-picker';
import { Badge, BadgeText, BadgeIcon } from "@/components/ui/badge";
import { View } from "react-native";
import { set } from "zod";

export default function ProfileScreen() {

  // General states
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const toast = useToast();
  const [userId, setUserId] = useState<string | null>(null);

  // Profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [storedGoal, setStoredGoal] = useState("");
  const [goal, setGoal] = useState("");

  const [storedBio, setStoredBio] = useState("");
  const [bio, setBio] = useState("");

  const [storedAvatar, setStoredAvatar] = useState("");
  const [avatar, setAvatar] = useState("");

  const [storedLocation, setStoredLocation] = useState("");
  const [location, setLocation] = useState("");

  const [storedAchievement, setStoredAchievement] = useState("");
  const [achievement, setAchievement] = useState("");

  const [goalDisabled, setGoalDisabled] = useState(false);
  const [bioDisabled, setBioDisabled] = useState(false);
  const [locationDisabled, setLocationDisabled] = useState(false);
  const [achievementDisabled, setAchievementDisabled] = useState(false);

  // Follower functionality
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollower, setIsFollower] = useState(false);

  const isFriend = isFollowing && isFollower;

  // Functions related to accessing the profiles
  const { data: profile, isPending } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const profile = (await getProfile(id as string) || null);
      return profile;
    },
  });

  const { data: followingData, isPending: isFollowingPending } = useQuery({
    queryKey: ["followingStatus", userId, id],
    queryFn: async () => {
      if (!userId || !id || typeof id !== 'string') return false;
      return await isProfileFollowed(userId, id);
    },
    enabled: !!userId && !!id, // Only run the query if userId and id are defined
  });

  const { data: followerData, isPending: isFollowerPending } = useQuery({
    queryKey: ["followerStatus", userId, id],
    queryFn: async () => {
      if (!userId || !id || typeof id !== 'string') return false;
      return await isProfileFollowing(userId, id);
    },
    enabled: !!userId && !!id, // Only run the query if userId and id are defined
  });

  useEffect(() => {
    setIsFollowing(!!followingData);
  }, [followingData]);

  useEffect(() => {
    setIsFollower(!!followerData);
  }, [followerData]);
  
  useEffect(() => {
    const fetchUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (profile && getProfileAccess(profile, isFriend)) {
      setGoal(profile.goal || "");
      setBio(profile.bio || "");
      setAvatar(profile.avatar || "");
      setLocation(profile.location || "");
      setAchievement(profile.achievement || "");
    }
  }, [profile]);

  useEffect(() => {
  }, [isEditingProfile]);

  // Functions related to editing the profile
  const handleSave = async () => {
    try {
      if (profile && getProfileAccess(profile, isFriend)) {
        // If the user has disabled the input, set the value to an empty string
        if (locationDisabled) { setLocation(""); }
        if (goalDisabled) { setGoal(""); }
        if (bioDisabled) { setBio(""); }
        if (achievementDisabled) { setAchievement(""); }

        await updateProfile(profile.id, goal, bio, location, achievement);
        setIsEditingProfile(false);
        showSuccessToast(toast, "Profile updated successfully");

        // "Update" the profile with values on the frontend
        profile.location = location;
        profile.goal = goal;
        profile.bio = bio;
        profile.avatar = avatar;
        profile.achievement = achievement;

        // Re-enable the inputs
        setGoalDisabled(false);
        setBioDisabled(false);
        setLocationDisabled(false);
        setAchievementDisabled(false);
      }
    } catch (error) {
      console.error(error);
      showErrorToast(toast, "Failed to update profile");
    }
  };

  const saveValuesAndEditProfile = () => {

    if (profile && getProfileAccess(profile, isFriend)) {
      setStoredAvatar(profile.avatar);
      setStoredLocation(profile.location);
      setStoredGoal(profile.goal);
      setStoredBio(profile.bio);
      setStoredAchievement(profile.achievement);
    }
    setIsEditingProfile(true);
  }

  const saveAndSetEditingProfile = async () => {
    setIsEditingProfile(false);
    await handleSave();
  };

  const cancelEdits = () => {
    setIsEditingProfile(false);
    setGoalDisabled(false);
    setBioDisabled(false);
    setLocationDisabled(false);
    setAchievementDisabled(false);
    setAvatar(storedAvatar);
    setLocation(storedLocation);
    setGoal(storedGoal);
    setBio(storedBio);
    setAchievement(storedAchievement);
    if (profile && getProfileAccess(profile, isFriend)) { 
      profile.avatar = storedAvatar;
      profile.location = storedLocation;
      profile.goal = storedGoal;
      profile.bio = storedBio;
      profile.achievement = storedAchievement;
    }
  };

  const disableGoalInput = () => {
    setGoalDisabled(true);
    setGoal("");
  };

  const disableLocationInput = () => {
    setLocationDisabled(true);
    setLocation("");
  };

  const disableAchievementInput = () => {
    setAchievementDisabled(true); 
    setAchievement("");
  }

  // Friends and Following functionality

  const followProfile = async () => {
    try {
      if (profile && userId && id && typeof id === 'string') {
        await followUser(userId, id);
        setIsFollowing(true);
        showFollowToast(toast, profile.name, true);
        profile.followers += 1;

        if (isFollower) {
          profile.friends += 1;
        }
      }
    } catch (error) {
      console.error(error);
      showErrorToast(toast, "Failed to follow profile");
    }
  }

  const unfollowProfile = async () => {
    try {
      if (profile && userId && id && typeof id === 'string') {
        await unfollowUser(userId, id);
        setIsFollowing(false);
        showFollowToast(toast, profile.name, false);
        profile.followers -= 1;

        if (isFollower) {
          profile.friends -= 1;
        }
      }
    } catch (error) {
      console.error(error);
      showErrorToast(toast, "Failed to unfollow profile");
    }
  }

  // Image upload functionality
  const pickImage = async () => {
    const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (result.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      const file = {uri: pickerResult.assets[0].uri, name: pickerResult.assets[0].uri.split('/').pop(), type: 'image/jpeg'};

      try {
        if (userId && profile) {
          // @ts-ignore
          const publicURL = await uploadProfilePicture(userId, file);
          profile.avatar = publicURL;
          showSuccessToast(toast, "Profile picture updated successfully");
          setAvatar(publicURL);
        }
      } catch (error) {
        console.error(error);
        showErrorToast(toast, "Failed to upload profile picture");
      }
    }
  };

  return (
   <StaticContainer className = "flex px-6 py-16">
      <VStack space = "md">
        <Box className = "border-b border-gray-300 pb-2">
          {isPending ? (
            <Spinner />
          )
          : profile && (
          <VStack space = "lg">
            <HStack space = "md">
              { isEditingProfile ? (
                <Pressable onPress={pickImage}>
                  <Avatar className="bg-indigo-600 mt-1" size = "xl">
                    {profile.avatar ? (
                      <AvatarImage source={{ uri: profile.avatar }}></AvatarImage>
                    ) : (
                      <AvatarFallbackText className="text-white">{profile.name}</AvatarFallbackText>
                    )}
                  </Avatar>
                </Pressable>
              ) : (
                <Avatar className="bg-indigo-600 mt-1" size = "xl">
                  {profile.avatar ? (
                    <AvatarImage source={{ uri: profile.avatar }} />
                  ) : (
                    <AvatarFallbackText className="text-white">{profile.name}</AvatarFallbackText>
                  )}
                </Avatar>
              )}
              <VStack space = "xs">
                <VStack>
                  <HStack>
                    <Heading size="xl" className = "mb-0 h-8 w-56">{profile.name}</Heading>
                    { isFriend && (
                      <Badge size="md" variant="solid" action="muted" className = "bg-none text-none rounded-2xl">
                        <BadgeIcon as={CheckCircleIcon} className = "text-[#4d7599]"></BadgeIcon>
                        <Text className = "ml-1 text-[#4d7599] text-sm">Friend</Text>
                      </Badge>
                    )}
                  </HStack>
                  <Text size="sm">@{profile.username}</Text>
                </VStack>
                <HStack space = "2xl">
                  <Pressable onPress = {() => router.replace(`/relations/${id}?type=friends`)}>
                    <VStack>
                      <Heading size = "lg" className = "text-center">{profile.friends}</Heading>
                      <Text size = "sm" className = "text-center">friends</Text>
                    </VStack>
                  </Pressable>
                  <Pressable onPress = {() => router.replace(`/relations/${id}?type=followers`)}>
                    <VStack>
                      <Heading size = "lg" className = "text-center">{profile.followers}</Heading>
                      <Text size = "sm" className = "text-center">followers</Text>
                    </VStack>
                  </Pressable>
                  <Pressable onPress = {() => router.replace(`/relations/${id}?type=following`)}>
                    <VStack>
                      <Heading size = "lg" className = "text-center">{profile.following}</Heading>
                      <Text size = "sm" className = "text-center">following</Text>
                    </VStack>
                  </Pressable>
                </HStack>
              </VStack>
              { userId === id && (
                <Button onPress={() => router.replace("/settings")} className = "w-0 h-0">
                  <Icon as = {MenuIcon} size = "xl" className = "mt-8 ml-8 w-8 h-8"></Icon>
                </Button>
              )}
            </HStack>
            <VStack>
              { (getProfileAccess(profile, isFriend) || userId === id) && (isEditingProfile || (profile.location || profile.goal || profile.bio)) && (
                <Box className = "border border-gray-300 rounded p-2 mt-2">
                  { isEditingProfile && !locationDisabled ? (
                    <HStack>
                      <Heading size = "md" className = "mr-1 mt-3">📍</Heading>
                      <Input size = "md" variant = "outline" className = "mt-2 w-11/12 ml-0.5">
                        <InputField id = "locationInput" value={location} onChangeText={setLocation} maxLength = {40} placeholder = "Add your town or city..."></InputField>
                        <InputSlot>
                          <Pressable onPress={disableLocationInput}>
                            <InputIcon as={TrashIcon} className = "mr-2 bg-none"></InputIcon>
                          </Pressable>
                        </InputSlot>
                      </Input>
                    </HStack>
                  ) : profile.location && !locationDisabled && (
                    <HStack className = "text-wrap">
                      <Heading size = "md" className = "mr-1">📍</Heading>
                      <View className = "w-11/12">
                        <Heading size = "md">{profile.location}</Heading>
                      </View>
                    </HStack>
                  )}
                  { isEditingProfile && !achievementDisabled ? (
                    <HStack>
                      <Heading size = "md" className = "mr-1 mt-3">🏆</Heading>
                      <Input size = "md" variant = "outline" className = "mt-2 w-11/12 ml-0.5">
                        <InputField id = "achievementInput" value={achievement} onChangeText={setAchievement} maxLength = {40} placeholder = "Write something you're proud of..."></InputField>
                        <InputSlot>
                          <Pressable onPress={disableAchievementInput}>
                            <InputIcon as={TrashIcon} className = "mr-2 bg-none"></InputIcon>
                          </Pressable>
                        </InputSlot>
                      </Input>
                    </HStack>
                  ) : profile.achievement && !achievementDisabled && (
                    <HStack className = "text-wrap">
                      <Heading size = "md" className = "mr-1">🏆</Heading>
                      <View className = "w-11/12">
                        <Heading size = "md">{profile.achievement}</Heading>
                      </View>
                    </HStack>
                  )}
                  { isEditingProfile && !goalDisabled ? (
                    <HStack>
                      <Heading size = "md" className = "mr-1 mt-3">🎯</Heading>
                      <Input size = "md" variant = "outline" className = "mt-2 w-11/12 ml-0.5">
                        <InputField id = "goalInput" value={goal} onChangeText={setGoal} maxLength = {40} placeholder = "Write your next big goal..."></InputField>
                        <InputSlot>
                          <Pressable onPress={disableGoalInput}>
                            <InputIcon as={TrashIcon} className = "mr-2 bg-none"></InputIcon>
                          </Pressable>
                        </InputSlot>
                      </Input>
                    </HStack>
                  ) : profile.goal && !goalDisabled && (
                    <HStack className = "text-wrap">
                      <Heading size = "md" className = "mr-1">🎯</Heading>
                      <View className = "w-11/12">
                        <Heading size = "md">{profile.goal}</Heading>
                      </View>
                    </HStack>
                  )}
                  { isEditingProfile ? (
                    <Textarea className = "text-wrap mt-2">
                      <TextareaInput id = "bioInput" value={bio} onChangeText={setBio} maxLength={300} placeholder = "Write some information about yourself..."></TextareaInput>
                    </Textarea>
                  ) : profile.bio && (
                    <Text className = "mt-2">{profile.bio}</Text>
                  )}
                </Box>
              )}
            </VStack>
            { userId === id && isEditingProfile ? (
              <HStack>
                <Button size = "lg" variant = "solid" action = "primary" className = "bg-[#db5b4d] mr-2 flex-auto" onPress={cancelEdits}>
                  <ButtonText className = "text-white">Cancel</ButtonText>
                </Button>
                <Button size = "lg" variant = "solid" action = "primary" className = "bg-[#397a2c] flex-auto" onPress={saveAndSetEditingProfile}>
                  <ButtonText className = "text-white">Save</ButtonText>
                </Button>
              </HStack>
            ) : userId === id ? (
              <Button size = "lg" variant = "outline" action = "primary" className = "border-[#6FA8DC]" onPress={saveValuesAndEditProfile}>
                <ButtonText className = "text-[#6FA8DC]">Edit Profile</ButtonText>
              </Button>
            ) : isFollowing ? (
              <Button size = "lg" variant = "outline" action = "secondary" className = "border-[#6FA8DC]" onPress={unfollowProfile}>
                <ButtonText className = "text-[#6FA8DC]">Unfollow</ButtonText>
              </Button>
            ) : (
              <Button size = "lg" variant = "solid" action = "primary" className = "bg-[#6FA8DC]" onPress={followProfile}>
                <ButtonText className = "text-white">Follow</ButtonText>
              </Button>
            )}
          </VStack>
          )}
        </Box>

      </VStack>
   </StaticContainer>
  );
}