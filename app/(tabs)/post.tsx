import Container from "@/components/Container";
import { useSession } from "@/components/SessionContext";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button, ButtonIcon } from "@/components/ui/button";
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator
} from "@/components/ui/checkbox";
import { HStack } from "@/components/ui/hstack";
import {
  AddIcon,
  CheckIcon,
  CircleIcon,
  CloseIcon,
  Icon
} from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Input, InputField } from "@/components/ui/input";
import {
  Radio,
  RadioGroup,
  RadioIcon,
  RadioIndicator,
  RadioLabel,
} from "@/components/ui/radio";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { postStyles, SummaryWorkoutData } from "@/components/WorkoutData";
import { supabase } from "@/lib/supabase";
import { uploadPostImages } from "@/services/postServices";
import { getFriends } from "@/services/profileServices";
import { addWeightEntry } from "@/services/weightServices";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  TouchableOpacity,
  View
} from "react-native";

const defaultWorkoutData = {
  duration: "0 minutes",
  calories: "0 kcal",
  exercises: [],
};

export default function PostScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [weighIn, setWeighIn] = useState(Number);
  const [includeWorkoutData, setIncludeWorkoutData] = useState(true);
  const [workoutData, setWorkoutData] = useState<any>(defaultWorkoutData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taggedFriends, setTaggedFriends] = useState<string[]>([]);
  const [showFriendSelector, setShowFriendSelector] = useState(false);
  const [friendSearch, setFriendSearch] = useState("");
  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [postPrivacy, setPostPrivacy] = useState("PUBLIC");

  const { session } = useSession();
  const userId = session?.user?.id || null;

  const toast = useToast();

  const params = useLocalSearchParams();

  const [images, setImages] = useState<String[]>([]);

  const { data: friends, isLoading: isLoadingFriends } = useQuery({
    queryKey: ["friends", userId],
    queryFn: async () => {
      if (!userId) return [];
      return await getFriends(userId);
    },
    enabled: !!userId,
  });

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        console.log("Direct Supabase user ID:", data.session.user.id);
      } else {
        console.log("No active session found directly from Supabase");
      }
    };

    checkSession();

    const workoutDataParam =
      params.workoutData ||
      (params.params && JSON.parse(params.params as string).workoutData);

    if (workoutDataParam) {
      try {
        const parsedData = JSON.parse(workoutDataParam as string);
        // Check for template ID

        const processedWorkoutData = {
          duration: parsedData.duration || "0 minutes",
          calories: "0 kcal",
          exercises: [],
          templateId: parsedData.templateId || null, // Store template ID if present
        };

        if (parsedData.stats) {
          if (typeof parsedData.stats.totalReps === "number") {
            processedWorkoutData.calories = `${Math.round(
              parsedData.stats.totalReps * 0.5
            )} kcal`;
          }
        }

        if (parsedData.exercises && Array.isArray(parsedData.exercises)) {
          processedWorkoutData.exercises = parsedData.exercises.map(
            (exercise: any) => {
              let totalReps = 0;
              let lastWeight = 0;

              if (Array.isArray(exercise.sets)) {
                totalReps = exercise.sets.reduce((acc: number, set: any) => {
                  if (set.weight) lastWeight = set.weight;
                  return acc + (set.reps || 0);
                }, 0);
              }

              return {
                name: exercise.info?.name || "Unknown Exercise",
                sets: Array.isArray(exercise.sets) ? exercise.sets.length : 0,
                reps: totalReps,
                weight: `${lastWeight} lbs`,
              };
            }
          );
        }

        setWorkoutData(processedWorkoutData);
        console.log("Processed workout data:", processedWorkoutData);
        setIncludeWorkoutData(true);

        if (
          parsedData.exercises &&
          Array.isArray(parsedData.exercises) &&
          parsedData.exercises.length > 0
        ) {
          try {
            const exerciseNames = parsedData.exercises
              .filter((ex: any) => ex.info && ex.info.name)
              .map((ex: any) => ex.info.name)
              .slice(0, 2);

            if (exerciseNames.length > 0) {
              setTitle(`${exerciseNames.join(" & ")} Workout`);
            } else {
              setTitle("My Workout");
            }
          } catch (titleError) {
            console.error("Error generating title:", titleError);
            setTitle("My Workout");
          }
        } else {
          setTitle("My Workout");
        }
      } catch (error) {
        console.error("Error parsing workout data:", error);
        setWorkoutData(defaultWorkoutData);
        setTitle("My Workout");
      }
    } else {
      setWorkoutData(defaultWorkoutData);
    }
  }, [session, userId, params.workoutData]);

  const toggleFriend = (friendId: string) => {
    setTaggedFriends((prev) => {
      if (prev.includes(friendId)) {
        return prev.filter((id) => id !== friendId);
      } else {
        return [...prev, friendId];
      }
    });
  };

  const validateText = (text: string): boolean => {
    const illegalCharactersRegex = /[<>{}[\]\\^~|`]/g;
    return !illegalCharactersRegex.test(text);
  };

  const handleTitleChange = (text: string) => {
    setTitle(text);
    if (!validateText(text)) {
      setTitleError("Title contains illegal characters");
    } else {
      setTitleError("");
    }
  };

  const handleDescriptionChange = (text: string) => {
    setDescription(text);
    if (!validateText(text)) {
      setDescriptionError("Description contains illegal characters");
    } else {
      setDescriptionError("");
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    console.log("Final workout data being submitted:", workoutData);

    const illegalCharactersRegex = /[<>{}[\]\\^~|`]/g;

    if (illegalCharactersRegex.test(title)) {
      Alert.alert(
        "Invalid Title",
        "Your title contains illegal characters. Please remove special characters like < > { } [ ] \\ ^ ~ | `"
      );
      return;
    }

    if (illegalCharactersRegex.test(description)) {
      Alert.alert(
        "Invalid Description",
        "Your description contains illegal characters. Please remove special characters like < > { } [ ] \\ ^ ~ | `"
      );
      return;
    }

    if (illegalCharactersRegex.test(location)) {
      Alert.alert(
        "Invalid Location",
        "Your location contains illegal characters. Please remove special characters like < > { } [ ] \\ ^ ~ | `"
      );
      return;
    }

    if (!title.trim()) {
      Alert.alert("Missing Title", "Please enter a title for your post");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("User ID from session:", userId);
      if (!userId) {
        throw new Error("You must be logged in to create a post");
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profile")
        .select("id")
        .eq("userId", userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw new Error(`Failed to get profile: ${profileError.message}`);
      }

      if (!profileData) {
        throw new Error("Profile not found for the current user");
      }

      const profileId = profileData.id;

      const files = images.map((uri, index) => {
        const fileName = uri.split("/").pop() || `image_${index}`;
        const fileType = uri.split(".").pop() || "jpeg";
        return {
          uri: uri.toString(),
          name: fileName,
          type: `image/${fileType}`,
        } as unknown as File;
      });

      const imageURLs = await uploadPostImages(userId, files);

      const postData = {
        profileId: profileId,
        title,
        description,
        location: location || null,
        privacy: postPrivacy,
        imageUrl: null,
        workoutData: includeWorkoutData ? workoutData : null,
        template_id:
          includeWorkoutData && workoutData.templateId
            ? workoutData.templateId
            : null,
        taggedFriends: taggedFriends.length > 0 ? taggedFriends : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        images: imageURLs,
        weighIn: weighIn,
      };

      const { data, error } = await supabase
        .from("post")
        .insert(postData)
        .select();

      if (error) {
        console.error("Supabase insert error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log("Post created successfully:", data);
      if (weighIn > 0) {
        await addWeightEntry({
          user_id: userId,
          weight: weighIn,
          unit: "lbs",
          date: new Date().toISOString(),
        });
      }

      Alert.alert(
        "Post Created",
        "Your workout has been posted successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              router.push("/(tabs)/feed");
            },
          },
        ]
      );

      setTitle("");
      setDescription("");
      setLocation("");
      setImages([]);
      setWeighIn(-1);
      setPostPrivacy("PUBLIC");
      setIncludeWorkoutData(true);
      setWorkoutData(defaultWorkoutData);
      setTaggedFriends([]);
    } catch (error: any) {
      console.error("Error creating post:", error);
      Alert.alert(
        "Error",
        `Failed to create post: ${error.message || "Unknown error"}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFriends =
    friends?.filter((friend) =>
      friend.name.toLowerCase().includes(friendSearch.toLowerCase())
    ) || [];

  // Image upload functionality
  const showImageSelector = async () => {
    const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (result.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      const files: String[] = pickerResult.assets.map((asset) => {
        return asset.uri;
      });

      const unionFiles = Array.from(new Set([...images, ...files]));

      setImages(unionFiles);
    }
  };

  const handleRemoveImage = (uri: string) => {
    setImages((prevImages) => prevImages.filter((image) => image !== uri));
  };

  return (
    <ScrollView style={postStyles.scrollView}>
      <Container>
        <View style={postStyles.header}>
          <Text style={postStyles.headerTitle} size="xl" bold>
            Create Post
          </Text>
        </View>

        <VStack space="md" style={postStyles.formContainer}>
          <VStack space="xs">
            <Text size="sm" bold>
              Title
            </Text>
            <Input variant="outline" isInvalid={!!titleError}>
              <InputField
                placeholder="Enter a title for your post"
                value={title}
                onChangeText={handleTitleChange}
              />
            </Input>
            {titleError ? (
              <Text style={postStyles.errorText}>{titleError}</Text>
            ) : null}
          </VStack>

          <VStack space="xs">
            <Text size="sm" bold>
              Description
            </Text>
            <Textarea isInvalid={!!descriptionError}>
              <TextareaInput
                placeholder="Share details about your workout..."
                value={description}
                onChangeText={handleDescriptionChange}
              />
            </Textarea>
            {descriptionError ? (
              <Text style={postStyles.errorText}>{descriptionError}</Text>
            ) : null}
          </VStack>

          <VStack space="xs">
            <HStack style={postStyles.toggleContainer} space="md">
              <Text size="sm" bold>
                Include Workout Data
              </Text>
              <Switch
                value={includeWorkoutData}
                onValueChange={setIncludeWorkoutData}
                size="md"
              />
            </HStack>
          </VStack>

          {includeWorkoutData && (
            <SummaryWorkoutData workoutData={workoutData}></SummaryWorkoutData>
          )}

          <VStack space="xs">
            <HStack style={postStyles.toggleContainer} space="md">
              <Text size="sm" bold>
                Tag Friends
              </Text>
              <Button
                size="sm"
                variant="outline"
                onPress={() => setShowFriendSelector(!showFriendSelector)}
              >
                <Text>{showFriendSelector ? "Hide" : "Select Friends"}</Text>
              </Button>
            </HStack>

            {taggedFriends.length > 0 && (
              <HStack
                style={postStyles.selectedFriendsContainer}
                space="sm"
                className="flex-wrap"
              >
                {taggedFriends.map((friendId) => {
                  const friend = friends?.find((f) => f.userId === friendId);
                  return friend ? (
                    <HStack
                      key={friendId}
                      style={postStyles.selectedFriendChip}
                      space="xs"
                      className="items-center"
                    >
                      <Avatar size="xs">
                        {friend.avatar ? (
                          <AvatarImage source={{ uri: friend.avatar }} />
                        ) : (
                          <AvatarFallbackText>{friend.name}</AvatarFallbackText>
                        )}
                      </Avatar>
                      <Text size="xs">{friend.name}</Text>
                      <TouchableOpacity onPress={() => toggleFriend(friendId)}>
                        <Ionicons name="close-circle" size={16} color="#666" />
                      </TouchableOpacity>
                    </HStack>
                  ) : null;
                })}
              </HStack>
            )}

            {showFriendSelector && (
              <VStack style={postStyles.friendSelectorContainer} space="sm">
                <Input variant="outline">
                  <InputField
                    placeholder="Search friends..."
                    value={friendSearch}
                    onChangeText={setFriendSearch}
                  />
                </Input>

                {isLoadingFriends ? (
                  <Text>Loading friends...</Text>
                ) : filteredFriends.length === 0 ? (
                  <Text>No friends found</Text>
                ) : (
                  <ScrollView
                    style={postStyles.friendsList}
                    nestedScrollEnabled={true}
                  >
                    {filteredFriends.map((friend) => (
                      <HStack
                        key={friend.userId}
                        style={postStyles.friendItem}
                        space="md"
                        className="items-center"
                      >
                        <Checkbox
                          value="checked"
                          isChecked={taggedFriends.includes(friend.userId)}
                          onChange={() => toggleFriend(friend.userId)}
                        >
                          <CheckboxIndicator>
                            <CheckboxIcon as={CheckIcon} />
                          </CheckboxIndicator>
                        </Checkbox>
                        <Avatar size="sm">
                          {friend.avatar ? (
                            <AvatarImage source={{ uri: friend.avatar }} />
                          ) : (
                            <AvatarFallbackText>
                              {friend.name}
                            </AvatarFallbackText>
                          )}
                        </Avatar>
                        <Text>{friend.name}</Text>
                      </HStack>
                    ))}
                  </ScrollView>
                )}
              </VStack>
            )}
          </VStack>
          <VStack space="xs">
            <Text size="sm" bold>
              Pictures
            </Text>
            <ScrollView horizontal>
              <HStack space="md">
                {images.map((file, index) => (
                  <View key={index} style={{ position: "relative" }}>
                    {/* Image */}
                    <Image
                      source={{ uri: file.toString() }}
                      style={{ width: 100, height: 100, borderRadius: 8 }}
                    />
                    {/* 'X' Icon */}
                    <TouchableOpacity
                      style={{
                        position: "absolute",
                        top: 2,
                        right: 2,
                        borderRadius: 12,
                        padding: 0,
                        opacity: 0.6,
                      }}
                      onPress={() => handleRemoveImage(file.toString())}
                    >
                      <Icon as={CloseIcon}></Icon>
                    </TouchableOpacity>
                  </View>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  style={{ width: 70, height: 70, borderRadius: 8 }}
                  onPress={() => showImageSelector()}
                >
                  <ButtonIcon as={AddIcon}></ButtonIcon>
                </Button>
              </HStack>
            </ScrollView>
          </VStack>
          <VStack space="xs">
            <Text size="sm" bold>
              Location
            </Text>
            <Input variant="outline">
              <InputField
                placeholder="Add location (optional)"
                value={location}
                onChangeText={setLocation}
              />
            </Input>
          </VStack>
          <VStack space="xs">
            <HStack space="sm">
              <Text size="sm" className="mt-2 mr-28" bold>
                Weigh-in (optional)
              </Text>
              <Input variant="outline" className="w-20">
                <InputField
                  placeholder=""
                  value={weighIn > 0 ? weighIn.toString() : ""}
                  onChangeText={(text) => setWeighIn(Number(text) || -1)}
                  keyboardType="numeric"
                  className="text-center"
                />
              </Input>
              <Text className="mt-2">lbs</Text>
            </HStack>
          </VStack>
          <VStack space="xs">
            <Text size="sm" className="mb-1" bold>
              Post Privacy
            </Text>
            <RadioGroup value={postPrivacy} onChange={setPostPrivacy}>
              <HStack space="md">
                <Radio value="PRIVATE" isInvalid={false} isDisabled={false}>
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon}></RadioIcon>
                  </RadioIndicator>
                  <RadioLabel>Private</RadioLabel>
                </Radio>
                <Radio value="FOLLOWERS" isInvalid={false} isDisabled={false}>
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon}></RadioIcon>
                  </RadioIndicator>
                  <RadioLabel>Followers</RadioLabel>
                </Radio>
                <Radio value="FRIENDS" isInvalid={false} isDisabled={false}>
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon}></RadioIcon>
                  </RadioIndicator>
                  <RadioLabel>Friends</RadioLabel>
                </Radio>
                <Radio value="PUBLIC" isInvalid={false} isDisabled={false}>
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon}></RadioIcon>
                  </RadioIndicator>
                  <RadioLabel>Public</RadioLabel>
                </Radio>
              </HStack>
            </RadioGroup>
            {postPrivacy === "PUBLIC" ? (
              <Text size="xs" style={postStyles.privacyHint}>
                Public posts can be seen by everyone
              </Text>
            ) : postPrivacy === "FRIENDS" ? (
              <Text size="xs" style={postStyles.privacyHint}>
                Friends posts can only be seen by your friends
              </Text>
            ) : postPrivacy === "FOLLOWERS" ? (
              <Text size="xs" style={postStyles.privacyHint}>
                Followers posts can only be seen by your followers
              </Text>
            ) : (
              postPrivacy === "PRIVATE" && (
                <Text size="xs" style={postStyles.privacyHint}>
                  Private posts are only visible to you
                </Text>
              )
            )}
          </VStack>

          <Button
            size="lg"
            action="kova"
            variant="solid"
            onPress={handleSubmit}
            isDisabled={isSubmitting || !!titleError || !!descriptionError}
            style={postStyles.submitButton}
            disabled={isSubmitting}
          >
            <Text style={postStyles.buttonText} bold>
              {isSubmitting ? "Posting..." : "Post Workout"}
            </Text>
          </Button>
        </VStack>
      </Container>
    </ScrollView>
  );
}
