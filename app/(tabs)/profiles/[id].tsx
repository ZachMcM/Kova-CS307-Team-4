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
import { Icon, MenuIcon, TrashIcon, CheckCircleIcon, CircleIcon, AlertCircleIcon, EditIcon } from "@/components/ui/icon";
import { useRouter } from "expo-router";
import { getProfile, updateProfile, isProfileFollowed, isProfileFollowing, followUser, unfollowUser, uploadProfilePicture, privacies, getProfilePrivacies } from "@/services/profileServices";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { RadioGroup, Radio, RadioIndicator, RadioIcon, RadioLabel } from "@/components/ui/radio"
import { useSession } from "@/components/SessionContext";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ProfileActivities } from "@/components/ProfileActivities";
import { Post } from "../feed";
import { useNavigation } from "@react-navigation/native";
import { getWeightEntries } from "@/services/weightServices";
import Container from "@/components/Container";

export default function ProfileScreen() {

  // General states
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const [userId, setUserId] = useState<string | null>(null);
  const { session } = useSession();

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

  const [storedName, setStoredName] = useState("");
  const [nameValue, setNameValue] = useState("");

  const [goalDisabled, setGoalDisabled] = useState(false);
  const [bioDisabled, setBioDisabled] = useState(false);
  const [locationDisabled, setLocationDisabled] = useState(false);
  const [achievementDisabled, setAchievementDisabled] = useState(false);
  const [ageDisabled, setAgeDisabled] = useState(false);
  const [genderDisabled, setGenderDisabled] = useState(false);
  const [weightDisabled, setWeightDisabled] = useState(false);

  // Follower functionality
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollower, setIsFollower] = useState(false);

  const isFriend = isFollowing && isFollower;

  const [privacyValues, setPrivacyValue] = useState("PRIVATE");
  const [storedPrivacyValue, setStoredPrivacyValues] = useState("");

  const [storedAge, setStoredAge] = useState("")
  const [age, setAge] = useState("")
  const [storedGender, setStoredGender] = useState("")
  const [gender, setGender] = useState("")
  const [storedWeight, setStoredWeight] = useState("")

  //Activity UI related states
  const [posts, setPosts] = useState<any[]>([]);
  const [postError, setPostError] = useState<Error | null>(null);
  const [postsIsLoading, setPostsIsLoading] = useState(true);

  // Functions related to accessing the profiles
  const { data: profile, isPending } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const profile = (await getProfile(id as string));
      return profile;
    },
  });

  const { data: weight, isPending: weightIsPending } = useQuery({
    queryKey: ["weight", id],
    queryFn: async () => {
      const weight = (await getWeightEntries(id as string, 1));
      return `${weight[0].weight} ${weight[0].unit}`;
    }
  })

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

  const { data: privacy_list, isPending: isPrivacyPending } = useQuery({
    queryKey: ["privacy_data", id],
    queryFn: async () => {
      if (typeof id !== 'string') return false;
      return await getProfilePrivacies(id)
    },
    enabled: !!id,
  })

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      queryClient.invalidateQueries({ queryKey: ["weight", id]});
      if (profile && session?.user.id === id) { fetchOwnPosts(); console.log("fetching user posts")}
    });

    return unsubscribe;
  }, [navigation, profile]); 

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["privacy_data", id] });
    queryClient.invalidateQueries({ queryKey: ["weight", id]});
  }, [])

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
    setPrivacyValue(profile?.private || "");
    setNameValue(profile?.name || "")
    if (profile) {
      setGoal(profile.goal || "");
      setBio(profile.bio || "");
      setAvatar(profile.avatar || "");
      setLocation(profile.location || "");
      setAchievement(profile.achievement || "");
      if (profile.age) { setAge(profile.age.toString() || ""); }
      if (profile.gender) { setGender(profile.gender || ""); }
      if (session?.user.id === id) { fetchOwnPosts(); console.log("fetching user posts")} //Need this and the navigation to work
    }
  }, [profile]);

  useEffect(() => {
  }, [isEditingProfile]);

  // Functions related to editing the profile
  const handleSave = async () => {
    try {
      if (profile) {
        // If the user has disabled the input, set the value to an empty string
        if (locationDisabled) { setLocation(""); }
        if (goalDisabled) { setGoal(""); }
        if (bioDisabled) { setBio(""); }
        if (achievementDisabled) { setAchievement(""); }
        if (ageDisabled) { setAge(""); }
        if (genderDisabled) { setGender(""); }

        await updateProfile(profile.id, goal, bio, location, achievement, privacyValues, nameValue, profile.age, gender, profile.weight);
        setIsEditingProfile(false);
        showSuccessToast(toast, "Profile updated successfully");

        // "Update" the profile with values on the frontend
        profile.location = location;
        profile.goal = goal;
        profile.bio = bio;
        profile.avatar = avatar;
        profile.achievement = achievement;
        profile.private = privacyValues;
        profile.name = nameValue;
        if (age) { profile.age = parseInt(age); }
        if (gender) { profile.gender = gender; }

        // Re-enable the inputs
        setGoalDisabled(false);
        setBioDisabled(false);
        setLocationDisabled(false);
        setAchievementDisabled(false);
        setAgeDisabled(false);
        setGenderDisabled(false);
        setWeightDisabled(false);
      }
    } catch (error) {
      console.error(error);
      showErrorToast(toast, "Failed to update profile");
    }
  };

  const saveValuesAndEditProfile = () => {
    if (profile) {
      setStoredPrivacyValues(profile.private);
      setStoredName(profile.name);
      setStoredAvatar(profile.avatar);
      setStoredLocation(profile.location);
      setStoredGoal(profile.goal);
      setStoredBio(profile.bio);
      setStoredAchievement(profile.achievement);
      if (profile.age) { setStoredAge(profile.age.toString()) }
      if (profile.gender) { setStoredGender(profile.gender) }
      if (profile.weight) { setStoredWeight(profile.weight.toString()) }
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
    setAgeDisabled(false);
    setAvatar(storedAvatar);
    setLocation(storedLocation);
    setGoal(storedGoal);
    setBio(storedBio);
    setAchievement(storedAchievement);
    setPrivacyValue(storedPrivacyValue);
    setNameValue(storedName);
    setAge(storedAge);
    if (profile && hasNoAccess() == "FALSE") {
      profile.avatar = storedAvatar;
      profile.location = storedLocation;
      profile.goal = storedGoal;
      profile.bio = storedBio;
      profile.achievement = storedAchievement;
      profile.private = storedPrivacyValue;
      profile.name = storedName;
      if (storedAge) { profile.age = parseInt(storedAge); }
      if (storedGender) { profile.gender = storedGender; }
      if (storedWeight) { profile.weight = parseInt(storedWeight); }
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

  const disableAgeInput = () => {
    setAgeDisabled(true);
    setAge("");
  }

  const disableGenderInput = () => {
    setGenderDisabled(true);
    setAge("");
  }

  const disableWeightInput = () => {
    setWeightDisabled(true);
    setAge("");
  }
  const updateName = () => {

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

  // Navigate to weight tracking page
  const navigateToWeightTracking = () => {
    router.push('/weight_tracking');
  };

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
      const file = { uri: pickerResult.assets[0].uri, name: pickerResult.assets[0].uri.split('/').pop(), type: 'image/jpeg' };

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

  const hasSpecificAccess = (parameter: string) => {
    if (!privacy_list) return false;
    if (profile?.user_id == session?.user.id || privacy_list[parameter] === "PUBLIC" || (isFriend && privacy_list[parameter] == "FRIENDS")) {
      return true
    }
    return false
  }

  const hasNoAccess = () => {
    const ret_val = {
      ret_val: "PRIVATE"
    }
    if (!privacy_list) return "PRIVATE";
    if (profile?.user_id == session?.user.id) return "FALSE";
    for (const privacy_setting in privacy_list) {
      if (privacy_setting === "posts" || privacy_setting === "friends_following") continue;
      if (hasSpecificAccess(privacy_setting)) return "FALSE";
      if (privacy_list[privacy_setting] == "FRIENDS") ret_val.ret_val = "FRIENDS";
    }
    return ret_val.ret_val;
  }

  const getPrivacyIcon = (parameter: string) => {
    if (!privacy_list) return <></>;
    if (privacy_list[parameter] === "PUBLIC") {
      return <MaterialIcons name="remove-red-eye" size={24} color="black" />
    } else if (privacy_list[parameter] === "FRIENDS") {
      return <MaterialIcons name="people" size={24} color="black" />;
    } else {
      return <MaterialIcons name="private-connectivity" size={24} className="m-0" color="black" />
    }
  }

  const fetchOwnPosts = async () => {
    try {
      const { data: postsData, error: postsError } = await supabase
      .from("post")
      .select(`
        *,
        profile:profileId (
          username,
          userId,
          name,
          avatar
        )
      `)
      .eq("profileId", profile?.id)
      .order("createdAt", { ascending: false })

      setPosts(postsData ? postsData : []);

      if (postsError) {
        throw postsError;
      }
    } catch (err) {
      console.error("Error fetching own posts:", err);
      setPostError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setPostsIsLoading(false);
    }
  }

  //Copied directly from feed
  //TODO in future sprint, define this function in a context or find a way to easily export it from somewhere else
  const updateOwnPost = async (postId: string, title: string, description: string) => {
    try {
      const { data, error } = await supabase
        .from('post')
        .update({ 
          title, 
          description,
          updatedAt: new Date().toISOString()
        })
        .eq('id', postId)
        .select();
      
      if (error) {
        throw error;
      }
      
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, title, description, updatedAt: new Date().toISOString() } 
            : post
        )
      );
      
      showSuccessToast(toast, 'Post updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating post:', error);
      showErrorToast(toast, 'Failed to update post');
      throw error;
    }
  };

  return (
    <Container className="flex px-6 py-16">
      <VStack space="md">
        <Box className="border-b border-gray-300 pb-2">
          {isPending || isFollowingPending || isFollowerPending || isPrivacyPending ? (
            <Spinner />
          )
            : profile && (
              <VStack space="lg">
                <HStack space="md">
                  {isEditingProfile ? (
                    <Pressable onPress={pickImage}>
                      <Avatar className="bg-indigo-600 mt-1" size="xl">
                        {profile.avatar ? (
                          <AvatarImage source={{ uri: profile.avatar }}></AvatarImage>
                        ) : (
                          <AvatarFallbackText className="text-white">{profile.name}</AvatarFallbackText>
                        )}
                      </Avatar>
                      <Box className="absolute b-0 t-0 bg-gray-700 p-2 rounded-full flex justify-items-center content-center">
                        <Icon as={EditIcon} color="white" size="lg" />
                      </Box>
                    </Pressable>
                  ) : (
                    <Avatar className="bg-indigo-600 mt-1" size="xl">
                      {profile.avatar ? (
                        <AvatarImage source={{ uri: profile.avatar }} />
                      ) : (
                        <AvatarFallbackText className="text-white">{profile.name}</AvatarFallbackText>
                      )}
                    </Avatar>
                  )}
                  <VStack space="xs">
                    <VStack>
                      <HStack className="text-wrap">
                        {isEditingProfile && nameValue.trim() !== "" ? (
                          <Input className="w-72 h-8">
                            <InputField value={nameValue} onChangeText={setNameValue} maxLength={30} placeholder="Required"></InputField>
                          </Input>
                        ) : isEditingProfile && nameValue.trim() === "" ? (
                          <Input isInvalid={true} className="w-72 h-8">
                            <InputField value={nameValue} onChangeText={setNameValue} maxLength={30} placeholder="Required"></InputField>
                          </Input>
                        ) : (
                          <Heading size="xl" className="mb-0 h-8 w-56">{profile.name}</Heading>
                        )}
                        {isFriend && (
                          <Badge size="md" variant="solid" action="muted" className="bg-none text-none rounded-2xl">
                            <BadgeIcon as={CheckCircleIcon} className="text-[#4d7599]"></BadgeIcon>
                            <Text className="ml-1 text-[#4d7599] text-sm">Friend</Text>
                          </Badge>
                        )}
                      </HStack>
                      <Text size="sm">@{profile.username}</Text>
                    </VStack>
                    <HStack space="2xl">
                      <Pressable onPress={hasSpecificAccess("friends_following") ? (() => router.replace(`/relations/${id}?type=friends`)) : (() => { })}>
                        <VStack>
                          <Heading size="lg" className="text-center">{profile.friends}</Heading>
                          <Text size="sm" className="text-center">friends</Text>
                        </VStack>
                      </Pressable>
                      <Pressable onPress={hasSpecificAccess("friends_following") ? (() => router.replace(`/relations/${id}?type=followers`)) : (() => { })}>
                        <VStack>
                          <Heading size="lg" className="text-center">{profile.followers}</Heading>
                          <Text size="sm" className="text-center">followers</Text>
                        </VStack>
                      </Pressable>
                      <Pressable onPress={hasSpecificAccess("friends_following") ? (() => router.replace(`/relations/${id}?type=following`)) : (() => { })}>
                        <VStack>
                          <Heading size="lg" className="text-center">{profile.following}</Heading>
                          <Text size="sm" className="text-center">following</Text>
                        </VStack>
                      </Pressable>
                      {isEditingProfile && getPrivacyIcon("friends_following")}
                    </HStack>
                  </VStack>
                  {userId === id && !isEditingProfile && (
                    <Button onPress={() => router.replace("/settings")} className="w-0 h-0">
                      <Icon as={MenuIcon} size="xl" className="mt-8 ml-8 w-8 h-8"></Icon>
                    </Button>
                  )}
                </HStack>
                <VStack>
                  {isEditingProfile && (
                    <Box className="p-2 border rounded border-gray-300">
                      <Button variant="solid" size="xl" action="kova" className="mt-5 mb-5 ml-5 mr-5"
                        onPress={() => { router.replace("/privacy-editing") }}>
                        <ButtonText>
                          Edit Privacy Settings
                        </ButtonText>
                      </Button>
                    </Box>
                  )}
                  {hasNoAccess() == "FALSE" && (isEditingProfile || (profile.location || profile.goal || profile.bio || profile.age)) ? (
                    <Box className="border border-gray-300 rounded p-2 mt-2">
                      {isEditingProfile && !ageDisabled ? (
                        <HStack className="mr-7">
                          <Heading size="md" className="mr-1 mt-3">🎂:</Heading>
                          <Input variant="outline" className="mt-2 w-11/12 mr-0.5">
                            <InputField id="AgeInput" value={age} onChangeText={(text: string) => { if (text != "" && /^[0-9]+$/.test(text)) { setAge(text) } else { setAge("") } }} maxLength={3} placeholder="Age"></InputField>
                            <InputSlot>
                              <Pressable onPress={disableAgeInput}>
                                <InputIcon as={TrashIcon} className="mr-2 bg-none"></InputIcon>
                              </Pressable>
                            </InputSlot>
                          </Input>
                          {getPrivacyIcon("age")}
                        </HStack>
                      ) : profile.age && hasSpecificAccess("age") && !ageDisabled && age != "" && (
                        <HStack className="text-wrap">
                          <Heading size="md" className="mr-1">🎂:</Heading>
                          <View className="w-11/12">
                            <Heading size="md">{profile.age}</Heading>
                          </View>
                        </HStack>
                      )}
                      {isEditingProfile && !genderDisabled ? (
                        <HStack className="mr-7">
                          <Heading size="md" className="mr-1 mt-3">🚻:</Heading>
                          <Input variant="outline" className="mt-2 w-11/12 mr-0.5">
                            <InputField id="GenderInput" value={gender} onChangeText={(text: string) => { setGender(text) }} maxLength={15} placeholder="Gender"></InputField>
                            <InputSlot>
                              <Pressable onPress={disableGenderInput}>
                                <InputIcon as={TrashIcon} className="mr-2 bg-none"></InputIcon>
                              </Pressable>
                            </InputSlot>
                          </Input>
                          {getPrivacyIcon("gender")}
                        </HStack>
                      ) : profile.gender && hasSpecificAccess("gender") && !genderDisabled && gender != "" && (
                        <HStack className="text-wrap">
                          <Heading size="md" className="mr-1">🚻:</Heading>
                          <View className="w-11/12">
                            <Heading size="md">{profile.gender}</Heading>
                          </View>
                        </HStack>
                      )}
                      {!isEditingProfile && weight && hasSpecificAccess("weight") && !weightDisabled && !weightIsPending && weight != "" && (
                        <HStack className="text-wrap">
                          <Heading size="md" className="mr-1">⚖️:</Heading>
                          <View className="w-11/12">
                            <Heading size="md">{weight}</Heading>
                          </View>
                        </HStack>
                      )}
                      {isEditingProfile && !locationDisabled ? (
                        <HStack className="mr-7">
                          <Heading size="md" className="mr-1 mt-3">📍:</Heading>
                          <Input size="md" variant="outline" className="mt-2 w-11/12 mr-0.5">
                            <InputField id="locationInput" value={location} onChangeText={setLocation} maxLength={40} placeholder="Add your town or city..."></InputField>
                            <InputSlot>
                              <Pressable onPress={disableLocationInput}>
                                <InputIcon as={TrashIcon} className="mr-2 bg-none"></InputIcon>
                              </Pressable>
                            </InputSlot>
                          </Input>
                          {getPrivacyIcon("location")}
                        </HStack>
                      ) : profile.location && !locationDisabled && hasSpecificAccess("location") && (
                        <HStack className="text-wrap">
                          <Heading size="md" className="mr-1">📍:</Heading>
                          <View className="w-11/12">
                            <Heading size="md">{profile.location}</Heading>
                          </View>
                        </HStack>
                      )}
                      {isEditingProfile && !achievementDisabled ? (
                        <HStack className="mr-7">
                          <Heading size="md" className="mr-1 mt-3">🏆:</Heading>
                          <Input size="md" variant="outline" className="mt-2 w-11/12 mr-0.5">
                            <InputField id="achievementInput" value={achievement} onChangeText={setAchievement} maxLength={40} placeholder="Write something you're proud of..."></InputField>
                            <InputSlot>
                              <Pressable onPress={disableAchievementInput}>
                                <InputIcon as={TrashIcon} className="mr-2 bg-none"></InputIcon>
                              </Pressable>
                            </InputSlot>
                          </Input>
                          {getPrivacyIcon("achievement")}
                        </HStack>
                      ) : profile.achievement && !achievementDisabled && hasSpecificAccess("achievement") && (
                        <HStack className="text-wrap">
                          <Heading size="md" className="mr-1">🏆:</Heading>
                          <View className="w-11/12">
                            <Heading size="md">{profile.achievement}</Heading>
                          </View>
                        </HStack>
                      )}
                      {isEditingProfile && !goalDisabled ? (
                        <HStack className="mr-7">
                          <Heading size="md" className="mr-1 mt-3">🎯:</Heading>
                          <Input size="md" variant="outline" className="mt-2 w-11/12 mr-0.5">
                            <InputField id="goalInput" value={goal} onChangeText={setGoal} maxLength={40} placeholder="Write your next big goal..."></InputField>
                            <InputSlot>
                              <Pressable onPress={disableGoalInput}>
                                <InputIcon as={TrashIcon} className="mr-2 bg-none"></InputIcon>
                              </Pressable>
                            </InputSlot>
                          </Input>
                          {getPrivacyIcon("goal")}
                        </HStack>
                      ) : profile.goal && !goalDisabled && hasSpecificAccess("goal") && (
                        <HStack className="text-wrap">
                          <Heading size="md" className="mr-1">🎯:</Heading>
                          <View className="w-11/12">
                            <Heading size="md">{profile.goal}</Heading>
                          </View>
                        </HStack>
                      )}
                      {isEditingProfile ? (
                        <Textarea className="text-wrap mt-2">
                          <TextareaInput id="bioInput" value={bio} onChangeText={setBio} maxLength={300} placeholder="Write some information about yourself..."></TextareaInput>
                          {getPrivacyIcon("bio")}
                        </Textarea>
                      ) : profile.bio && hasSpecificAccess("bio") && (
                        <Text className="mt-2">{profile.bio}</Text>
                      )}
                    </Box>
                  ) : profile && (
                    <Badge size="md" variant="solid" action="muted" className="bg-none text-none rounded-2xl">
                      <BadgeIcon as={AlertCircleIcon} className="text-[#4d7599]"></BadgeIcon>
                      {hasNoAccess() == "FRIENDS" ? (
                        <Text className="ml-1 text-[#4d7599] text-sm">This user's profile is only visible to friends</Text>
                      ) : (
                        <Text className="ml-1 text-[#4d7599] text-sm">This user's profile is private</Text>
                      )}
                    </Badge>
                  )}
                </VStack>
                {userId === id && isEditingProfile ? (
                  <HStack>
                    <Button size="lg" variant="solid" action="primary" className="bg-[#db5b4d] mr-2 flex-auto" onPress={cancelEdits}>
                      <ButtonText className="text-white">Cancel</ButtonText>
                    </Button>
                    {nameValue.trim() !== "" ? (
                      <Button size="lg" variant="solid" action="primary" className="bg-[#397a2c] flex-auto" onPress={saveAndSetEditingProfile}>
                        <ButtonText className="text-white">Save</ButtonText>
                      </Button>
                    ) : (
                      <Button isDisabled={true} size="lg" variant="solid" action="primary" className="bg-[#397a2c] flex-auto" onPress={saveAndSetEditingProfile}>
                        <ButtonText className="text-white">Save</ButtonText>
                      </Button>
                    )}
                  </HStack>
                ) : userId === id ? (
                  <VStack space="md">
                    <Button size = "lg" variant = "outline" action = "primary" className = "border-[#6FA8DC]" onPress={saveValuesAndEditProfile}>
                      <ButtonText className = "text-[#6FA8DC]">Edit Profile</ButtonText>
                    </Button>
                    <Button size = "lg" variant = "outline" action = "primary" className = "border-[#6FA8DC]" onPress={navigateToWeightTracking}>
                      <ButtonText className = "text-[#6FA8DC]">Weight Tracking</ButtonText>
                    </Button>
                  </VStack>
                  
                ) : isFollowing ? (
                  <Button size="lg" variant="outline" action="secondary" className="border-[#6FA8DC]" onPress={unfollowProfile}>
                    <ButtonText className="text-[#6FA8DC]">Unfollow</ButtonText>
                  </Button>
                ) : (
                  <Button size="lg" variant="solid" action="primary" className="bg-[#6FA8DC]" onPress={followProfile}>
                    <ButtonText className="text-white">Follow</ButtonText>
                  </Button>
                )}
              </VStack>
            )}
        </Box>
        { profile && id === session?.user.id && (
          <ProfileActivities posts={posts as Post[]} isLoading={postsIsLoading} updatePostFunc={updateOwnPost}></ProfileActivities>
        )}
      </VStack>
    </Container>
  );
}