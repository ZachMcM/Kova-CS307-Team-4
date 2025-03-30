import React, { useEffect, useState } from "react";
import { ScrollView, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { View, TextInput } from "react-native";
import { Avatar, AvatarFallbackText, AvatarImage } from "@/components/ui/avatar";
import { Post, formatDate } from "@/app/(tabs)/feed";
import { Exercise } from "@/components/WorkoutPost";
import { showErrorToast } from "@/services/toastServices";
import { useToast } from "@/components/ui/toast";
import Container from "@/components/Container";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { ChevronLeftIcon, ClockIcon, Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Spinner } from "@/components/ui/spinner";
import { Heading } from "@/components/ui/heading";
import { Image } from "@/components/ui/image";
import { Box } from "@/components/ui/box";
import { Ionicons } from "@expo/vector-icons";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Button, ButtonText } from "@/components/ui/button";

type Comment = {
  id: string;
  created_at: string;
  userId: string;
  postId: string;
  content: string;
}

export default function PostDetails() {
  const router = useRouter();
  const toast = useToast();
  const { id: postId } = useLocalSearchParams();
  const [post, setPost] = useState<Post>();
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>();
  const [commentValue, setCommentValue] = useState("");

  const fetchPostDetails = async () => {
    try {
      setIsLoading(true);
      
      const { data } = await supabase
        .from("post")
        .select(`*, profile:profileId ( username, userId, name, avatar )`)
        .eq("id", postId)
        .single();

      const fetchedPost: Post = {
        id: data.id,
        profileId: data.profileId,
        title: data.title,
        description: data.description,
        location: data.location,
        privacy: data.privacy,
        images: data.images || [],
        weighIn: data.weighIn,
        workoutData: data.workoutData
          ? {
              ...data.workoutData,
              exercises: data.workoutData.exercises as Exercise[], // Cast to Exercise[]
            }
          : null,
        taggedFriends: data.taggedFriends || [],
        taggedFriendsData: data.taggedFriendsData || [],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        profile: data.profile || null,
        comments: data.comments
      };

      const postWithTaggedFriends = async (post: Post) => {
        if (post.taggedFriends && post.taggedFriends.length > 0) {
          const { data: friendsData, error: friendsError } = await supabase
            .from('profile')
            .select('userId, name, avatar')
            .in('userId', post.taggedFriends);
            
          if (!friendsError && friendsData) {
            post.taggedFriendsData = friendsData;
          }
        }
        setPost(post);
      };

      postWithTaggedFriends(fetchedPost);

      const { data: commentData } = await supabase
        .from('comment')
        .select('*')
        .eq("postId", postId)
        .order("created_at", { ascending: false });

      setComments(commentData as Comment[]);
    } catch (err) {
      showErrorToast(toast, "Error: Could not fetch post!")
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchPostDetails();
    }
  }, [postId]);

  return (
    <Container className = "flex px-6 py-16 mb-12">
      <VStack>
        <Pressable onPress = {() => router.replace("/feed")} className = "pb-2 border-b border-gray-300 mb-4">
          <HStack>
            <Icon as = {ChevronLeftIcon} className = "h-8 w-8"></Icon>
            <Text size = "2xl">Feed</Text>
          </HStack>
        </Pressable>
        {isLoading && !post ? (
          <Spinner />
        ) : !isLoading && !post ? (
          <Text className = "text-red-600">Oops... There was an error fetching the post!</Text>
        ) : post && post.profile && (
          <VStack>
            <HStack className = "mb-2">
              <Pressable onPress = {() => {post.profile && router.replace(`/profiles/${post.profile.userId}`)}}>
                <Avatar>
                  {post.profile.avatar ? (
                    <AvatarImage source = {{uri: post.profile.avatar}}></AvatarImage>
                  ) : (
                    <AvatarFallbackText className = "text-white">{post.profile.name}</AvatarFallbackText>
                  )}
                </Avatar>
              </Pressable>
              <VStack className = "ml-2">
                <HStack space="sm">
                  <Heading>{post.profile.name}</Heading>
                  <Text size="sm" className="mt-1">
                    (@{post.profile.username})
                  </Text>
                </HStack>
                <Text size = "sm">{formatDate(post.createdAt)}</Text>
              </VStack>
            </HStack>
            {/* Title, Tagged Friends, and Description */}
            <Text className = "font-bold text-wrap text-2xl mb-1">{post.title}</Text>
            {post.taggedFriends && post.taggedFriends.length > 0 && (
              <HStack>
                <Text>With </Text>
                {post.taggedFriendsData?.map((friend, index) => (
                  <Pressable
                    key={friend.userId}
                    onPress={() => {
                      router.replace(`/profiles/${friend.userId}`);
                    }}
                  >
                    <HStack space = "xs">
                      <Avatar size = "xs" className="bg-indigo-600">
                        {friend.avatar ? (
                          <AvatarImage source={{ uri: friend.avatar }}></AvatarImage>
                        ) : ( 
                          <AvatarFallbackText className="text-white">{friend.name}</AvatarFallbackText>
                        )}
                      </Avatar>
                      <Text className="font-bold text-blue-500">
                        {friend.name}
                        {post.taggedFriends && index < post.taggedFriends.length - 1 ? ", " : ""}
                      </Text>
                    </HStack>
                  </Pressable>
                ))}
              </HStack>
            )}
            {post.location && (
              <Text size = "md" className = "mt-1" bold>📍 {post.location}</Text>
            )}
            {post.description.length > 0 ? (
              <Text size = "md" className = "text-wrap mt-2">{post.description}</Text>
            ) : (<></>)}
            {/* Images */}
            {post.images && post.images.length > 0 ? (
              <ScrollView horizontal className = "mb-4 mt-4">
                <HStack space = "md">
                  {post.images.map((url, index) => (
                    <Image
                      key={index}
                      size = "2xl"
                      source={{ uri: url }}
                      className = "rounded-2xl"
                      alt = "false"
                    />
                  ))}
                </HStack>
              </ScrollView>
            ) : (
              <></>
            )}
            {/* Exercise Details */}
            {post.workoutData?.exercises && post.workoutData?.exercises?.length > 0 && (
              <VStack>
                <Text size="lg" bold>
                  Exercise Details
                </Text>
                <HStack space = "xs" className = "h-16 w-full mb-2 mt-2 border border-gray-300 rounded">
                  {post.workoutData?.duration && (
                    <Box className="flex-1 h-full justify-center items-center">
                      <Text size="md">Duration</Text>
                      <HStack space = "xs">
                        <Text size = "lg" bold>{post.workoutData.duration}</Text>
                      </HStack>
                    </Box>
                  )}
                  {post.workoutData?.calories && (
                    <Box className="flex-1 h-full justify-center items-center">
                      <Text size="md">Calories</Text>
                      <HStack>
                        <Text size = "lg" bold>{post.workoutData.calories}</Text>
                        <Ionicons name="flame-outline" size={22} color="#FF9500"/>
                      </HStack>
                    </Box>
                  )}
                  {post.weighIn && (
                    <Box className="flex-1 h-full justify-center items-center">
                      <Text size="md">Weigh-In</Text>
                      <HStack>
                        <Text size = "lg" bold>{post.weighIn} lbs</Text>
                      </HStack>
                    </Box>
                  )}
                </HStack>
                {post.workoutData.exercises.reduce((rows, exercise, index) => {
                  if (index % 2 === 0) {
                    rows.push([exercise]);
                  } else {
                    rows[rows.length - 1].push(exercise);
                  }
                  return rows;
                }, [] as Exercise[][]).map((row, rowIndex) => (
                  <HStack key={rowIndex} space="xs" className="w-full mb-2">
                    {row.map((exercise, index) => (
                      <Box key={index} className="flex-1 rounded border border-gray-300 p-2">
                        <Text className="font-bold">{exercise.name}</Text>
                        <View>
                          {exercise.sets !== undefined && (
                            <Text>
                              <Text>Sets: </Text>
                              <Text>{String(exercise.sets)}</Text>
                            </Text>
                          )}
                          {exercise.reps !== undefined && (
                            <Text>
                              <Text>Reps: </Text>
                              <Text>{String(exercise.reps)}</Text>
                            </Text>
                          )}
                          {exercise.weight && (
                            <Text>
                              <Text>Weight: </Text>
                              <Text>{exercise.weight}</Text>
                            </Text>
                          )}
                        </View>
                      </Box>
                    ))}
                    {/* Add an empty box if there is only one exercise in the row */}
                    {row.length === 1 && <Box className="flex-1 p-2" />}
                  </HStack>
                ))}
              </VStack>
            )}
          </VStack>
        )}
        <VStack className = "pb-3 border-b border-gray-300">
          <Text size="lg" className = "mb-2" bold>Comments ({post?.comments})</Text>
          <Box className="rounded p-2 border border-[#6FA8DC]">
            <VStack>
              <TextInput maxLength={500} 
                  placeholder="Add comment..." 
                  className="p-0 m-0 ml-1 text-lg"
                  value={commentValue}
                  onChangeText={setCommentValue}
                  style={{ minHeight: 40, maxHeight: 200, overflow: 'hidden' }}
                  multiline
                  numberOfLines={4}>
              </TextInput>

              <HStack space = "sm">
                <Box className = "border rounded-3xl mt-4 p-1 border-gray-300">
                  <Text size = "sm" className="flex-row font-bold text-gray-500">
                    {commentValue.length}/500
                  </Text>
                </Box>
                <Box className = "flex-1"></Box>
                <Button className="bg-[#6FA8DC] mt-2 rounded-3xl">
                  <ButtonText className="text-white font-bold">Submit</ButtonText>
                </Button>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </VStack>
    </Container>
  );
}
